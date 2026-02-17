import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime } from "../utils/timeUtils";
import { generateTextReport, downloadTextFile } from "../utils/reportGenerator";
import { notify } from "../components/Notifications";

export default function ReportsPage() {
    const { history, loading } = useHistory();

    const handleDownload = (entry) => {
        try {
            const report = generateTextReport(entry);
            const filename = `${entry.file.originalName.replace(/\.pdf$/i, "")}_report.txt`;
            downloadTextFile(report, filename);
            notify(`Report downloaded: ${filename}`, "success");
        } catch (err) {
            notify("Failed to generate report", "error");
            console.error("[Report Download Error]", err);
        }
    };

    return (
        <div style={{ marginLeft: 268, padding: "36px 40px 60px" }}>
            {/* Header */}
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.15, color: "#f1f5f9", fontFamily: "'Fraunces', Georgia, serif" }}>
                    Reports
                </h1>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                    Download detailed analysis reports for your documents
                </p>
            </header>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                    <div style={{ fontSize: 14 }}>Loading reports...</div>
                </div>
            ) : history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No reports available</div>
                    <div style={{ fontSize: 13 }}>Upload documents to generate reports</div>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 12 }}>
                    {history.map(entry => (
                        <div key={entry.id} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "18px 24px", borderRadius: 14,
                            background: "#0d1424", border: "1px solid #1a2538",
                            transition: "all 0.2s ease",
                        }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#243450"; e.currentTarget.style.background = "#111827"; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a2538"; e.currentTarget.style.background = "#0d1424"; }}
                        >
                            <div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: "#cbd5e1", marginBottom: 4 }}>
                                    {entry.file.originalName}
                                </div>
                                <div style={{ fontSize: 12, color: "#475569" }}>
                                    Analyzed {formatRelativeTime(entry.timestamp)}
                                </div>
                            </div>
                            <button
                                onClick={() => handleDownload(entry)}
                                style={{
                                    display: "inline-flex", alignItems: "center", gap: 7,
                                    padding: "8px 16px", borderRadius: 8,
                                    background: "linear-gradient(135deg, #d4a574 0%, #b8860b 100%)",
                                    color: "#fff", border: "none",
                                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    boxShadow: "0 2px 12px rgba(99,102,241,0.25)",
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(99,102,241,0.25)"; }}
                            >
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8.5 11.5a.5.5 0 01-1 0V7.707L6.354 8.854a.5.5 0 11-.708-.708l2-2a.5.5 0 01.708 0l2 2a.5.5 0 01-.708.708L8.5 7.707V11.5z" transform="rotate(180 8 8)" />
                                    <path d="M14 14V4.5L9.5 0H4a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2zM9.5 3A1.5 1.5 0 0011 4.5h2V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1h5.5v2z" />
                                </svg>
                                Download Report
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
