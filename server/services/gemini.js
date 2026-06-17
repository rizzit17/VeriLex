import { GoogleGenAI, Type } from "@google/genai";

// Keep the same exported function name so the rest of the app keeps working.
const MODEL = "gemini-2.5-flash";

class AIServiceError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.name = "AIServiceError";
    this.status = status;
  }
}

function getAIClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new AIServiceError(
      "Gemini API key is missing. Set GEMINI_API_KEY on the server and try again.",
      500
    );
  }

  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
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

CRITICAL INSTRUCTIONS FOR RISK ASSESSMENT:
1. Do NOT force a "HIGH" risk if the document is standard or fair.
2. "HIGH" risk: Severe liabilities, uncapped damages, immediate termination without cause, or highly unusual/predatory terms.
3. "MEDIUM" risk: Long non-competes, one-sided terms, or non-standard requirements.
4. "LOW" risk: Minor ambiguities, broad definitions, or easily fixable terms.
5. If the document is standard and fair, return an empty array [] for "risky_clauses".

DOCUMENT TO ANALYZE:
---
${truncated}
---`;

  let rawText;

  try {
    const ai = getAIClient();

    console.log(`[analyzeDocument] Calling Gemini model ${MODEL} with ${truncated.length} chars...`);

    const result = await ai.models.generateContent({
      model: MODEL,
      contents: "System: You are a legal document analyzer. Return only valid JSON matching the requested schema.\n\n" + prompt,
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            key_obligations: { type: Type.ARRAY, items: { type: Type.STRING } },
            risky_clauses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  clause: { type: Type.STRING },
                  risk_level: { type: Type.STRING },
                  reason: { type: Type.STRING }
                }
              }
            },
            missing_clauses: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    rawText = result.text.trim();

    console.log(`[analyzeDocument] Got response: ${rawText.length} chars`);
    console.log(`[analyzeDocument] Preview: ${rawText.slice(0, 150)}`);
  } catch (err) {
    console.error("[analyzeDocument] Gemini API FAILED:", err?.message ?? err);

    const message = String(err?.message ?? "");

    if (/api key|api_key|invalid|unauthorized|forbidden|401|403/i.test(message)) {
      throw new AIServiceError(
        "Gemini authentication failed. Check that GEMINI_API_KEY is valid.",
        502
      );
    }

    if (/rate limit|too many requests|429/i.test(message)) {
      throw new AIServiceError(
        "Gemini is rate-limiting requests right now. Please wait a moment and try again.",
        429
      );
    }

    if (/quota|billing|credits|payment|required|402/i.test(message)) {
      throw new AIServiceError(
        "Gemini quota or billing issue detected. Check your account usage and credits.",
        402
      );
    }

    if (err instanceof AIServiceError) {
      throw err;
    }

    throw new AIServiceError(
      "Gemini analysis request failed. Please verify the API key and model access.",
      502
    );
  }

  if (!rawText) {
    console.error("[analyzeDocument] Empty response from Groq");
    return { ...SAFE_FALLBACK };
  }

  const parsed = extractJSON(rawText);
  if (!parsed) {
    console.error("[analyzeDocument] JSON parse FAILED. Saving raw text to debug-failed.json.");
    import("fs").then(fs => fs.writeFileSync("debug-failed.json", rawText));
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
