import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime } from "../utils/timeUtils";

const typeConfig = {
  success: { bg: "rgba(52,211,153,0.1)",   color: "var(--vl-success)", dot: "var(--vl-success)" },
  warning: { bg: "rgba(251,191,36,0.1)",  color: "var(--vl-warning)", dot: "var(--vl-warning)" },
  info:    { bg: "rgba(212,175,55,0.1)",  color: "var(--vl-ochre)", dot: "var(--vl-ochre)" },
};

const checkSvg = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" clipRule="evenodd" />
  </svg>
);

function ActivityItem({ title, meta, type, icon, isLast, index }) {
  const [hovered, setHovered] = useState(false);
  const cfg = typeConfig[type] || typeConfig.info;

  return (
    <div style={{ 
      display: "flex", gap: 16, position: "relative",
      animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${index * 80 + 200}ms both`
    }}>
      {/* Timeline connector */}
      {!isLast && (
        <div style={{ position: "absolute", left: 18, top: 40, bottom: -12, width: 2, background: "var(--vl-border)" }} />
      )}

      {/* Icon dot */}
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: hovered ? `${cfg.bg.replace('0.1', '0.2')}` : cfg.bg, color: cfg.color,
        border: `1px solid ${cfg.color}30`,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1,
        boxShadow: hovered ? `0 0 16px ${cfg.color}40` : "none",
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {icon}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, minWidth: 0, paddingBottom: isLast ? 0 : 20,
        padding: "6px 14px 20px",
        borderRadius: 12,
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
        border: `1px solid ${hovered ? "var(--vl-border2)" : "transparent"}`,
        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
        cursor: "default",
      }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: hovered ? "var(--vl-text)" : "var(--vl-text2)", marginBottom: 4, lineHeight: 1.4, fontFamily:"'Inter',sans-serif" }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>{meta}</div>
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
    <section className="glass-panel" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--vl-border)", background:"rgba(15,23,42,0.3)" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
          Recent Activity
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--vl-muted)", fontFamily:"'Inter', sans-serif" }}>
          {loading ? "Loading..." : "Latest document analysis events"}
        </p>
      </div>

      {/* Feed */}
      <div style={{ padding: "24px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "24px", color: "var(--vl-muted)", fontSize: 14 }}>Loading activity...</div>
        ) : recentActivities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--vl-text2)", marginBottom: 8, fontFamily:"'Inter', sans-serif" }}>No activity yet</div>
            <div style={{ fontSize: 14, color: "var(--vl-muted)", fontFamily:"'Inter', sans-serif" }}>Your recent uploads will appear here</div>
          </div>
        ) : (
          recentActivities.map((a, i) => (
            <ActivityItem key={a.id} {...a} isLast={i === recentActivities.length - 1} index={i} />
          ))
        )}
      </div>
    </section>
  );
}