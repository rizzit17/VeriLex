import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime } from "../utils/timeUtils";

const typeConfig = {
  success: { bg: "rgba(76,175,80,0.12)",   color: "#4CAF50", dot: "#4CAF50" },
  warning: { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B", dot: "#F59E0B" },
  info:    { bg: "rgba(212,164,74,0.12)",  color: "#D4A44A", dot: "#D4A44A" },
};

const checkSvg = (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" clipRule="evenodd" />
  </svg>
);

function ActivityItem({ title, meta, type, icon, isLast }) {
  const [hovered, setHovered] = useState(false);
  const cfg = typeConfig[type] || typeConfig.info;

  return (
    <div style={{ display: "flex", gap: 14, position: "relative" }}>
      {/* Timeline connector */}
      {!isLast && (
        <div style={{ position: "absolute", left: 17, top: 38, bottom: -12, width: 1, background: "var(--vl-border)" }} />
      )}

      {/* Icon dot */}
      <div style={{
        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1,
        boxShadow: hovered ? `0 0 12px ${cfg.color}44` : "none",
        transition: "box-shadow 0.2s",
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {icon}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 16,
        padding: "4px 12px 16px",
        borderRadius: 10,
        background: hovered ? "var(--vl-card2)" : "transparent",
        border: `1px solid ${hovered ? "var(--vl-border)" : "transparent"}`,
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        cursor: "default",
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: hovered ? "var(--vl-text)" : "var(--vl-text2)", marginBottom: 3, lineHeight: 1.35 }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: "var(--vl-muted)" }}>{meta}</div>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const { history, loading } = useHistory();

  const recentActivities = history.slice(0, 5).map((entry, i) => {
    const riskyClauses = entry.analysis?.risky_clauses?.length || 0;
    const hasHigh = entry.analysis?.risky_clauses?.some(c => c.risk_level === "HIGH");
    return {
      id:    entry.id,
      title: hasHigh ? "High-risk clauses detected — review required" : "Document analysis completed successfully",
      meta:  `${entry.file.originalName} · ${formatRelativeTime(entry.timestamp)}${riskyClauses > 0 ? ` · ${riskyClauses} clause${riskyClauses !== 1 ? "s" : ""} flagged` : ""}`,
      type:  hasHigh ? "warning" : "success",
      icon:  checkSvg,
    };
  });

  return (
    <section style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
      {/* Header */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--vl-border)" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--vl-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>
          Recent Activity
        </h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--vl-muted)" }}>
          {loading ? "Loading..." : "Latest document analysis events"}
        </p>
      </div>

      {/* Feed */}
      <div style={{ padding: "18px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--vl-muted)", fontSize: 13 }}>Loading activity...</div>
        ) : recentActivities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.4 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--vl-text2)", marginBottom: 4 }}>No activity yet</div>
            <div style={{ fontSize: 12, color: "var(--vl-muted)" }}>Your recent uploads will appear here</div>
          </div>
        ) : (
          recentActivities.map((a, i) => (
            <ActivityItem key={a.id} {...a} isLast={i === recentActivities.length - 1} />
          ))
        )}
      </div>
    </section>
  );
}