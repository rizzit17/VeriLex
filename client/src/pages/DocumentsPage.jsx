import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime, formatFileSize } from "../utils/timeUtils";

function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
  if (analysis.risky_clauses.some(c => c.risk_level === "HIGH")) return "HIGH";
  if (analysis.risky_clauses.some(c => c.risk_level === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

const riskConfig = {
  LOW:    { label: "Low",    cls: "vl-badge vl-badge-low" },
  MEDIUM: { label: "Medium", cls: "vl-badge vl-badge-medium" },
  HIGH:   { label: "High",   cls: "vl-badge vl-badge-high" },
};

function SkeletonRow() {
  return (
    <tr>
      {[20, 14, 10, 8, 10].map((w, i) => (
        <td key={i} style={{ padding: "16px 18px" }}>
          <div className="vl-skeleton" style={{ height: 12, width: `${w * 4}px`, maxWidth: "100%" }} />
        </td>
      ))}
    </tr>
  );
}

export default function DocumentsPage({ onViewAnalysis }) {
  const { history, loading } = useHistory();
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredRow, setHoveredRow] = useState(null);

  const filteredDocs = history.filter(entry =>
    entry.file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="vl-page">
      {/* ── Page header ─────────────────────────────────────── */}
      <header className="vl-page-header fade-up">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(224,195,154,0.1)", border: "1px solid rgba(224,195,154,0.2)", borderRadius: 99, padding: "3px 12px", marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--vl-ochre)", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "Montserrat, sans-serif" }}>Document Library</span>
          </div>
          <h1 style={{ fontSize: 30, margin: "0 0 6px", lineHeight: 1.15 }}>Documents</h1>
          <p style={{ color: "var(--vl-muted)", fontSize: 14, margin: 0 }}>
            {loading ? "Loading..." : `${history.length} contract${history.length !== 1 ? "s" : ""} analyzed`}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--vl-muted)", pointerEvents: "none" }} width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="vl-input"
            style={{ paddingLeft: 36, width: 280 }}
          />
        </div>
      </header>

      {/* ── Table ─────────────────────────────────────────────── */}
      {!loading && filteredDocs.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.35 }}>📄</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--vl-text2)", marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>
            {searchQuery ? "No documents found" : "No documents analyzed yet"}
          </div>
          <div style={{ fontSize: 13, color: "var(--vl-muted)", fontFamily: "Montserrat, sans-serif" }}>
            {searchQuery ? `No results for "${searchQuery}"` : "Upload a PDF contract to begin your first analysis"}
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--vl-card2)", borderBottom: "1px solid var(--vl-border)" }}>
                {["Filename", "Analyzed", "Size", "Risk Level", "Clauses", "Actions"].map((h, i) => (
                  <th key={h} style={{
                    padding: "14px 18px",
                    textAlign: i === 5 ? "right" : "left",
                    fontSize: 10.5, fontWeight: 700,
                    color: "var(--vl-muted2)", letterSpacing: "0.1em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
              ) : filteredDocs.map((entry, i) => {
                const risk = getOverallRisk(entry.analysis);
                const r = riskConfig[risk];
                const clauseCount = entry.analysis?.risky_clauses?.length || 0;
                const isHovered = hoveredRow === entry.id;
                return (
                  <tr key={entry.id}
                    onMouseEnter={() => setHoveredRow(entry.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: i < filteredDocs.length - 1 ? "1px solid var(--vl-border)" : "none",
                      background: isHovered ? "var(--vl-card2)" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <td style={{ padding: "15px 18px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(224,195,154,0.1)", border: "1px solid rgba(224,195,154,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vl-ochre)", flexShrink: 0 }}>
                          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--vl-text2)", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {entry.file.originalName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "15px 18px", fontSize: 13, color: "var(--vl-muted)" }}>{formatRelativeTime(entry.timestamp)}</td>
                    <td style={{ padding: "15px 18px", fontSize: 13, color: "var(--vl-muted)" }}>{formatFileSize(entry.file.sizeBytes)}</td>
                    <td style={{ padding: "15px 18px" }}><span className={r.cls}>{r.label}</span></td>
                    <td style={{ padding: "15px 18px", fontSize: 13, color: clauseCount > 0 ? (risk === "HIGH" ? "#EF4444" : risk === "MEDIUM" ? "#F59E0B" : "var(--vl-muted)") : "var(--vl-muted)" }}>
                      {clauseCount > 0 ? `${clauseCount} flagged` : "—"}
                    </td>
                    <td style={{ padding: "15px 18px", textAlign: "right" }}>
                      <button
                        onClick={() => onViewAnalysis(entry)}
                        className="vl-btn-ghost"
                        style={{ padding: "6px 14px", fontSize: 12 }}
                      >
                        View Analysis
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
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
