import { GoogleGenAI } from "@google/genai";

// ── Client setup ──────────────────────────────────────────────────────────────

if (!process.env.GEMINI_API_KEY) {
  throw new Error("Missing required environment variable: GEMINI_API_KEY");
}

// The client gets the API key from the environment variable explicitly
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-1.5-flash";
const MAX_TOKENS = 8192;

// ── Safe fallback ─────────────────────────────────────────────────────────────
// Returned on any failure — analyzeDocument never throws to the caller.

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a single raw JSON object. Do not include:
- Markdown code fences (\`\`\`json or \`\`\`)
- Prose explanations before or after the JSON
- Comments inside the JSON
- Any text outside the JSON object

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

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FIELD INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

summary
- 2–3 sentences in plain English describing the document type, its main purpose, and the parties involved.
- Neutral, factual tone. Do not characterize the document as "good", "bad", or "risky".

key_obligations
- List the primary duties explicitly stated in the document for each party.
- Use plain language. Begin each item with the responsible party, e.g. "Client must...", "Service Provider shall...".
- Include payment terms, delivery deadlines, confidentiality duties, and notice requirements if present.
- Do not infer obligations not stated in the document.

risky_clauses
- Only flag clauses that present a materially unusual, one-sided, or potentially harmful term compared to standard commercial contracts.
- Apply a CONSERVATIVE threshold. Do not flag routine clauses merely because they exist.
- For each flagged clause:
    clause:      Quote or closely paraphrase the relevant text.
    risk_level:  HIGH, MEDIUM, or LOW only.
    reason:      1–2 sentences explaining why this clause may warrant attention. Neutral, informational tone only.

Risk level criteria (be conservative — when in doubt, use a lower level):
  HIGH   — Highly unusual or severely one-sided; could expose a party to significant unexpected liability.
  MEDIUM — Meaningful deviation from standard practice; may disadvantage one party but is not extreme.
  LOW    — Slightly unusual or worth noting; common in some industries and unlikely to cause significant harm alone.

missing_clauses
- List standard clause types absent from this document and commonly expected in contracts of this type.
- Only include genuinely missing protections, not clauses that are merely implied.

suggestions
- 2–5 neutral, informational observations a reader may wish to discuss with legal counsel.
- Use language like: "It may be worth clarifying...", "A party may wish to consider...", "Legal counsel could review whether..."
- Do NOT instruct the reader to sign, reject, modify, or take any specific legal action.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSTRAINTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- This output is for informational purposes only and does not constitute legal advice.
- Do not speculate about intent, motives, or likely outcomes of any clause.
- Do not reference laws or statutes by name unless explicitly cited in the document.
- If the document is too short or clearly not a legal contract, return the schema with empty arrays and a summary noting the document could not be analyzed.
- risk_level values must be exactly: HIGH, MEDIUM, or LOW (uppercase).`;

// ── JSON extraction ───────────────────────────────────────────────────────────
// Four-layer fallback — handles raw JSON, fenced JSON, embedded JSON,
// and truncated responses cut off mid-object.

function extractJSON(raw) {
  if (!raw || typeof raw !== "string") return null;

  const attempt = (str) => {
    try { return JSON.parse(str); } catch { return null; }
  };

  // 1. Direct parse (ideal — Gemini with responseMimeType JSON usually hits this)
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

  // 4. Trim to last closing brace (handles token-limit truncation mid-response)
  const lastBrace = raw.lastIndexOf("}");
  if (lastBrace > 0) {
    const trimmed = attempt(raw.slice(0, lastBrace + 1));
    if (trimmed) return trimmed;
  }

  return null;
}

// ── Schema validation & normalisation ─────────────────────────────────────────
// Validates structure AND coerces minor deviations rather than hard-failing.

const VALID_RISK_LEVELS = new Set(["HIGH", "MEDIUM", "LOW"]);

function validateAndNormalize(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error("Root value is not a plain object.");
  }

  // summary — coerce to string if possible
  if (typeof obj.summary !== "string") {
    if (obj.summary != null) obj.summary = String(obj.summary);
    else throw new Error("Missing required field: summary");
  }
  obj.summary = obj.summary.trim();

  // Array fields — coerce null/undefined to []
  for (const field of ["key_obligations", "risky_clauses", "missing_clauses", "suggestions"]) {
    if (!Array.isArray(obj[field])) {
      obj[field] = obj[field] != null ? [] : [];
    }
  }

  // Normalise string arrays — drop non-string items
  for (const field of ["key_obligations", "missing_clauses", "suggestions"]) {
    obj[field] = obj[field]
      .filter((item) => item != null)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  // Validate and normalise risky_clauses items
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

/**
 * Analyze a legal document using the Gemini API.
 * Drop-in replacement for the Claude analyzeDocument export —
 * identical function name, parameters, and return shape.
 *
 * @param {string} documentText  Extracted plain text from the PDF.
 * @returns {Promise<object>}    Validated, normalized analysis object.
 *                               Never throws — returns SAFE_FALLBACK on any failure.
 */
export async function analyzeDocument(documentText) {
  // Guard: bad input
  if (!documentText || typeof documentText !== "string" || documentText.trim().length < 20) {
    console.warn("[analyzeDocument] Invalid or empty documentText — returning fallback.");
    return { ...SAFE_FALLBACK };
  }

  // Stay inside Gemini's context window; leave room for system prompt + output
  const truncated = documentText.slice(0, 90_000);

  const userMessage = `Please analyze the following legal document and return the JSON object described in your instructions. Do not include anything outside the JSON.\n\n---\n\n${truncated}`;

  // ── API call ────────────────────────────────────────────────────────────────
  let response;
  try {
    response = await ai.models.generateContent({
      model: MODEL,
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: MAX_TOKENS,
        temperature: 0,
        responseMimeType: "application/json",
      },
    });
  } catch (err) {
    console.error("[analyzeDocument] Gemini API error:", err.message);
    return { ...SAFE_FALLBACK };
  }

  // ── Extract raw text ────────────────────────────────────────────────────────
  const rawText = (response.text ?? "").trim();

  if (!rawText) {
    console.error("[analyzeDocument] Gemini returned an empty response.");
    return { ...SAFE_FALLBACK };
  }

  // ── Parse JSON ──────────────────────────────────────────────────────────────
  const parsed = extractJSON(rawText);

  if (!parsed) {
    console.error("[analyzeDocument] JSON extraction failed. Raw (first 500 chars):", rawText.slice(0, 500));
    return { ...SAFE_FALLBACK };
  }

  // ── Validate & normalize ────────────────────────────────────────────────────
  try {
    return validateAndNormalize(parsed);
  } catch (err) {
    console.error("[analyzeDocument] Schema validation failed:", err.message);
    return { ...SAFE_FALLBACK };
  }
}