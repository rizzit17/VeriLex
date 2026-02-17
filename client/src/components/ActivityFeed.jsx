import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { formatRelativeTime } from "../utils/timeUtils";

const typeConfig = {
  success: { bg: "rgba(45,80,22,0.15)", color: "#d4a574", ring: "rgba(212,165,116,0.3)" },
  warning: { bg: "rgba(204,119,34,0.15)", color: "#d4a574", ring: "rgba(204,119,34,0.3)" },
  info: { bg: "rgba(212,165,116,0.12)", color: "#d4a574", ring: "rgba(212,165,116,0.3)" },
};

const successIcon = <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" clipRule="evenodd" /></svg>;

function ActivityItem({ title, meta, type, icon }) {
  const [hovered, setHovered] = useState(false);
  const cfg = typeConfig[type];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", gap: 13, alignItems: "flex-start",
        padding: "12px 14px", borderRadius: 12,
        background: hovered ? "#3a2f28" : "#2a1f1a",
        border: `1px solid ${hovered ? "#6b5d52" : "#4a3728"}`,
        transform: hovered ? "translateX(4px)" : "translateX(0)",
        boxShadow: hovered ? "0 4px 16px rgba(0,0,0,0.3)" : "none",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        cursor: "pointer",
      }}
    >
      {/* Icon circle */}
      <div style={{
        width: 34, height: 34, borderRadius: 10,
        background: cfg.bg, color: cfg.color,
        border: `1px solid ${hovered ? cfg.ring : cfg.bg}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, transition: "all 0.2s ease",
        boxShadow: hovered ? `0 0 12px ${cfg.color}44` : "none",
      }}>
        {icon}
      </div>

      {/* Text */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: hovered ? "#f1f5f9" : "#cbd5e1", marginBottom: 3, lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: "#475569" }}>{meta}</div>
      </div>

      {/* Arrow on hover */}
      <div style={{
        marginLeft: "auto", flexShrink: 0, color: "#334155",
        opacity: hovered ? 1 : 0, transform: hovered ? "translateX(0)" : "translateX(-4px)",
        transition: "all 0.2s ease", display: "flex", alignItems: "center",
      }}>
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

export default function ActivityFeed() {
  const [hovered, setHovered] = useState(false);
  const { history, loading } = useHistory();

  const recentActivities = history.slice(0, 4).map(entry => ({
    id: entry.id,
    title: "Document analysis completed",
    meta: `${entry.file.originalName} · ${formatRelativeTime(entry.timestamp)}`,
    type: "success",
    icon: successIcon,
  }));

  return (
    <section
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#2a1f1a",
        border: `1px solid ${hovered ? "#6b5d52" : "#4a3728"}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.35)" : "0 2px 8px rgba(0,0,0,0.2)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #4a3728" }}>
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Fraunces', Georgia, serif" }}>
          Recent Activity
        </h2>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#475569" }}>
          {loading ? "Loading..." : "Last 4 uploads"}
        </p>
      </div>

      {/* Feed */}
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "20px", color: "#475569", fontSize: 12 }}>
            Loading activity...
          </div>
        ) : recentActivities.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "#475569" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No documents analyzed yet</div>
            <div style={{ fontSize: 12 }}>Your recent activity will appear here</div>
          </div>
        ) : (
          recentActivities.map(a => <ActivityItem key={a.id} {...a} />)
        )}
      </div>
    </section>
  );
}