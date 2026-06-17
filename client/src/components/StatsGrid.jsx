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
      className="glass-panel"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: 16, padding: "28px 24px 24px", overflow: "hidden",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        borderColor: hovered ? topAccent : "var(--vl-border)",
        boxShadow: hovered
          ? `0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px ${topAccent} inset, 0 8px 32px ${glowColor}`
          : "0 4px 20px rgba(0,0,0,0.1)",
        transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)",
        cursor: "default",
        animation: `fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: topAccent, opacity: hovered ? 1 : 0.4, transition: "opacity 0.4s" }} />
      <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: accentColor, filter: "blur(40px)", opacity: hovered ? 0.15 : 0.05, transition: "opacity 0.4s" }} />
      
      <div style={{ width: 44, height: 44, borderRadius: 12, background: hovered ? accentColor + "20" : "transparent", border: `1px solid ${hovered ? accentColor + "40" : "var(--vl-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: accentColor, marginBottom: 20, transform: hovered ? "scale(1.05)" : "scale(1)", transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)" }}>
        {icon}
      </div>
      <div style={{ fontSize: 11, color: "var(--vl-muted)", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "Montserrat, sans-serif" }}>{label}</div>
      <div style={{ fontSize: 42, fontWeight: 500, color: "var(--vl-text)", lineHeight: 1, marginBottom: 14, fontFamily: "'Cormorant Garamond', Georgia, serif", letterSpacing: "-0.02em" }}>{count}</div>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: accentColor, background: accentColor + "10", padding: "4px 12px", borderRadius: 99, border: `1px solid ${accentColor}25`, fontFamily: "Inter, sans-serif" }}>{sublabel}</div>
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

  const docIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>;
  const checkIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>;
  const warnIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>;
  const infoIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>;

  const stats = [
    { label: "Total Documents", value: totalDocs, sublabel: loading ? "Loading…" : "All time", accentColor: "var(--vl-ochre)", glowColor: "rgba(212,175,55,0.15)", topAccent: "var(--vl-ochre)", delay: 0, icon: docIcon },
    { label: "Analyzed Today",  value: analyzedToday, sublabel: loading ? "Loading…" : `${analyzedToday} today`, accentColor: "var(--vl-success)", glowColor: "rgba(52,211,153,0.15)", topAccent: "var(--vl-success)", delay: 100, icon: checkIcon },
    { label: "High Risk Items", value: highRiskItems, sublabel: highRiskItems > 0 ? "Needs review" : "All clear", accentColor: highRiskItems > 0 ? "var(--vl-risk)" : "var(--vl-success)", glowColor: highRiskItems > 0 ? "rgba(248,113,113,0.15)" : "rgba(52,211,153,0.15)", topAccent: highRiskItems > 0 ? "var(--vl-risk)" : "var(--vl-success)", delay: 200, icon: warnIcon },
    { label: "Total Risky Clauses", value: totalRisky, sublabel: loading ? "Loading…" : `Across ${totalDocs} docs`, accentColor: "var(--vl-warning)", glowColor: "rgba(251,191,36,0.15)", topAccent: "var(--vl-warning)", delay: 300, icon: infoIcon },
  ];

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 40 }}>
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </section>
  );
}