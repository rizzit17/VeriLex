import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime, formatFileSize } from "../utils/timeUtils";

const riskConfig = {
  LOW:    { label: "Low Risk",    cls: "vl-badge vl-badge-low" },
  MEDIUM: { label: "Medium Risk", cls: "vl-badge vl-badge-medium" },
  HIGH:   { label: "High Risk",   cls: "vl-badge vl-badge-high" },
};

function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
  if (analysis.risky_clauses.some(c => c.risk_level === "HIGH")) return "HIGH";
  if (analysis.risky_clauses.some(c => c.risk_level === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

const fileIcon = (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
);

function DocRow({ entry, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  const risk = getOverallRisk(entry.analysis);
  const r = riskConfig[risk];
  const clauseCount = entry.analysis?.risky_clauses?.length || 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(entry)}
      style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "16px 20px", borderRadius: 12,
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
        border: `1px solid ${hovered ? "var(--vl-border2)" : "transparent"}`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        cursor: "pointer",
        animation: `fadeLeft 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 80}ms both`
      }}
    >
      {/* File icon */}
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0,
        background: hovered ? "rgba(212,175,55,0.15)" : "rgba(212,175,55,0.05)",
        border: `1px solid ${hovered ? "rgba(212,175,55,0.3)" : "var(--vl-border)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--vl-ochre)",
        transition: "all 0.3s ease",
        boxShadow: hovered ? "0 4px 12px rgba(212,175,55,0.2)" : "none"
      }}>
        {fileIcon}
      </div>

      {/* File info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: hovered ? "var(--vl-text)" : "var(--vl-text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4, fontFamily: "'Inter', sans-serif" }}>
          {entry.file.originalName}
        </div>
        <div style={{ fontSize: 12, color: "var(--vl-muted)", fontFamily: "'Inter', sans-serif" }}>
          {formatRelativeTime(entry.timestamp)} · {formatFileSize(entry.file.sizeBytes)}
        </div>
      </div>

      {/* Clause count */}
      <div style={{ fontSize: 13, color: "var(--vl-muted)", fontWeight: 500, flexShrink: 0, minWidth: 70, textAlign: "center", fontFamily:"'Inter', sans-serif" }}>
        {clauseCount > 0 ? (
          <span style={{ color: risk === "HIGH" ? "var(--vl-risk)" : risk === "MEDIUM" ? "var(--vl-warning)" : "var(--vl-muted)" }}>
            {clauseCount} clause{clauseCount !== 1 ? "s" : ""}
          </span>
        ) : <span>Clean</span>}
      </div>

      {/* Risk badge */}
      <span className={r.cls}>{r.label}</span>

      {/* Arrow */}
      <div style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-4px)", transition: "all 0.3s", color: "var(--vl-ochre)", flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
      <div className="vl-skeleton" style={{ width: 42, height: 42, borderRadius: 12, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="vl-skeleton" style={{ height: 14, width: "55%", marginBottom: 8 }} />
        <div className="vl-skeleton" style={{ height: 12, width: "35%" }} />
      </div>
      <div className="vl-skeleton" style={{ width: 80, height: 24, borderRadius: 99 }} />
    </div>
  );
}

export default function RecentDocuments({ onViewAnalysis }) {
  const { history, loading } = useHistory();
  const recentDocs = history.slice(0, 6);

  return (
    <section className="glass-panel" style={{
      gridColumn: "1 / -1",
      borderRadius: 20, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px", borderBottom: "1px solid var(--vl-border)", background:"rgba(15,23,42,0.3)" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            Recent Documents
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--vl-muted)", fontFamily:"'Inter', sans-serif" }}>
            {loading ? "Loading..." : `${history.length} document${history.length !== 1 ? "s" : ""} analyzed`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="vl-badge vl-badge-ochre">
            {recentDocs.length} recent
          </span>
        </div>
      </div>

      {/* Column headers */}
      {!loading && recentDocs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "12px 20px", borderBottom: "1px solid var(--vl-border)" }}>
          <div style={{ width: 42, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily:"'Montserrat',sans-serif" }}>Document</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.15em", minWidth: 70, textAlign: "center", fontFamily:"'Montserrat',sans-serif" }}>Clauses</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.15em", minWidth: 80, fontFamily:"'Montserrat',sans-serif" }}>Risk Level</div>
          <div style={{ width: 16, flexShrink: 0 }} />
        </div>
      )}

      {/* List */}
      <div style={{ padding: "12px 8px" }}>
        {loading ? (
          <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
        ) : recentDocs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📄</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--vl-text2)", marginBottom: 8, fontFamily:"'Inter',sans-serif" }}>No documents yet</div>
            <div style={{ fontSize: 14, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>Upload a PDF contract to get started</div>
          </div>
        ) : (
          recentDocs.map((entry, i) => <DocRow key={entry.id} entry={entry} index={i} onClick={onViewAnalysis} />)
        )}
      </div>
    </section>
  );
}