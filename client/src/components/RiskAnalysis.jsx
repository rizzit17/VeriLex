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
    { level: "HIGH",   label: "High Risk",   value: counts.HIGH,   pct: Math.round((counts.HIGH / total) * 100),   color: "#EF4444", bar: "linear-gradient(90deg,#EF4444,#F87171)" },
    { level: "MEDIUM", label: "Medium Risk", value: counts.MEDIUM, pct: Math.round((counts.MEDIUM / total) * 100), color: "#F59E0B", bar: "linear-gradient(90deg,#F59E0B,#FCD34D)" },
    { level: "LOW",    label: "Low Risk",    value: counts.LOW,    pct: Math.round((counts.LOW / total) * 100),    color: "#4CAF50", bar: "linear-gradient(90deg,#4CAF50,#81C784)" },
  ];
}

// SVG Donut Chart
function DonutChart({ risks, total }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const cx = 60, cy = 60, r = 48, stroke = 12;
  const circum = 2 * Math.PI * r;
  let offset = 0;
  const segments = risks.map(risk => {
    const dash = animated ? (risk.pct / 100) * circum : 0;
    const gap  = circum - dash;
    const seg  = { ...risk, dash, gap, offset };
    offset += dash;
    return seg;
  });

  const dominantRisk = risks.find(r => r.value > 0)?.label || "No Data";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--vl-border)" strokeWidth={stroke} />
          {/* Segments */}
          {total === 0 ? (
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--vl-border2)" strokeWidth={stroke} />
          ) : segments.map((seg, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "60px 60px", transition: "stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)" }}
            />
          ))}
        </svg>
        {/* Center text */}
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "var(--vl-text)", fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{total}</div>
          <div style={{ fontSize: 9, color: "var(--vl-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>total</div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {risks.map(risk => (
          <div key={risk.level} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: risk.color, flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "var(--vl-muted)", fontWeight: 600 }}>{risk.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskBar({ label, value, pct, color, bar, index }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(pct), 500 + index * 120); return () => clearTimeout(t); }, [pct, index]);

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--vl-text2)" }}>{label}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}</span>
          <span style={{ fontSize: 10, color: "var(--vl-muted)" }}>{pct}%</span>
        </div>
      </div>
      <div style={{ width: "100%", height: 6, background: "var(--vl-border)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: bar, borderRadius: 99, transition: "width 0.75s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

export default function RiskAnalysis() {
  const { history, loading } = useHistory();
  const risks = computeRiskDistribution(history);
  const highRiskCount = risks.find(r => r.level === "HIGH")?.value || 0;

  return (
    <section style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
      {/* Header */}
      <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--vl-border)" }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--vl-text)", fontFamily: "'Playfair Display', Georgia, serif" }}>Risk Distribution</h2>
        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--vl-muted)" }}>
          {loading ? "Loading..." : `Across ${history.length} analyzed document${history.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      <div style={{ padding: "20px 22px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "var(--vl-muted)", fontSize: 13 }}>Loading risk data...</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.4 }}>📊</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--vl-text2)", marginBottom: 4 }}>No risk data yet</div>
            <div style={{ fontSize: 12, color: "var(--vl-muted)" }}>Upload documents to see analysis</div>
          </div>
        ) : (
          <>
            <DonutChart risks={risks} total={history.length} />
            <div style={{ height: 1, background: "var(--vl-border)", margin: "20px 0" }} />
            {risks.map((r, i) => <RiskBar key={r.level} {...r} index={i} />)}
            {highRiskCount > 0 && (
              <div style={{ marginTop: 16, padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <svg width="15" height="15" viewBox="0 0 16 16" fill="#EF4444" style={{ flexShrink: 0, marginTop: 1 }}>
                  <path fillRule="evenodd" d="M8.982 1.566a1.13 1.13 0 00-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 01-1.1 0L7.1 5.995A.905.905 0 018 5zm.002 6a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
                </svg>
                <span style={{ fontSize: 12, color: "#F87171", lineHeight: 1.5 }}>
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