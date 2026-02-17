import { useHistory } from "../hooks/useHistory";

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
    LOW: { label: "Low Risk", color: "#d4a574", bg: "rgba(45,80,22,0.15)", border: "rgba(45,80,22,0.4)" },
    MEDIUM: { label: "Medium Risk", color: "#d4a574", bg: "rgba(204,119,34,0.15)", border: "rgba(204,119,34,0.4)" },
    HIGH: { label: "High Risk", color: "#d4a574", bg: "rgba(139,46,46,0.15)", border: "rgba(139,46,46,0.4)" },
};

export default function AnalyticsPage() {
    const { history, loading } = useHistory();

    // Compute analytics
    const totalDocs = history.length;
    const avgRiskyClauses = totalDocs > 0
        ? (history.reduce((sum, entry) => sum + (entry.analysis?.risky_clauses?.length || 0), 0) / totalDocs).toFixed(1)
        : 0;

    const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    history.forEach(entry => {
        const risk = getOverallRisk(entry.analysis);
        riskCounts[risk]++;
    });

    const mostCommonRisk = riskCounts.HIGH > 0 ? "HIGH" : riskCounts.MEDIUM > 0 ? "MEDIUM" : "LOW";

    return (
        <div style={{ marginLeft: 268, padding: "36px 40px 60px" }}>
            {/* Header */}
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.15, color: "#f1f5f9", fontFamily: "'Fraunces', Georgia, serif" }}>
                    Analytics
                </h1>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                    Insights and trends from your document analysis
                </p>
            </header>

            {loading ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                    <div style={{ fontSize: 14 }}>Loading analytics...</div>
                </div>
            ) : history.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                    <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No analytics available</div>
                    <div style={{ fontSize: 13 }}>Upload documents to see analytics</div>
                </div>
            ) : (
                <>
                    {/* Summary cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
                        <div style={{ background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 16, padding: "24px" }}>
                            <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Total Documents
                            </div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#d4a574", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {totalDocs}
                            </div>
                        </div>
                        <div style={{ background: "#0d1424", border: "1px solid #1a2538", borderRadius: 16, padding: "24px" }}>
                            <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Avg Risky Clauses
                            </div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: "#cc7722", lineHeight: 1, fontFamily: "'Playfair Display', Georgia, serif" }}>
                                {avgRiskyClauses}
                            </div>
                        </div>
                        <div style={{ background: "#0d1424", border: "1px solid #1a2538", borderRadius: 16, padding: "24px" }}>
                            <div style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                Most Common Risk
                            </div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: riskConfig[mostCommonRisk].color, lineHeight: 1, fontFamily: "'Fraunces', Georgia, serif" }}>
                                {mostCommonRisk}
                            </div>
                        </div>
                    </div>

                    {/* Breakdown list */}
                    <div style={{ background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 16, overflow: "hidden" }}>
                        <div style={{ padding: "18px 24px", borderBottom: "1px solid #4a3728", background: "#3a2f28" }}>
                            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Fraunces', Georgia, serif" }}>
                                Risk Breakdown by Document
                            </h2>
                        </div>
                        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
                            {history.map(entry => {
                                const risk = getOverallRisk(entry.analysis);
                                const r = riskConfig[risk];
                                return (
                                    <div key={entry.id} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        padding: "12px 16px", borderRadius: 10,
                                        background: "#2a1f1a", border: "1px solid #4a3728",
                                    }}>
                                        <div style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>
                                            {entry.file.originalName}
                                        </div>
                                        <span style={{
                                            padding: "3px 10px", borderRadius: 99,
                                            fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
                                            background: r.bg, color: r.color, border: `1px solid ${r.border}`,
                                        }}>
                                            {r.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
