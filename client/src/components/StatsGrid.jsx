import { useEffect, useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { isToday } from "../utils/timeUtils";

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      current += step;
      if (current >= target) { setVal(target); clearInterval(t); }
      else setVal(Math.floor(current));
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return val.toLocaleString();
}

function StatCard({ icon, iconBg, iconColor, label, value, change, changeType, delay, accentColor }) {
  const count = useCountUp(value);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#3a2f28" : "#2a1f1a",
        border: `1px solid ${hovered ? accentColor + "33" : "#4a3728"}`,
        borderRadius: 16,
        padding: "22px 24px",
        display: "flex", gap: 18, alignItems: "flex-start",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${accentColor}1a` : "0 2px 8px rgba(0,0,0,0.2)",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
        cursor: "default",
        animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
      }}
    >
      {/* Icon */}
      <div style={{
        width: 52, height: 52, borderRadius: 13,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: iconColor, flexShrink: 0,
        border: `1px solid ${iconColor}22`,
        transition: "transform 0.25s ease",
        transform: hovered ? "scale(1.08)" : "scale(1)",
      }}>
        {icon}
      </div>

      {/* Content */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, color: "#6b5d52", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
        <div style={{ fontSize: 32, fontWeight: 800, color: "#faf7f2", lineHeight: 1, marginBottom: 8, fontFamily: "'Playfair Display', Georgia, serif" }}>
          {count}
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 11, fontWeight: 600,
          color: changeType === "positive" ? "#2d5016" : changeType === "negative" ? "#8b2e2e" : "#6b5d52",
          background: changeType === "positive" ? "rgba(45,80,22,0.15)" : changeType === "negative" ? "rgba(139,46,46,0.15)" : "rgba(107,93,82,0.15)",
          padding: "3px 8px", borderRadius: 99,
        }}>
          {changeType === "positive" && <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M6 3l4 4H8v3H4V7H2l4-4z" /></svg>}
          {changeType === "negative" && <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor"><path d="M6 9l4-4H8V2H4v3H2l4 4z" /></svg>}
          {change}
        </div>
      </div>
    </div>
  );
}

// ── Compute overall risk from risky clauses ───────────────────────────────────
function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
  const hasHigh = analysis.risky_clauses.some(c => c.risk_level === "HIGH");
  if (hasHigh) return "HIGH";
  const hasMedium = analysis.risky_clauses.some(c => c.risk_level === "MEDIUM");
  if (hasMedium) return "MEDIUM";
  return "LOW";
}

export default function StatsGrid() {
  const { history, loading } = useHistory();

  const totalDocs = history.length;
  const analyzedToday = history.filter(entry => isToday(entry.timestamp)).length;
  const highRiskItems = history.filter(entry => getOverallRisk(entry.analysis) === "HIGH").length;

  const stats = [
    {
      label: "Total Documents", value: totalDocs, change: loading ? "Loading..." : "All time", changeType: "neutral", iconBg: "rgba(212,165,116,0.15)", iconColor: "#d4a574", accentColor: "#d4a574", delay: 0,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
    },
    {
      label: "Analyzed Today", value: analyzedToday, change: loading ? "Loading..." : "Today", changeType: "positive", iconBg: "rgba(45,80,22,0.15)", iconColor: "#2d5016", accentColor: "#2d5016", delay: 60,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
    },
    {
      label: "High Risk Items", value: highRiskItems, change: loading ? "Loading..." : "Needs review", changeType: highRiskItems > 0 ? "negative" : "neutral", iconBg: "rgba(204,119,34,0.15)", iconColor: "#cc7722", accentColor: "#cc7722", delay: 120,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
    },
    {
      label: "Pending Review", value: 0, change: "No pending items", changeType: "neutral", iconBg: "rgba(184,134,11,0.15)", iconColor: "#b8860b", accentColor: "#b8860b", delay: 180,
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" clipRule="evenodd" /></svg>
    },
  ];

  return (
    <section style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 16, marginBottom: 36,
    }}>
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </section>
  );
}