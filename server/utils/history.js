// ── In-Memory History Storage ─────────────────────────────────────────────────
// Note: On Railway/Vercel, file systems are ephemeral. 
// We use in-memory storage for the demo. For production persistence, use MongoDB/PostgreSQL.

let memoryHistory = [];

export async function addHistoryEntry(fileData, analysisData) {
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

    memoryHistory.unshift(entry); // Add to beginning (newest first)

    // Optional limits to prevent memory overflow
    if (memoryHistory.length > 50) {
        memoryHistory = memoryHistory.slice(0, 50);
    }

    return entry;
}

export async function getAllHistory() {
    return memoryHistory;
}

