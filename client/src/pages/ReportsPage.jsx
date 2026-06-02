import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime } from "../utils/timeUtils";
import { downloadPdfReport } from "../utils/reportGenerator";
import { notify } from "../components/Notifications";

function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
  if (analysis.risky_clauses.some(c => c.risk_level === "HIGH")) return "HIGH";
  if (analysis.risky_clauses.some(c => c.risk_level === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

const riskConfig = {
  LOW:    { label: "Low Risk",    cls: "vl-badge vl-badge-low" },
  MEDIUM: { label: "Medium Risk", cls: "vl-badge vl-badge-medium" },
  HIGH:   { label: "High Risk",   cls: "vl-badge vl-badge-high" },
};

function ReportCard({ entry, onDownload }) {
  const risk = getOverallRisk(entry.analysis);
  const r = riskConfig[risk];
  const clauseCount = entry.analysis?.risky_clauses?.length || 0;
  const obligCount  = entry.analysis?.key_obligations?.length || 0;

  return (
    <div style={{
      background: "var(--vl-card)", border: "1px solid var(--vl-border)",
      borderRadius: 16, padding: "20px 22px",
      display: "flex", alignItems: "center", gap: 18,
      transition: "all 0.2s ease",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--vl-border2)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--vl-border)"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.2)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* File icon */}
      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(212,164,74,0.12)", border: "1px solid rgba(212,164,74,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vl-ochre)", flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Doc info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--vl-text)", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {entry.file.originalName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "var(--vl-muted)" }}>Analyzed {formatRelativeTime(entry.timestamp)}</span>
          <span style={{ fontSize: 11, color: "var(--vl-muted)" }}>·</span>
          <span style={{ fontSize: 11, color: "var(--vl-muted)" }}>{clauseCount} risky clause{clauseCount !== 1 ? "s" : ""}</span>
          <span style={{ fontSize: 11, color: "var(--vl-muted)" }}>·</span>
          <span style={{ fontSize: 11, color: "var(--vl-muted)" }}>{obligCount} obligation{obligCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Risk badge */}
      <span className={r.cls}>{r.label}</span>

      {/* Download */}
      <button
        onClick={() => onDownload(entry)}
        className="vl-btn-primary"
        style={{ padding: "8px 16px", fontSize: 12, flexShrink: 0 }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
          <path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/>
          <path d="M7.646 11.854a.5.5 0 00.708 0l3-3a.5.5 0 00-.708-.708L8.5 10.293V1.5a.5.5 0 00-1 0v8.793L5.354 8.146a.5.5 0 10-.708.708l3 3z"/>
        </svg>
        Download PDF
      </button>
    </div>
  );
}

export default function ReportsPage() {
  const { history, loading } = useHistory();

  const handleDownload = async (entry) => {
    try {
      notify("Generating PDF report...", "info");
      await downloadPdfReport(entry);
      notify("Report downloaded successfully", "success");
    } catch (err) {
      notify("Failed to generate report", "error");
      console.error("[Report Download Error]", err);
    }
  };

  const totalReports = history.length;
  const highRisk     = history.filter(e => getOverallRisk(e.analysis) === "HIGH").length;

  return (
    <div className="vl-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="vl-page-header fade-up">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(212,164,74,0.1)", border: "1px solid rgba(212,164,74,0.2)", borderRadius: 99, padding: "3px 12px", marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--vl-ochre)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Export Center</span>
          </div>
          <h1 style={{ fontSize: 30, margin: "0 0 6px", lineHeight: 1.15 }}>Reports</h1>
          <p style={{ color: "var(--vl-muted)", fontSize: 14, margin: 0 }}>Download detailed analysis reports for your contracts</p>
        </div>

        {/* Summary pills */}
        {!loading && totalReports > 0 && (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 10 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: "var(--vl-ochre)", fontFamily: "'Playfair Display', serif" }}>{totalReports}</span>
              <span style={{ fontSize: 11, color: "var(--vl-muted)", fontWeight: 600 }}>Reports</span>
            </div>
            {highRisk > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#EF4444", fontFamily: "'Playfair Display', serif" }}>{highRisk}</span>
                <span style={{ fontSize: 11, color: "#F87171", fontWeight: 600 }}>High Risk</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Report list ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--vl-muted)", fontSize: 14 }}>Loading reports…</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.35 }}>📋</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "var(--vl-text2)", marginBottom: 8, fontFamily: "'Playfair Display', serif" }}>No reports available</div>
          <div style={{ fontSize: 13, color: "var(--vl-muted)" }}>Upload and analyze documents to generate downloadable reports</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {history.map(entry => (
            <ReportCard key={entry.id} entry={entry} onDownload={handleDownload} />
          ))}
        </div>
      )}
    </div>
  );
}
