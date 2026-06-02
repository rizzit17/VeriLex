import { useHistory } from "../hooks/useHistory";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

function getOverallRisk(analysis) {
  if (!analysis?.risky_clauses || analysis.risky_clauses.length === 0) return "LOW";
  if (analysis.risky_clauses.some(c => c.risk_level === "HIGH")) return "HIGH";
  if (analysis.risky_clauses.some(c => c.risk_level === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

// Build last-7-days trend data
function buildTrendData(history) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toISOString().slice(0, 10);
    const count = history.filter(e => (e.timestamp || "").slice(0, 10) === dateStr).length;
    days.push({ day: label, docs: count });
  }
  return days;
}

// Build clause frequency data
function buildClauseFreq(history) {
  const freq = {};
  history.forEach(entry => {
    (entry.analysis?.risky_clauses || []).forEach(c => {
      const key = c.clause || "Unknown";
      freq[key] = (freq[key] || 0) + 1;
    });
  });
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name: name.length > 22 ? name.slice(0, 22) + "…" : name, count }));
}

const chartTooltipStyle = {
  backgroundColor: "var(--vl-card)",
  border: "1px solid var(--vl-border)",
  borderRadius: 0,
  color: "var(--vl-text)",
  fontSize: 11,
  fontFamily: "Montserrat, sans-serif",
  boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
};

function KpiCard({ label, value, sub, accent, icon }) {
  return (
    <div style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 16, padding: "22px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: accent }} />
      <div style={{ fontSize: 11, color: "var(--vl-muted)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontFamily: "Montserrat, sans-serif" }}>{label}</div>
      <div style={{ fontSize: 34, fontWeight: 500, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 11, color: "var(--vl-muted)", fontFamily: "Montserrat, sans-serif" }}>{sub}</div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { history, loading } = useHistory();

  const totalDocs = history.length;
  const avgRisky = totalDocs > 0
    ? (history.reduce((s, e) => s + (e.analysis?.risky_clauses?.length || 0), 0) / totalDocs).toFixed(1)
    : 0;

  const riskCounts = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  history.forEach(e => { riskCounts[getOverallRisk(e.analysis)]++; });

  const trendData   = buildTrendData(history);
  const clauseFreq  = buildClauseFreq(history);

  const pieData = [
    { name: "High",   value: riskCounts.HIGH,   color: "#EF4444" },
    { name: "Medium", value: riskCounts.MEDIUM, color: "#F59E0B" },
    { name: "Low",    value: riskCounts.LOW,    color: "#4CAF50" },
  ].filter(d => d.value > 0);

  const commonRisk = riskCounts.HIGH > 0 ? "HIGH" : riskCounts.MEDIUM > 0 ? "MEDIUM" : "LOW";
  const commonRiskLabel = { HIGH: "High Risk", MEDIUM: "Medium Risk", LOW: "Low Risk" }[commonRisk];
  const commonRiskColor = { HIGH: "#EF4444", MEDIUM: "#F59E0B", LOW: "#4CAF50" }[commonRisk];

  return (
    <div className="vl-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="vl-page-header fade-up">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(212,164,74,0.1)", border: "1px solid rgba(212,164,74,0.2)", borderRadius: 99, padding: "3px 12px", marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "var(--vl-ochre)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Intelligence Center</span>
          </div>
          <h1 style={{ fontSize: 30, margin: "0 0 6px", lineHeight: 1.15 }}>Analytics</h1>
          <p style={{ color: "var(--vl-muted)", fontSize: 14, margin: 0 }}>Insights and trends from your contract analysis</p>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--vl-muted)", fontSize: 14 }}>Loading analytics…</div>
      ) : history.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px" }}>
          <div style={{ fontSize: 52, marginBottom: 16, opacity: 0.35 }}>📊</div>
          <div style={{ fontSize: 20, fontWeight: 500, color: "var(--vl-text2)", marginBottom: 8, fontFamily: "'Cormorant Garamond', serif" }}>No analytics yet</div>
          <div style={{ fontSize: 13, color: "var(--vl-muted)", fontFamily: "Montserrat, sans-serif" }}>Upload documents to generate insights</div>
        </div>
      ) : (
        <>
          {/* ── KPI cards ──────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 28 }}>
            <KpiCard label="Total Documents" value={totalDocs} sub="All time" accent="var(--vl-ochre)" />
            <KpiCard label="Avg Risky Clauses" value={avgRisky} sub="Per document" accent="#F59E0B" />
            <KpiCard label="High Risk Docs" value={riskCounts.HIGH} sub="Needs review" accent="#EF4444" />
            <KpiCard label="Predominant Risk" value={commonRiskLabel} sub={`${riskCounts[commonRisk]} documents`} accent={`linear-gradient(90deg,${commonRiskColor},${commonRiskColor}88)`} />
          </div>

          {/* ── Charts row ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>

            {/* Area chart — 7-day trend */}
            <div style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 0, padding: "24px 26px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>Analysis Trends</h3>
              <p style={{ margin: "0 0 20px", fontSize: 11, color: "var(--vl-muted)", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>Documents analyzed — last 7 days</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ochreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E0C39A" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#E0C39A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--vl-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "var(--vl-muted)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--vl-muted)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: "rgba(224,195,154,0.2)" }} />
                  <Area type="monotone" dataKey="docs" stroke="var(--vl-ochre)" strokeWidth={1.5} fill="url(#ochreGrad)" dot={{ fill: "var(--vl-ochre)", r: 2 }} activeDot={{ r: 4, fill: "var(--vl-text)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — risk distribution */}
            <div style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 0, padding: "24px 26px", boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>Risk Distribution</h3>
              <p style={{ margin: "0 0 8px", fontSize: 11, color: "var(--vl-muted)", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>Overall portfolio risk breakdown</p>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "var(--vl-text2)", fontWeight: 500, fontFamily: "Montserrat, sans-serif" }}>{d.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: d.color, marginLeft: "auto", fontFamily: "Montserrat, sans-serif" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Clause frequency bar chart ─────────────────────── */}
          {clauseFreq.length > 0 && (
            <div style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 0, padding: "24px 26px", marginBottom: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 18, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>Top Flagged Clauses</h3>
              <p style={{ margin: "0 0 20px", fontSize: 11, color: "var(--vl-muted)", fontFamily: "Montserrat, sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>Most frequently detected risky clauses</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={clauseFreq} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="var(--vl-border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "var(--vl-muted)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "var(--vl-muted)", fontSize: 10, fontFamily: "Montserrat, sans-serif" }} axisLine={false} tickLine={false} width={130} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(224,195,154,0.05)" }} />
                  <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={16}>
                    {clauseFreq.map((entry, i) => (
                      <Cell key={i} fill={i === 0 ? "#EF4444" : i === 1 ? "#F59E0B" : "var(--vl-ochre)"} fillOpacity={0.85} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── AI Insights box ────────────────────────────────── */}
          <div style={{ background: "transparent", borderTop: "1px solid var(--vl-border)", borderBottom: "1px solid var(--vl-border)", padding: "30px 0", marginTop: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>AI Insights</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                riskCounts.HIGH > 0 ? `${riskCounts.HIGH} document${riskCounts.HIGH !== 1 ? "s" : ""} contain high-risk clauses requiring immediate attention.` : "No high-risk documents detected — your portfolio is in good standing.",
                avgRisky > 3 ? `Average of ${avgRisky} risky clauses per document is above the recommended threshold of 3. Consider stricter contract review processes.` : `Average of ${avgRisky} risky clauses per document is within acceptable range.`,
                clauseFreq.length > 0 ? `"${clauseFreq[0].name}" is the most frequently flagged clause type, appearing ${clauseFreq[0].count} time${clauseFreq[0].count !== 1 ? "s" : ""}.` : "No recurring clause patterns detected yet.",
              ].map((insight, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--vl-ochre)" style={{ flexShrink: 0, marginTop: 2 }}>
                    <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.93-9.412l-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
                  </svg>
                  <span style={{ fontSize: 13, color: "var(--vl-text2)", lineHeight: 1.6 }}>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
