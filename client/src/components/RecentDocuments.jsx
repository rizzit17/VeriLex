import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime, formatFileSize } from "../utils/timeUtils";

const riskConfig = {
  LOW: { label: "Low Risk", bg: "rgba(45,80,22,0.15)", color: "#d4a574", border: "rgba(45,80,22,0.4)" },
  MEDIUM: { label: "Medium Risk", bg: "rgba(204,119,34,0.15)", color: "#d4a574", border: "rgba(204,119,34,0.4)" },
  HIGH: { label: "High Risk", bg: "rgba(139,46,46,0.15)", color: "#d4a574", border: "rgba(139,46,46,0.4)" },
};

// ── Compute overall risk from risky clauses ───────────────────────────────────
function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";

  const hasHigh = analysis.risky_clauses.some(c => c.risk_level === "HIGH");
  if (hasHigh) return "HIGH";

  const hasMedium = analysis.risky_clauses.some(c => c.risk_level === "MEDIUM");
  if (hasMedium) return "MEDIUM";

  return "LOW";
}

function DocItem({ entry, onClick }) {
  const [hovered, setHovered] = useState(false);
  const risk = getOverallRisk(entry.analysis);
  const r = riskConfig[risk];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(entry)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", borderRadius: 12,
        background: hovered ? "#3a2f28" : "#2a1f1a",
        border: `1px solid ${hovered ? "#6b5d52" : "#4a3728"}`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        cursor: "pointer",
      }}
    >
      {/* File icon */}
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: "#3a2f28", border: "1px solid #4a3728",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#d4a574", flexShrink: 0,
        transition: "background 0.2s",
      }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: hovered ? "#faf7f2" : "#e8dfd5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 2 }}>
          {entry.file.originalName}
        </div>
        <div style={{ fontSize: 11, color: "#a39688" }}>
          {formatRelativeTime(entry.timestamp)} · {formatFileSize(entry.file.sizeBytes)}
        </div>
      </div>

      {/* Badge */}
      <span style={{
        flexShrink: 0, padding: "3px 10px", borderRadius: 99,
        fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
        background: r.bg, color: r.color, border: `1px solid ${r.border}`,
      }}>
        {r.label}
      </span>
    </div>
  );
}

function SkeletonItem() {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px", borderRadius: 12,
      background: "#2a1f1a", border: "1px solid #4a3728",
    }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: "#3a2f28" }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 13, width: "60%", background: "#3a2f28", borderRadius: 4, marginBottom: 6 }} />
        <div style={{ height: 11, width: "40%", background: "#3a2f28", borderRadius: 4 }} />
      </div>
      <div style={{ width: 70, height: 20, background: "#3a2f28", borderRadius: 99 }} />
    </div>
  );
}

export default function RecentDocuments({ onViewAnalysis }) {
  const [hovered, setHovered] = useState(false);
  const { history, loading } = useHistory();

  const recentDocs = history.slice(0, 5);

  return (
    <section
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: "1 / -1",
        background: "#2a1f1a",
        border: `1px solid ${hovered ? "#6b5d52" : "#4a3728"}`,
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.2)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Card header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "18px 24px", borderBottom: "1px solid #4a3728",
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Fraunces', Georgia, serif" }}>
            Recent Documents
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#475569" }}>
            {loading ? "Loading..." : `${history.length} document${history.length !== 1 ? "s" : ""} analyzed`}
          </p>
        </div>
      </div>

      {/* List */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <>
            <SkeletonItem />
            <SkeletonItem />
            <SkeletonItem />
          </>
        ) : recentDocs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No documents analyzed yet</div>
            <div style={{ fontSize: 12 }}>Upload a PDF to get started</div>
          </div>
        ) : (
          recentDocs.map(entry => <DocItem key={entry.id} entry={entry} onClick={onViewAnalysis} />)
        )}
      </div>
    </section>
  );
}