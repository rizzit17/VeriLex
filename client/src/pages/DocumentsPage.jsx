import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime, formatFileSize } from "../utils/timeUtils";

// ── Compute overall risk from risky clauses ───────────────────────────────────
function getOverallRisk(analysis) {
    if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
    const hasHigh = analysis.risky_clauses.some(c => c.risk_level === "HIGH");
    if (hasHigh) return "HIGH";
    const hasMedium = analysis.risky_clauses.some(c => c.risk_level === "MEDIUM");
    if (hasMedium) return "MEDIUM";
    return "LOW";
}

const riskConfig = {
    LOW: { label: "Low", bg: "rgba(45,80,22,0.15)", color: "#d4a574", border: "rgba(45,80,22,0.4)" },
    MEDIUM: { label: "Medium", bg: "rgba(204,119,34,0.15)", color: "#d4a574", border: "rgba(204,119,34,0.4)" },
    HIGH: { label: "High", bg: "rgba(139,46,46,0.15)", color: "#d4a574", border: "rgba(139,46,46,0.4)" },
};

export default function DocumentsPage({ onViewAnalysis }) {
    const { history, loading } = useHistory();
    const [searchQuery, setSearchQuery] = useState("");

    const filteredDocs = history.filter(entry =>
        entry.file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ marginLeft: 268, padding: "36px 40px 60px" }}>
            {/* Header */}
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.15, color: "#f1f5f9", fontFamily: "'Fraunces', Georgia, serif" }}>
                    Documents
                </h1>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                    {loading ? "Loading..." : `${history.length} document${history.length !== 1 ? "s" : ""} analyzed`}
                </p>
            </header>

            {/* Search */}
            <div style={{ marginBottom: 24 }}>
                <input
                    type="text"
                    placeholder="Search by filename..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        width: "100%", maxWidth: 400,
                        padding: "10px 16px", borderRadius: 10,
                        background: "#2a1f1a", border: "1px solid #4a3728",
                        color: "#e2e8f0", fontSize: 14,
                        outline: "none",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = "#d4a574"}
                    onBlur={e => e.currentTarget.style.borderColor = "#4a3728"}
                />
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                    <div style={{ fontSize: 14 }}>Loading documents...</div>
                </div>
            ) : filteredDocs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                        {searchQuery ? "No documents found" : "No documents analyzed yet"}
                    </div>
                    <div style={{ fontSize: 13 }}>
                        {searchQuery ? "Try a different search term" : "Upload a PDF to get started"}
                    </div>
                </div>
            ) : (
                <div style={{ background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 16, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#3a2f28", borderBottom: "1px solid #4a3728" }}>
                                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Filename</th>
                                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Date</th>
                                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Size</th>
                                <th style={{ padding: "14px 20px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Risk</th>
                                <th style={{ padding: "14px 20px", textAlign: "right", fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDocs.map((entry, i) => {
                                const risk = getOverallRisk(entry.analysis);
                                const r = riskConfig[risk];
                                return (
                                    <tr key={entry.id} style={{ borderBottom: i < filteredDocs.length - 1 ? "1px solid #4a3728" : "none" }}>
                                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>
                                            {entry.file.originalName}
                                        </td>
                                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748b" }}>
                                            {formatRelativeTime(entry.timestamp)}
                                        </td>
                                        <td style={{ padding: "16px 20px", fontSize: 13, color: "#64748b" }}>
                                            {formatFileSize(entry.file.sizeBytes)}
                                        </td>
                                        <td style={{ padding: "16px 20px" }}>
                                            <span style={{
                                                padding: "3px 10px", borderRadius: 99,
                                                fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                                                background: r.bg, color: r.color, border: `1px solid ${r.border}`,
                                            }}>
                                                {r.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: "16px 20px", textAlign: "right" }}>
                                            <button
                                                onClick={() => onViewAnalysis(entry)}
                                                style={{
                                                    padding: "6px 14px", borderRadius: 8,
                                                    background: "rgba(212,165,116,0.12)", color: "#d4a574",
                                                    border: "1px solid rgba(99,102,241,0.2)",
                                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                                    transition: "all 0.15s ease",
                                                }}
                                                onMouseEnter={e => { e.currentTarget.style.background = "rgba(212,165,116,0.18)"; e.currentTarget.style.color = "#e8c896"; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = "rgba(212,165,116,0.12)"; e.currentTarget.style.color = "#d4a574"; }}
                                            >
                                                View Analysis
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
