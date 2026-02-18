// Quick test script to verify Gemini API works
// Run with: node test-gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const key = process.env.GEMINI_API_KEY;
if (!key) {
    console.error("❌ GEMINI_API_KEY not set in .env");
    process.exit(1);
}

console.log("✅ API key found:", key.slice(0, 8) + "...");

const genAI = new GoogleGenerativeAI(key);

try {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
            maxOutputTokens: 512,
            temperature: 0,
            responseMimeType: "application/json",
        },
    });

    console.log("📡 Calling Gemini API...");
    const result = await model.generateContent(
        'Return this exact JSON: {"summary": "test ok", "key_obligations": ["works"], "risky_clauses": [], "missing_clauses": [], "suggestions": ["all good"]}'
    );

    const text = result.response.text();
    console.log("✅ Response received:", text.slice(0, 200));
    const parsed = JSON.parse(text);
    console.log("✅ JSON parsed successfully:", parsed.summary);
    console.log("\n🎉 Gemini API is working correctly!");
} catch (err) {
    console.error("❌ Error:", err.message);
    console.error("Full error:", err);
}
