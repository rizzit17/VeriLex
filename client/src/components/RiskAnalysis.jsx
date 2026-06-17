import { useEffect, useState } from "react";
import { useHistory } from "../hooks/useHistory";

function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
  if (analysis.risky_clauses.some(c => c.risk_level === "HIGH")) return "HIGH";
  if (analysis.risky_clauses.some(c => c.risk_level === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

function computeRiskDistribution(history) {
  const counts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  history.forEach(entry => { counts[getOverallRisk(entry.analysis)]++; });
  const total = history.length || 1;
  return [
    { level: "HIGH",   label: "High Risk",   value: counts.HIGH,   pct: Math.round((counts.HIGH / total) * 100),   color: "var(--vl-risk)", bar: "linear-gradient(90deg, var(--vl-risk), #FCA5A5)" },
    { level: "MEDIUM", label: "Medium Risk", value: counts.MEDIUM, pct: Math.round((counts.MEDIUM / total) * 100), color: "var(--vl-warning)", bar: "linear-gradient(90deg, var(--vl-warning), #FDE68A)" },
    { level: "LOW",    label: "Low Risk",    value: counts.LOW,    pct: Math.round((counts.LOW / total) * 100),    color: "var(--vl-success)", bar: "linear-gradient(90deg, var(--vl-success), #A7F3D0)" },
  ];
}

// SVG Donut Chart
function DonutChart({ risks, total }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);

  const cx = 70, cy = 70, r = 56, stroke = 14;
  const circum = 2 * Math.PI * r;
  let offset = 0;
  const segments = risks.map(risk => {
    const dash = animated ? (risk.pct / 100) * circum : 0;
    const gap  = circum - dash;
    const seg  = { ...risk, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ position: "relative", width: 140, height: 140 }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--vl-card2)" strokeWidth={stroke} />
          {/* Segments */}
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--vl-border)" strokeWidth={stroke} />
          ) : segments.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px", transition: "stroke-dasharray 1.2s cubic-bezier(0.22,1,0.36,1)" }}
            />
          ))}
        </svg>
        {/* Center text */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 500, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 10, color: "var(--vl-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.15em", marginTop:2 }}>total</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {risks.map(risk => (
          <div key={risk.level} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: risk.color, flexShrink: 0, boxShadow:`0 0 8px ${risk.color}80` }} />
            <span style={{ fontSize: 11, color: "var(--vl-text2)", fontWeight: 500, fontFamily:"'Inter',sans-serif" }}>{risk.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskBar({ label, value, pct, color, bar, index }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 600 + index * 150); return () => clearTimeout(t); }, [pct, index]);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--vl-text2)", fontFamily:"'Inter',sans-serif" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color, fontFamily:"'Inter',sans-serif" }}>{value}</span>
          <span style={{ fontSize: 11, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>{pct}%</span>
        </div>
      </div>
      <div style={{ width: "100%", height: 6, background: "var(--vl-card2)", borderRadius: 99, overflow: "hidden", boxShadow:"inset 0 1px 3px rgba(0,0,0,0.5)" }}>
        <div style={{ height: "100%", width: `${width}%`, background: bar, borderRadius: 99, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }} />
      </div>
    </div>
  );
}

export default function RiskAnalysis() {
  const { history, loading } = useHistory();
  const risks = computeRiskDistribution(history);
  const highRiskCount = risks.find(r => r.level === "HIGH")?.value || 0;

  return (
    <section className="glass-panel" style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
      {/* Header */}
      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--vl-border)", background:"rgba(15,23,42,0.3)" }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 500, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Risk Distribution</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--vl-muted)", fontFamily:"'Inter', sans-serif" }}>
          {loading ? "Loading..." : `Across ${history.length} analyzed document${history.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div style={{ padding: "28px 24px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--vl-muted)", fontSize: 14 }}>Loading risk data...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 20px" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.2 }}>📊</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--vl-text2)", marginBottom: 8, fontFamily:"'Inter',sans-serif" }}>No risk data yet</div>
            <div style={{ fontSize: 14, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>Upload documents to see analysis</div>
          </div>
        ) : (
          <>
            <DonutChart risks={risks} total={history.length} />
            <div style={{ height: 1, background: "var(--vl-border)", margin: "28px 0" }} />
            {risks.map((r, i) => <RiskBar key={r.level} {...r} index={i} />)}
            {highRiskCount > 0 && (
              <div className="fade-up" style={{ marginTop: 20, padding: "16px", borderRadius: 12, background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", display: "flex", gap: 12, alignItems: "flex-start", animationDelay:"1s" }}>
                <svg width="18" height="18" viewBox="0 0 16 16" fill="var(--vl-risk)" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path fillRule="evenodd" d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: 13, color: "var(--vl-risk)", lineHeight: 1.5, fontFamily:"'Inter',sans-serif" }}>
                  <strong>{highRiskCount}</strong> high-risk document{highRiskCount !== 1 ? "s" : ""} requiring immediate legal review
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}