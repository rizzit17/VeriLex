import { useEffect, useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { isToday } from "../utils/timeUtils";

function useCountUp(target, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) { setVal(0); return; }
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

function StatCard({ icon, accentColor, glowColor, label, value, sublabel, delay, topAccent }) {
  const count = useCountUp(value);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: "var(--vl-card)",
        border: `1px solid ${hovered ? "var(--vl-border2)" : "var(--vl-border)"}`,
        borderRadius: 18, padding: "24px 24px 20px", overflow: "hidden",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 20px 48px rgba(0,0,0,0.55), 0 8px 32px ${glowColor}`
          : "0 4px 16px rgba(0,0,0,0.3)",
        transition: "all 0.28s cubic-bezier(0.4,0,0.2,1)",
        cursor: "default",
        animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: topAccent, opacity: hovered ? 1 : 0.6, transition: "opacity 0.25s" }} />
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: accentColor + "0D", filter: "blur(20px)", opacity: hovered ? 1 : 0, transition: "opacity 0.25s" }} />
      <div style={{ width: 48, height: 48, borderRadius: 13, background: accentColor + "18", border: `1px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, marginBottom: 16, transform: hovered ? "scale(1.08) rotate(-3deg)" : "scale(1)", transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1)", boxShadow: hovered ? `0 4px 16px ${accentColor}33` : "none" }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, color: "var(--vl-muted)", fontWeight: 600, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "Montserrat, sans-serif" }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 500, color: "var(--vl-text)", lineHeight: 1, marginBottom: 12, fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.01em" }}>{count}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: accentColor, background: accentColor + "15", padding: "4px 10px", borderRadius: 99, border: `1px solid ${accentColor}25`, fontFamily: "Montserrat, sans-serif" }}>{sublabel}</div>
    </div>
  );
}

function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
  if (analysis.risky_clauses.some(c => c.risk_level === "HIGH")) return "HIGH";
  if (analysis.risky_clauses.some(c => c.risk_level === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

export default function StatsGrid() {
  const { history, loading } = useHistory();
  const totalDocs     = history.length;
  const analyzedToday = history.filter(e => isToday(e.timestamp)).length;
  const highRiskItems = history.filter(e => getOverallRisk(e.analysis) === "HIGH").length;
  const totalRisky    = history.reduce((s, e) => s + (e.analysis?.risky_clauses?.length || 0), 0);

  const docIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>;
  const checkIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>;
  const warnIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>;
  const infoIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>;

  const stats = [
    { label: "Total Documents", value: totalDocs, sublabel: loading ? "Loading…" : "All time", accentColor: "var(--vl-ochre)", glowColor: "rgba(224,195,154,0.12)", topAccent: "var(--vl-ochre)", delay: 0, icon: docIcon },
    { label: "Analyzed Today",  value: analyzedToday, sublabel: loading ? "Loading…" : `${analyzedToday} today`, accentColor: "#4CAF50", glowColor: "rgba(76,175,80,0.1)", topAccent: "#4CAF50", delay: 80, icon: checkIcon },
    { label: "High Risk Items", value: highRiskItems, sublabel: highRiskItems > 0 ? "Needs review" : "All clear", accentColor: highRiskItems > 0 ? "#EF4444" : "#4CAF50", glowColor: highRiskItems > 0 ? "rgba(239,68,68,0.1)" : "rgba(76,175,80,0.1)", topAccent: highRiskItems > 0 ? "#EF4444" : "#4CAF50", delay: 160, icon: warnIcon },
    { label: "Total Risky Clauses", value: totalRisky, sublabel: loading ? "Loading…" : `Across ${totalDocs} docs`, accentColor: "#F59E0B", glowColor: "rgba(245,158,11,0.1)", topAccent: "#F59E0B", delay: 240, icon: infoIcon },
  ];

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 36 }}>
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </section>
  );
}