import { useEffect, useState } from "react";
import { useHistory } from "../hooks/useHistory";

// ── Compute overall risk from risky clauses ───────────────────────────────────
function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";

  const hasHigh = analysis.risky_clauses.some(c => c.risk_level === "HIGH");
  if (hasHigh) return "HIGH";

  const hasMedium = analysis.risky_clauses.some(c => c.risk_level === "MEDIUM");
  if (hasMedium) return "MEDIUM";

  return "LOW";
}

// ── Compute risk distribution from history ────────────────────────────────────
function computeRiskDistribution(history) {
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };

  history.forEach(entry => {
    const risk = getOverallRisk(entry.analysis);
    counts[risk]++;
  });

  const total = history.length || 1;

  return [
    {
      level: "low", label: "Low Risk", value: counts.LOW,
      pct: Math.round((counts.LOW / total) * 100),
      color: "#d4a574", bg: "rgba(45,80,22,0.15)", border: "rgba(45,80,22,0.3)",
      bar: "linear-gradient(90deg,#2d5016,#4a6b2e)"
    },
    {
      level: "medium", label: "Medium Risk", value: counts.MEDIUM,
      pct: Math.round((counts.MEDIUM / total) * 100),
      color: "#d4a574", bg: "rgba(204,119,34,0.15)", border: "rgba(204,119,34,0.3)",
      bar: "linear-gradient(90deg,#cc7722,#e89a3c)"
    },
    {
      level: "high", label: "High Risk", value: counts.HIGH,
      pct: Math.round((counts.HIGH / total) * 100),
      color: "#d4a574", bg: "rgba(139,46,46,0.15)", border: "rgba(139,46,46,0.3)",
      bar: "linear-gradient(90deg,#8b2e2e,#a84444)"
    },
  ];
}

// ── Find most common issue ────────────────────────────────────────────────────
function getMostCommonIssue(history) {
  const issueCounts = {};

  history.forEach(entry => {
    if (!entry.analysis?.risky_clauses) return;
    entry.analysis.risky_clauses.forEach(clause => {
      if (!clause.reason) return;
      // Extract first few words as the issue type
      const issue = clause.reason.split(/[.,:;]|(?:\s+and\s+)/i)[0].trim();
      if (issue) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      }
    });
  });

  const entries = Object.entries(issueCounts);
  if (entries.length === 0) return "No issues detected";

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function RiskBar({ label, value, pct, color, bg, border, bar, index }) {
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 400 + index * 120);
    return () => clearTimeout(t);
  }, [pct, index]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "14px 16px", borderRadius: 12,
        background: hovered ? bg : "transparent",
        border: `1px solid ${hovered ? border : "transparent"}`,
        transition: "all 0.2s ease",
        display: "flex", flexDirection: "column", gap: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          display: "inline-flex", padding: "3px 10px", borderRadius: 99,
          fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
          background: bg, color, border: `1px solid ${border}`,
        }}>
          {label}
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, color, fontFamily: "'Fraunces', Georgia, serif" }}>
          {value.toLocaleString()}
        </span>
      </div>
      {/* Track */}
      <div style={{ width: "100%", height: 7, background: "#3a2f28", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: bar, borderRadius: 99,
          transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: hovered ? `0 0 10px ${color}66` : "none",
        }} />
      </div>
      <div style={{ fontSize: 11, color: "#a39688", textAlign: "right" }}>{pct}% of total</div>
    </div>
  );
}

export default function RiskAnalysis() {
  const [hovered, setHovered] = useState(false);
  const { history, loading } = useHistory();

  const risks = computeRiskDistribution(history);
  const mostCommonIssue = getMostCommonIssue(history);
  const highRiskCount = risks.find(r => r.level === "high")?.value || 0;

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
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#faf7f2", fontFamily: "'Playfair Display', Georgia, serif" }}>
          Risk Distribution
        </h2>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#a39688" }}>
          {loading ? "Loading..." : `Across ${history.length} analyzed document${history.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {/* Bars */}
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#a39688" }}>
          <div style={{ fontSize: 12 }}>Loading risk data...</div>
        </div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#a39688" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No risk data available</div>
          <div style={{ fontSize: 12 }}>Upload documents to see risk analysis</div>
        </div>
      ) : (
        <>
          <div style={{ padding: "12px 8px" }}>
            {risks.map((r, i) => <RiskBar key={r.level} {...r} index={i} />)}
          </div>

          {/* Insights */}
          <div style={{ margin: "0 20px 20px", padding: "16px", borderRadius: 12, background: "#2a1f1a", border: "1px solid #4a3728" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
              Key Insights
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li style={{ display: "flex", gap: 10, fontSize: 13, color: "#94a3b8", alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="#d4a574" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.707-8.707l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L7 8.172l3.293-3.293a1 1 0 011.414 1.414z" clipRule="evenodd" />
                </svg>
                {highRiskCount} high-risk clause{highRiskCount !== 1 ? "s" : ""} detected
              </li>
              <li style={{ display: "flex", gap: 10, fontSize: 13, color: "#94a3b8", alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="#d4a574" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm3.707-8.707l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L7 8.172l3.293-3.293a1 1 0 011.414 1.414z" clipRule="evenodd" />
                </svg>
                Most common issue: {mostCommonIssue}
              </li>
            </ul>
          </div>
        </>
      )}
    </section>
  );
}