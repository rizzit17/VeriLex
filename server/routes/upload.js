import { Router } from "express";
import multer from "multer";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/legacy/build/pdf.mjs";
import { fileURLToPath, pathToFileURL } from "url";
import { dirname, join } from "path";
import { analyzeDocument } from "../services/gemini.js";
import { addHistoryEntry, getAllHistory } from "../utils/history.js";

// ── Worker setup ──────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const workerPath = join(__dirname, "../node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs");
GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).href;

const router = Router();

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;  // 20 MB
const MIN_TEXT_LENGTH = 30;                 // chars — below this it's not a real document
const MAX_TEXT_LENGTH = 90_000;             // chars — cap before sending to Claude
const CLAUDE_TIMEOUT_MS = 60_000;             // 60 s timeout for AI call
const PDF_TIMEOUT_MS = 30_000;             // 30 s timeout for PDF parsing
const ALLOWED_MIMETYPES = new Set(["application/pdf"]);
const ALLOWED_EXTENSIONS = new Set([".pdf"]);

// ── Error factory ─────────────────────────────────────────────────────────────

function apiError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// ── Consistent error responder ────────────────────────────────────────────────

function sendError(res, status, message) {
  if (res.headersSent) return;
  return res.status(status).json({ success: false, error: message });
}

// ── Multer ────────────────────────────────────────────────────────────────────

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
    files: 1,
    fields: 0,
  },
  fileFilter(_req, file, cb) {
    const ext = `.${file.originalname.split(".").pop()?.toLowerCase()}`;

    if (!ALLOWED_MIMETYPES.has(file.mimetype)) {
      return cb(apiError(415, `Unsupported file type "${file.mimetype}". Only PDF files are accepted.`));
    }
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(apiError(415, `Unsupported extension "${ext}". Only .pdf files are accepted.`));
    }

    cb(null, true);
  },
});

// ── Multer error middleware ───────────────────────────────────────────────────
// Wraps upload.single() so multer errors are normalised before reaching the route.

function uploadMiddleware(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (!err) return next();

    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, 413, `File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`);
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return sendError(res, 400, "Only one file may be uploaded per request.");
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return sendError(res, 400, 'File must be sent in the "file" form field.');
    }
    if (err.status) {
      return sendError(res, err.status, err.message);
    }

    console.error("[Multer Error]", err);
    return sendError(res, 500, "File upload failed due to an unexpected error.");
  });
}

// ── Promise timeout wrapper ───────────────────────────────────────────────────

function withTimeout(promise, ms, label) {
  const timer = new Promise((_, reject) =>
    setTimeout(() => reject(apiError(504, `${label} timed out after ${ms / 1000}s. Please try again.`)), ms)
  );
  return Promise.race([promise, timer]);
}

// ── PDF text extraction ───────────────────────────────────────────────────────

async function extractTextFromPDF(buffer) {
  // Buffer sanity checks
  if (!Buffer.isBuffer(buffer) && !(buffer instanceof Uint8Array)) {
    throw apiError(422, "Invalid file buffer received.");
  }
  if (buffer.length < 5) {
    throw apiError(422, "File is too small to be a valid PDF.");
  }

  // Magic-byte check — PDFs must start with %PDF
  const header = buffer.slice(0, 5).toString("ascii");
  if (!header.startsWith("%PDF")) {
    throw apiError(422, "File does not appear to be a valid PDF (missing %PDF header).");
  }

  // Load PDF
  let pdf;
  try {
    const loadingTask = getDocument({
      data: new Uint8Array(buffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });
    pdf = await loadingTask.promise;
  } catch (pdfErr) {
    const msg = pdfErr?.message ?? "";
    if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("encrypt")) {
      throw apiError(422, "The PDF is password-protected. Please upload an unlocked version.");
    }
    throw apiError(422, "Failed to parse the PDF. The file may be corrupted or use an unsupported format.");
  }

  if (!pdf.numPages || pdf.numPages === 0) {
    throw apiError(422, "The PDF contains no pages.");
  }

  // Extract text page-by-page
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      fullText += `\n${content.items.map((item) => item.str).join(" ")}`;
    } catch {
      // Skip unreadable individual pages rather than failing the whole document
      console.warn(`[PDF] Skipping unreadable page ${i} of ${pdf.numPages}.`);
    }
  }

  return fullText.trim();
}

// ── GET /api/history ──────────────────────────────────────────────────────────

router.get("/history", async (_req, res, next) => {
  try {
    const history = await getAllHistory();
    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("[History Error]", err);
    next(err);
  }
});

// ── POST /api/upload ──────────────────────────────────────────────────────────

router.post("/upload", uploadMiddleware, async (req, res, next) => {
  try {

    // ── 1. File presence & basic validity ─────────────────────────────────
    if (!req.file) {
      return sendError(res, 400, 'No file received. Send a PDF in the "file" field of a multipart/form-data request.');
    }
    if (req.file.size === 0) {
      return sendError(res, 422, "The uploaded file is empty.");
    }

    // ── 2. Extract text from PDF ──────────────────────────────────────────
    let extractedText;
    try {
      extractedText = await withTimeout(
        extractTextFromPDF(req.file.buffer),
        PDF_TIMEOUT_MS,
        "PDF parsing"
      );
    } catch (err) {
      console.error("[PDF Parse Error]", err.message, {
        file: req.file.originalname,
        size: req.file.size,
      });
      const status = err.status ?? 422;
      return sendError(res, status, err.message ?? "Failed to extract text from the PDF.");
    }

    // ── 3. Validate extracted text ────────────────────────────────────────
    if (!extractedText || extractedText.length < MIN_TEXT_LENGTH) {
      return sendError(
        res, 422,
        "No readable text found in this PDF. If it is a scanned document, please upload an OCR-processed version."
      );
    }

    // Silently truncate oversized text (logged for visibility)
    if (extractedText.length > MAX_TEXT_LENGTH) {
      console.warn(`[Upload] Text truncated: ${extractedText.length} → ${MAX_TEXT_LENGTH} chars (${req.file.originalname})`);
      extractedText = extractedText.slice(0, MAX_TEXT_LENGTH);
    }

    // ── 4. Claude analysis ────────────────────────────────────────────────
    let analysis;
    try {
      analysis = await withTimeout(
        analyzeDocument(extractedText),
        CLAUDE_TIMEOUT_MS,
        "AI analysis"
      );
    } catch (err) {
      console.error("[Claude Error]", err.message, { file: req.file.originalname });

      // Timeout (from withTimeout)
      if (err.status === 504) {
        return sendError(res, 504, err.message);
      }
      // Rate limit
      if (err.message?.includes("rate_limit") || err.message?.includes("429")) {
        return sendError(res, 429, "AI service is rate-limited. Please wait a moment and try again.");
      }
      // Auth / billing
      if (err.message?.includes("credit") || err.message?.includes("401") || err.message?.includes("403")) {
        return sendError(res, 402, "AI service authentication failed. Check your API key and account credits.");
      }
      // Catch-all service error
      return sendError(res, 502, "AI analysis failed due to a service error. Please try again.");
    }

    // ── 5. Guard against malformed analysis result ────────────────────────
    if (!analysis || typeof analysis !== "object" || Array.isArray(analysis)) {
      console.error("[Upload] analyzeDocument returned unexpected value:", typeof analysis);
      return sendError(res, 502, "AI analysis returned an unexpected result. Please try again.");
    }

    // ── 6. Save to history ────────────────────────────────────────────────
    try {
      await addHistoryEntry(
        {
          originalName: req.file.originalname,
          sizeBytes: req.file.size,
          mimeType: req.file.mimetype,
        },
        analysis
      );
    } catch (histErr) {
      // Log but don't fail the request if history save fails
      console.error("[History Save Error]", histErr);
    }

    // ── 7. Success ────────────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      file: {
        originalName: req.file.originalname,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      },
      extractedText,
      analysis,
    });

  } catch (err) {
    // Safety net — pass truly unhandled exceptions to the global handler in index.js
    console.error("[Upload Unhandled]", err);
    next(err);
  }
});

// ── GET /history ──────────────────────────────────────────────────────────────
// Returns all analysis history entries

router.get("/history", async (_req, res, next) => {
  try {
    const history = await getAllHistory();
    return res.status(200).json({ success: true, history });
  } catch (err) {
    console.error("[History Error]", err);
    next(err);
  }
});

export default router;