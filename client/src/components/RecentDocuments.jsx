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
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
  </svg>
);

function DocRow({ entry, onClick }) {
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
        display: "flex", alignItems: "center", gap: 14,
        padding: "13px 16px", borderRadius: 12,
        background: hovered ? "var(--vl-card2)" : "transparent",
        border: `1px solid ${hovered ? "var(--vl-border2)" : "transparent"}`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? "0 4px 20px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        cursor: "pointer",
      }}
    >
      {/* File icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: hovered ? "rgba(212,164,74,0.2)" : "rgba(212,164,74,0.1)",
        border: "1px solid rgba(212,164,74,0.2)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "var(--vl-ochre)",
        transition: "all 0.2s ease",
      }}>
        {fileIcon}
      </div>

      {/* File info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: hovered ? "var(--vl-text)" : "var(--vl-text2)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
          {entry.file.originalName}
        </div>
        <div style={{ fontSize: 11, color: "var(--vl-muted)" }}>
          {formatRelativeTime(entry.timestamp)} · {formatFileSize(entry.file.sizeBytes)}
        </div>
      </div>

      {/* Clause count */}
      <div style={{ fontSize: 12, color: "var(--vl-muted)", fontWeight: 500, flexShrink: 0, minWidth: 60, textAlign: "center" }}>
        {clauseCount > 0 ? (
          <span style={{ color: risk === "HIGH" ? "#EF4444" : risk === "MEDIUM" ? "#F59E0B" : "var(--vl-muted)" }}>
            {clauseCount} clause{clauseCount !== 1 ? "s" : ""}
          </span>
        ) : <span>Clean</span>}
      </div>

      {/* Risk badge */}
      <span className={r.cls}>{r.label}</span>

      {/* Arrow */}
      <div style={{ opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-4px)", transition: "all 0.2s", color: "var(--vl-ochre)", flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px" }}>
      <div className="vl-skeleton" style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="vl-skeleton" style={{ height: 12, width: "55%", marginBottom: 6 }} />
        <div className="vl-skeleton" style={{ height: 10, width: "35%" }} />
      </div>
      <div className="vl-skeleton" style={{ width: 70, height: 20, borderRadius: 99 }} />
    </div>
  );
}

export default function RecentDocuments({ onViewAnalysis }) {
  const { history, loading } = useHistory();
  const recentDocs = history.slice(0, 6);

  return (
    <section style={{
      gridColumn: "1 / -1",
      background: "var(--vl-card)",
      border: "1px solid var(--vl-border)",
      borderRadius: 18, overflow: "hidden",
      boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      transition: "border-color 0.25s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid var(--vl-border)" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--vl-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>
            Recent Documents
          </h2>
          <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--vl-muted)" }}>
            {loading ? "Loading..." : `${history.length} document${history.length !== 1 ? "s" : ""} analyzed`}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="vl-badge vl-badge-ochre" style={{ fontSize: 11 }}>
            {recentDocs.length} recent
          </span>
        </div>
      </div>

      {/* Column headers */}
      {!loading && recentDocs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "9px 16px", borderBottom: "1px solid rgba(74,54,38,0.5)" }}>
          <div style={{ width: 38, flexShrink: 0 }} />
          <div style={{ flex: 1, fontSize: 10, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Document</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 60, textAlign: "center" }}>Clauses</div>
          <div style={{ fontSize: 10, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 80 }}>Risk Level</div>
          <div style={{ width: 14, flexShrink: 0 }} />
        </div>
      )}

      {/* List */}
      <div style={{ padding: "8px 6px" }}>
        {loading ? (
          <><SkeletonRow /><SkeletonRow /><SkeletonRow /></>
        ) : recentDocs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 44, marginBottom: 12, opacity: 0.4 }}>📄</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--vl-text2)", marginBottom: 6 }}>No documents yet</div>
            <div style={{ fontSize: 13, color: "var(--vl-muted)" }}>Upload a PDF contract to get started</div>
          </div>
        ) : (
          recentDocs.map(entry => <DocRow key={entry.id} entry={entry} onClick={onViewAnalysis} />)
        )}
      </div>
    </section>
  );
}