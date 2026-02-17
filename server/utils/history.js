import { promises as fs } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const HISTORY_FILE = join(__dirname, "../data/history.json");

// ── Ensure data directory exists ──────────────────────────────────────────────

async function ensureDataDir() {
    const dir = dirname(HISTORY_FILE);
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (err) {
        if (err.code !== "EEXIST") throw err;
    }
}

// ── Read history from file ────────────────────────────────────────────────────

async function readHistory() {
    await ensureDataDir();
    try {
        const data = await fs.readFile(HISTORY_FILE, "utf8");
        return JSON.parse(data);
    } catch (err) {
        if (err.code === "ENOENT") {
            // File doesn't exist yet — initialize with empty array
            await fs.writeFile(HISTORY_FILE, "[]", "utf8");
            return [];
        }
        throw err;
    }
}

// ── Write history to file ─────────────────────────────────────────────────────

async function writeHistory(history) {
    await ensureDataDir();
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), "utf8");
}

// ── Add new entry to history ──────────────────────────────────────────────────

export async function addHistoryEntry(fileData, analysisData) {
    const history = await readHistory();

    const entry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        file: {
            originalName: fileData.originalName,
            sizeBytes: fileData.sizeBytes,
            mimeType: fileData.mimeType,
        },
        analysis: analysisData,
    };

    history.unshift(entry); // Add to beginning (newest first)
    await writeHistory(history);

    return entry;
}

// ── Get all history entries ───────────────────────────────────────────────────

export async function getAllHistory() {
    const history = await readHistory();
    return history; // Already sorted newest-first from addHistoryEntry
}
