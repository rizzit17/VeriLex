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

function ReportCard({ entry, onDownload, index }) {
  const risk = getOverallRisk(entry.analysis);
  const r = riskConfig[risk];
  const clauseCount = entry.analysis?.risky_clauses?.length || 0;
  const obligCount  = entry.analysis?.key_obligations?.length || 0;

  return (
    <div className="glass-panel" style={{
      borderRadius: 16, padding: "24px 28px",
      display: "flex", alignItems: "center", gap: 24,
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 80 + 100}ms both`
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--vl-border-gold)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.background = "var(--vl-card2)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--vl-border)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "var(--vl-card)"; }}
    >
      {/* File icon */}
      <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--vl-ochre)", flexShrink: 0, boxShadow:"0 0 12px rgba(212,175,55,0.15)" }}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Doc info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: "var(--vl-text)", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily:"'Cormorant Garamond', serif" }}>
          {entry.file.originalName}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>Analyzed {formatRelativeTime(entry.timestamp)}</span>
          <span style={{ fontSize: 12, color: "var(--vl-border2)" }}>|</span>
          <span style={{ fontSize: 12, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>{clauseCount} risky clause{clauseCount !== 1 ? "s" : ""}</span>
          <span style={{ fontSize: 12, color: "var(--vl-border2)" }}>|</span>
          <span style={{ fontSize: 12, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>{obligCount} obligation{obligCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Risk badge */}
      <span className={r.cls}>{r.label}</span>

      {/* Download */}
      <button
        onClick={() => onDownload(entry)}
        className="vl-btn-primary"
        style={{ padding: "10px 20px", fontSize: 11, flexShrink: 0 }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
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
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 99, padding: "4px 14px", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", display: "inline-block", boxShadow:"0 0 8px rgba(212,175,55,0.8)" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--vl-ochre)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily:"'Montserrat',sans-serif" }}>Export Center</span>
          </div>
          <h1 style={{ fontSize: 36, margin: "0 0 8px", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', serif" }}>Reports</h1>
          <p style={{ color: "var(--vl-muted)", fontSize: 15, margin: 0, fontFamily:"'Inter', sans-serif" }}>Download detailed analysis reports for your contracts</p>
        </div>

        {/* Summary pills */}
        {!loading && totalReports > 0 && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div className="glass-panel" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 12 }}>
              <span style={{ fontSize: 24, fontWeight: 500, color: "var(--vl-ochre)", fontFamily: "'Cormorant Garamond', serif" }}>{totalReports}</span>
              <span style={{ fontSize: 12, color: "var(--vl-text)", fontWeight: 600, fontFamily:"'Inter',sans-serif" }}>Reports</span>
            </div>
            {highRisk > 0 && (
              <div className="glass-panel" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: 12 }}>
                <span style={{ fontSize: 24, fontWeight: 500, color: "var(--vl-risk)", fontFamily: "'Cormorant Garamond', serif" }}>{highRisk}</span>
                <span style={{ fontSize: 12, color: "var(--vl-risk)", fontWeight: 600, fontFamily:"'Inter',sans-serif" }}>High Risk</span>
              </div>
            )}
          </div>
        )}
      </header>

      {/* ── Report list ─────────────────────────────────────────── */}
      {loading ? (
        <div className="fade-up delay-100" style={{ textAlign: "center", padding: "80px 20px", color: "var(--vl-muted)", fontSize: 15 }}>Loading reports…</div>
      ) : history.length === 0 ? (
        <div className="fade-up delay-100" style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.35 }}>📋</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: "var(--vl-text)", marginBottom: 12, fontFamily: "'Cormorant Garamond', serif" }}>No reports available</div>
          <div style={{ fontSize: 14, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>Upload and analyze documents to generate downloadable reports</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16 }}>
          {history.map((entry, i) => (
            <ReportCard key={entry.id} entry={entry} index={i} onDownload={handleDownload} />
          ))}
        </div>
      )}
    </div>
  );
}
