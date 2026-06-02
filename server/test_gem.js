import "dotenv/config";
import { analyzeDocument } from "./services/gemini.js";

async function run() {
  const res = await analyzeDocument("This is a test legal document. It has enough words to be more than 20 characters.");
  console.log("Result:", JSON.stringify(res, null, 2));
}

run();
