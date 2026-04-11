import Groq from "groq-sdk";

// Keep the same exported function name so the rest of the app keeps working.
const MODEL = "llama-3.3-70b-versatile";

class AIServiceError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "AIServiceError";
    this.status = status;
  }
}

function getAIClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new AIServiceError(
      "Groq API key is missing. Set GROQ_API_KEY on the server and try again.",
      500
    );
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

const SAFE_FALLBACK = {
  summary:
    "Analysis could not be completed. Please retry or consult a qualified legal professional.",
  key_obligations: [],
  risky_clauses: [],
  missing_clauses: [],
  suggestions: [
    "This document could not be automatically analyzed. Please have a qualified attorney review it.",
  ],
};

function extractJSON(raw) {
  if (!raw || typeof raw !== "string") return null;

  const attempt = (str) => {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  };

  const direct = attempt(raw);
  if (direct) return direct;

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    const fenced = attempt(fenceMatch[1].trim());
    if (fenced) return fenced;
  }

  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    const braced = attempt(braceMatch[0]);
    if (braced) return braced;
  }

  const lastBrace = raw.lastIndexOf("}");
  if (lastBrace > 0) {
    const trimmed = attempt(raw.slice(0, lastBrace + 1));
    if (trimmed) return trimmed;
  }

  return null;
}

const VALID_RISK_LEVELS = new Set(["HIGH", "MEDIUM", "LOW"]);

function validateAndNormalize(obj) {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
    throw new Error("Root value is not a plain object.");
  }

  if (typeof obj.summary !== "string") {
    if (obj.summary != null) obj.summary = String(obj.summary);
    else throw new Error("Missing required field: summary");
  }
  obj.summary = obj.summary.trim();

  for (const field of [
    "key_obligations",
    "risky_clauses",
    "missing_clauses",
    "suggestions",
  ]) {
    if (!Array.isArray(obj[field])) obj[field] = [];
  }

  for (const field of ["key_obligations", "missing_clauses", "suggestions"]) {
    obj[field] = obj[field]
      .filter((item) => item != null)
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }

  obj.risky_clauses = obj.risky_clauses
    .filter((item) => item != null && typeof item === "object")
    .map((item, i) => {
      if (typeof item.clause !== "string") {
        if (item.clause != null) item.clause = String(item.clause).trim();
        else throw new Error(`risky_clauses[${i}].clause is missing.`);
      }

      const level =
        typeof item.risk_level === "string"
          ? item.risk_level.trim().toUpperCase()
          : "";

      if (!VALID_RISK_LEVELS.has(level)) {
        throw new Error(
          `risky_clauses[${i}].risk_level "${item.risk_level}" is not HIGH, MEDIUM, or LOW.`
        );
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

export async function analyzeDocument(documentText) {
  if (
    !documentText ||
    typeof documentText !== "string" ||
    documentText.trim().length < 20
  ) {
    console.warn("[analyzeDocument] Invalid or empty documentText - returning fallback.");
    return { ...SAFE_FALLBACK };
  }

  const truncated = documentText.slice(0, 60000);

  const prompt = `You are a legal document analyzer.

Analyze the following legal document and return ONLY a valid JSON object.
Do not include markdown.
Do not include code fences.
Do not include explanation text before or after the JSON.

The JSON must have exactly these keys:
{
  "summary": "2-3 sentence summary",
  "key_obligations": ["array of obligations"],
  "risky_clauses": [
    {
      "clause": "clause name or short quote",
      "risk_level": "HIGH or MEDIUM or LOW",
      "reason": "why it is risky"
    }
  ],
  "missing_clauses": ["array of missing standard clauses"],
  "suggestions": ["2-5 practical legal review suggestions"]
}

DOCUMENT TO ANALYZE:
---
${truncated}
---`;

  let rawText;

  try {
    const ai = getAIClient();

    console.log(`[analyzeDocument] Calling Groq model ${MODEL} with ${truncated.length} chars...`);

    const completion = await ai.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content:
            "You are a legal document analyzer. Return only valid JSON matching the requested schema.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    rawText = completion.choices?.[0]?.message?.content?.trim() || "";

    console.log(`[analyzeDocument] Got response: ${rawText.length} chars`);
    console.log(`[analyzeDocument] Preview: ${rawText.slice(0, 150)}`);
  } catch (err) {
    console.error("[analyzeDocument] Groq API FAILED:", err?.message ?? err);

    const message = String(err?.message ?? "");

    if (
      err?.status === 401 ||
      err?.status === 403 ||
      /401|403|api key|api_key|invalid|unauthorized|forbidden/i.test(message)
    ) {
      throw new AIServiceError(
        "Groq authentication failed. Check that GROQ_API_KEY is valid.",
        502
      );
    }

    if (
      err?.status === 429 ||
      /429|rate limit|too many requests/i.test(message)
    ) {
      throw new AIServiceError(
        "Groq is rate-limiting requests right now. Please wait a moment and try again.",
        429
      );
    }

    if (
      err?.status === 402 ||
      /quota|billing|credits|payment|required/i.test(message)
    ) {
      throw new AIServiceError(
        "Groq quota or billing issue detected. Check your account usage and credits.",
        402
      );
    }

    if (err instanceof AIServiceError) {
      throw err;
    }

    throw new AIServiceError(
      "Groq analysis request failed. Please verify the API key and model access.",
      502
    );
  }

  if (!rawText) {
    console.error("[analyzeDocument] Empty response from Groq");
    return { ...SAFE_FALLBACK };
  }

  const parsed = extractJSON(rawText);
  if (!parsed) {
    console.error("[analyzeDocument] JSON parse FAILED. Raw:", rawText.slice(0, 300));
    return { ...SAFE_FALLBACK };
  }

  try {
    const normalized = validateAndNormalize(parsed);
    console.log("[analyzeDocument] SUCCESS! Keys:", Object.keys(normalized));
    return normalized;
  } catch (err) {
    console.error("[analyzeDocument] Validation FAILED:", err.message);
    return { ...SAFE_FALLBACK };
  }
}
