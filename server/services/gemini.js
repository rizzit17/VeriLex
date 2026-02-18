import { GoogleGenerativeAI } from "@google/generative-ai";

// ── Client setup ──────────────────────────────────────────────────────────────

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required environment variable: GEMINI_API_KEY");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODEL = "gemini-1.5-flash";
const MAX_TOKENS = 8192;

// ── Safe fallback ─────────────────────────────────────────────────────────────

const SAFE_FALLBACK = {
  summary: "Analysis could not be completed. Please retry or consult a qualified legal professional.",
  key_obligations: [],
  risky_clauses: [],
  missing_clauses: [],
  suggestions: [
    "This document could not be automatically analyzed. Please have a qualified attorney review it.",
  ],
};

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a careful legal document reviewer trained to identify and summarize contract terms for informational purposes only. You do not provide legal advice, legal opinions, or recommendations about whether a party should sign or reject any document.

Your task is to analyze the provided contract text and return a structured JSON summary. Follow these instructions precisely.

OUTPUT FORMAT
Return ONLY a single raw JSON object. Do not include markdown code fences, prose explanations, or any text outside the JSON object.

Required schema (all keys mandatory, arrays may be empty):
{
  "summary": "<string>",
  "key_obligations": ["<string>", ...],
  "risky_clauses": [
    {
      "clause": "<string>",
      "risk_level": "HIGH" | "MEDIUM" | "LOW",
      "reason": "<string>"
    }
  ],
  "missing_clauses": ["<string>", ...],
  "suggestions": ["<string>", ...]
}

FIELD INSTRUCTIONS

summary: 2-3 sentences in plain English describing the document type, its main purpose, and the parties involved. Neutral, factual tone.

key_obligations: List the primary duties explicitly stated in the document for each party. Use plain language. Begin each item with the responsible party, e.g. "Client must...", "Service Provider shall...".

risky_clauses: Only flag clauses that present a materially unusual, one-sided, or potentially harmful term compared to standard commercial contracts.
- HIGH: Highly unusual or severely one-sided; could expose a party to significant unexpected liability.
- MEDIUM: Meaningful deviation from standard practice; may disadvantage one party but is not extreme.
- LOW: Slightly unusual or worth noting; common in some industries.

missing_clauses: List standard clause types absent from this document and commonly expected in contracts of this type.

suggestions: 2-5 neutral, informational observations a reader may wish to discuss with legal counsel. Use language like "It may be worth clarifying...", "A party may wish to consider..."

CONSTRAINTS
- This output is for informational purposes only and does not constitute legal advice.
- risk_level values must be exactly: HIGH, MEDIUM, or LOW (uppercase).
- If the document is too short or clearly not a legal contract, return the schema with empty arrays and a summary noting the document could not be analyzed.`;

// ── JSON extraction ───────────────────────────────────────────────────────────

function extractJSON(raw) {
  if (!raw || typeof raw !== "string") return null;

  const attempt = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  // 1. Direct parse
  const direct = attempt(raw);
  if (direct) return direct;

  // 2. Strip ```json ... ``` or ``` ... ``` fences
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    const fenced = attempt(fenceMatch[1].trim());
    if (fenced) return fenced;
  }

  // 3. Extract the outermost { ... } block
  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    const braced = attempt(braceMatch[0]);
    if (braced) return braced;
  }

  // 4. Trim to last closing brace
  const lastBrace = raw.lastIndexOf("}");
  if (lastBrace > 0) {
    const trimmed = attempt(raw.slice(0, lastBrace + 1));
    if (trimmed) return trimmed;
  }

  return null;
}

// ── Schema validation & normalisation ─────────────────────────────────────────

const VALID_RISK_LEVELS = new Set(["HIGH", "MEDIUM", "LOW"]);

function validateAndNormalize(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error("Root value is not a plain object.");
  }

  // summary
  if (typeof obj.summary !== "string") {
    if (obj.summary != null) obj.summary = String(obj.summary);
    else throw new Error("Missing required field: summary");
  }
  obj.summary = obj.summary.trim();

  // Array fields
  for (const field of ["key_obligations", "risky_clauses", "missing_clauses", "suggestions"]) {
    if (!Array.isArray(obj[field])) {
      obj[field] = [];
    }
  }

  // Normalise string arrays
  for (const field of ["key_obligations", "missing_clauses", "suggestions"]) {
    obj[field] = obj[field]
      .filter((item) => item != null)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  // Validate risky_clauses
  obj.risky_clauses = obj.risky_clauses
    .filter((item) => item != null && typeof item === "object")
    .map((item, i) => {
      if (typeof item.clause !== "string") {
        if (item.clause != null) item.clause = String(item.clause).trim();
        else throw new Error(`risky_clauses[${i}].clause is missing.`);
      }

      const level = typeof item.risk_level === "string"
        ? item.risk_level.trim().toUpperCase()
        : "";
      if (!VALID_RISK_LEVELS.has(level)) {
        throw new Error(`risky_clauses[${i}].risk_level "${item.risk_level}" is not HIGH, MEDIUM, or LOW.`);
      }
      item.risk_level = level;

      if (typeof item.reason !== "string") {
        if (item.reason != null) item.reason = String(item.reason).trim();
        else throw new Error(`risky_clauses[${i}].reason is missing.`);
      }

      return {
        clause: item.clause.trim(),
        risk_level: item.risk_level,
        reason: item.reason.trim(),
      };
    });

  return obj;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function analyzeDocument(documentText) {
  if (!documentText || typeof documentText !== "string" || documentText.trim().length < 20) {
    console.warn("[analyzeDocument] Invalid or empty documentText — returning fallback.");
    return { ...SAFE_FALLBACK };
  }

  const truncated = documentText.slice(0, 90_000);
  const prompt = `${SYSTEM_PROMPT}\n\nPlease analyze the following legal document and return ONLY the JSON object. Do not include anything outside the JSON.\n\n---\n\n${truncated}`;

  // ── API call ────────────────────────────────────────────────────────────────
  let result;
  try {
    console.log(`[analyzeDocument] Calling Gemini ${MODEL} with ${truncated.length} chars...`);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0,
        responseMimeType: "application/json",
      },
    });
    result = await model.generateContent(prompt);
  } catch (err) {
    console.error("[analyzeDocument] Gemini API error:", err.message ?? err);
    return { ...SAFE_FALLBACK };
  }

  // ── Extract raw text ────────────────────────────────────────────────────────
  let rawText;
  try {
    rawText = result.response.text().trim();
  } catch (err) {
    console.error("[analyzeDocument] Failed to extract text from response:", err.message);
    return { ...SAFE_FALLBACK };
  }

  console.log(`[analyzeDocument] Response length: ${rawText.length}, preview: ${rawText.slice(0, 80)}`);

  if (!rawText) {
    console.error("[analyzeDocument] Gemini returned an empty response.");
    return { ...SAFE_FALLBACK };
  }

  // ── Parse JSON ──────────────────────────────────────────────────────────────
  const parsed = extractJSON(rawText);
  if (!parsed) {
    console.error("[analyzeDocument] JSON extraction failed. Raw:", rawText.slice(0, 300));
    return { ...SAFE_FALLBACK };
  }

  // ── Validate & normalize ────────────────────────────────────────────────────
  try {
    const normalized = validateAndNormalize(parsed);
    console.log("[analyzeDocument] Success! Keys:", Object.keys(normalized));
    return normalized;
  } catch (err) {
    console.error("[analyzeDocument] Schema validation failed:", err.message);
    return { ...SAFE_FALLBACK };
  }
}