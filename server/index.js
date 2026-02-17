import "dotenv/config";
import express from "express";
import cors from "cors";
import uploadRouter from "./routes/upload.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ── Security: reject oversized bodies early ───────────────────────────────────
// (before they reach route handlers or multer)

const BODY_LIMIT = "1mb"; // JSON/form bodies only — files go through multer

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));

// ── Request logging (lightweight, no external dependency) ─────────────────────

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── Routes ────────────────────────────────────────────────────────────────────

app.use("/api", uploadRouter);

// ── Health check ──────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ── Global error handler ──────────────────────────────────────────────────────
// Last-resort catch — handles anything that slips past route-level try/catch.

app.use((err, req, res, _next) => {
  // Determine safe status code
  const status = (
    typeof err.status === "number" && err.status >= 400 && err.status < 600
  ) ? err.status : 500;

  // Log full error server-side (with request context)
  console.error(`[Global Error] ${req.method} ${req.path}`, {
    status,
    message: err.message,
    stack: status === 500 ? err.stack : undefined,
  });

  // Never leak internal stack traces or raw error messages for 5xx
  const clientMessage = status >= 500
    ? "An internal server error occurred. Please try again later."
    : (err.message ?? "An error occurred.");

  if (res.headersSent) return;
  res.status(status).json({ success: false, error: clientMessage });
});

// ── Unhandled rejection safety net ───────────────────────────────────────────
// Prevents silent crashes from un-awaited promises outside request context.

process.on("unhandledRejection", (reason) => {
  console.error("[Unhandled Rejection]", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[Uncaught Exception]", err);
  // Give the logger time to flush, then exit — let the process manager restart
  setTimeout(() => process.exit(1), 500);
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Legal Document Analyzer running on http://localhost:${PORT}`);
});

export default app;