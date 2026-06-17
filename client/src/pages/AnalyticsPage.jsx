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
  backgroundColor: "var(--vl-card2)",
  border: "1px solid var(--vl-border)",
  borderRadius: 8,
  color: "var(--vl-text)",
  fontSize: 12,
  fontFamily: "'Inter', sans-serif",
  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
};

function KpiCard({ label, value, sub, accent, delayIndex }) {
  return (
    <div className="glass-panel" style={{ 
      borderRadius: 16, padding: "24px 28px", position: "relative", overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      animation: `fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) ${delayIndex * 100}ms both`
    }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: accent, opacity: 0.6 }} />
      <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, background: accent, filter: "blur(40px)", opacity: 0.1 }} />
      <div style={{ fontSize: 11, color: "var(--vl-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12, fontFamily: "'Montserrat', sans-serif" }}>{label}</div>
      <div style={{ fontSize: 38, fontWeight: 500, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif", lineHeight: 1, marginBottom: 10 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--vl-muted)", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{sub}</div>
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
    { name: "High Risk",   value: riskCounts.HIGH,   color: "var(--vl-risk)" },
    { name: "Medium Risk", value: riskCounts.MEDIUM, color: "var(--vl-warning)" },
    { name: "Low Risk",    value: riskCounts.LOW,    color: "var(--vl-success)" },
  ].filter(d => d.value > 0);

  const commonRisk = riskCounts.HIGH > 0 ? "HIGH" : riskCounts.MEDIUM > 0 ? "MEDIUM" : "LOW";
  const commonRiskLabel = { HIGH: "High Risk", MEDIUM: "Medium Risk", LOW: "Low Risk" }[commonRisk];
  const commonRiskColor = { HIGH: "var(--vl-risk)", MEDIUM: "var(--vl-warning)", LOW: "var(--vl-success)" }[commonRisk];

  return (
    <div className="vl-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="vl-page-header fade-up">
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 99, padding: "4px 14px", marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", display: "inline-block", boxShadow:"0 0 8px rgba(212,175,55,0.8)" }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: "var(--vl-ochre)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily:"'Montserrat',sans-serif" }}>Intelligence Center</span>
          </div>
          <h1 style={{ fontSize: 36, margin: "0 0 8px", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', serif" }}>Analytics</h1>
          <p style={{ color: "var(--vl-muted)", fontSize: 15, margin: 0, fontFamily:"'Inter', sans-serif" }}>Insights and trends from your contract analysis</p>
        </div>
      </header>

      {loading ? (
        <div className="fade-up delay-100" style={{ textAlign: "center", padding: "100px 20px", color: "var(--vl-muted)", fontSize: 15 }}>Loading analytics…</div>
      ) : history.length === 0 ? (
        <div className="fade-up delay-100" style={{ textAlign: "center", padding: "100px 20px" }}>
          <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.35 }}>📊</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: "var(--vl-text)", marginBottom: 12, fontFamily: "'Cormorant Garamond', serif" }}>No analytics yet</div>
          <div style={{ fontSize: 14, color: "var(--vl-muted)", fontFamily: "'Inter', sans-serif" }}>Upload documents to generate AI insights</div>
        </div>
      ) : (
        <>
          {/* ── KPI cards ──────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, marginBottom: 32 }}>
            <KpiCard label="Total Documents" value={totalDocs} sub="All time" accent="var(--vl-ochre)" delayIndex={1} />
            <KpiCard label="Avg Risky Clauses" value={avgRisky} sub="Per document" accent="var(--vl-warning)" delayIndex={2} />
            <KpiCard label="High Risk Docs" value={riskCounts.HIGH} sub="Needs review" accent="var(--vl-risk)" delayIndex={3} />
            <KpiCard label="Predominant Risk" value={commonRiskLabel} sub={`${riskCounts[commonRisk]} documents`} accent={`linear-gradient(90deg,${commonRiskColor}, transparent)`} delayIndex={4} />
          </div>

          {/* ── Charts row ─────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, marginBottom: 24 }}>

            {/* Area chart — 7-day trend */}
            <div className="glass-panel fade-up delay-500" style={{ borderRadius: 20, padding: "32px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 20, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>Analysis Trends</h3>
              <p style={{ margin: "0 0 24px", fontSize: 12, color: "var(--vl-muted)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Documents analyzed — last 7 days</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ochreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="var(--vl-ochre)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--vl-ochre)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--vl-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "var(--vl-muted)", fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis tick={{ fill: "var(--vl-muted)", fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} dx={-10} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ stroke: "rgba(212,175,55,0.2)" }} />
                  <Area type="monotone" dataKey="docs" stroke="var(--vl-ochre)" strokeWidth={2} fill="url(#ochreGrad)" dot={{ fill: "var(--vl-ochre)", r: 4, strokeWidth:2, stroke:"var(--vl-bg)" }} activeDot={{ r: 6, fill: "var(--vl-text)", stroke:"var(--vl-ochre)" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart — risk distribution */}
            <div className="glass-panel fade-up delay-500" style={{ borderRadius: 20, padding: "32px", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 20, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>Risk Distribution</h3>
              <p style={{ margin: "0 0 16px", fontSize: 12, color: "var(--vl-muted)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Overall portfolio breakdown</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", padding:"0 10px" }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 4, background: d.color, flexShrink: 0, boxShadow:`0 0 8px ${d.color}60` }} />
                      <span style={{ fontSize: 13, color: "var(--vl-text2)", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{d.name}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: d.color, marginLeft: "auto", fontFamily: "'Inter', sans-serif" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Clause frequency bar chart ─────────────────────── */}
          {clauseFreq.length > 0 && (
            <div className="glass-panel fade-up delay-500" style={{ borderRadius: 20, padding: "32px", marginBottom: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: 20, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>Top Flagged Clauses</h3>
              <p style={{ margin: "0 0 24px", fontSize: 12, color: "var(--vl-muted)", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Most frequently detected risky clauses</p>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={clauseFreq} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid stroke="var(--vl-border)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "var(--vl-muted)", fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "var(--vl-muted)", fontSize: 11, fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} width={160} />
                  <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={20}>
                    {clauseFreq.map((entry, i) => (
                      <Cell key={i} fill={i === 0 ? "var(--vl-risk)" : i === 1 ? "var(--vl-warning)" : "var(--vl-ochre)"} fillOpacity={0.9} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── AI Insights box ────────────────────────────────── */}
          <div className="fade-up delay-500" style={{ background: "rgba(212,175,55,0.03)", border: "1px solid var(--vl-border-gold)", borderRadius:20, padding: "32px", marginTop: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="var(--vl-ochre)" style={{ filter:"drop-shadow(0 0 8px rgba(212,175,55,0.6))" }}>
                <path fillRule="evenodd" d="M8 15A7 7 0 108 1a7 7 0 000 14zm.93-9.412l-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 110-2 1 1 0 010 2z" clipRule="evenodd" />
              </svg>
              <h3 style={{ margin: 0, fontSize: 20, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>AI Insights</h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                riskCounts.HIGH > 0 ? `${riskCounts.HIGH} document${riskCounts.HIGH !== 1 ? "s" : ""} contain high-risk clauses requiring immediate attention.` : "No high-risk documents detected — your portfolio is in good standing.",
                avgRisky > 3 ? `Average of ${avgRisky} risky clauses per document is above the recommended threshold of 3. Consider stricter contract review processes.` : `Average of ${avgRisky} risky clauses per document is within acceptable range.`,
                clauseFreq.length > 0 ? `"${clauseFreq[0].name}" is the most frequently flagged clause type, appearing ${clauseFreq[0].count} time${clauseFreq[0].count !== 1 ? "s" : ""}.` : "No recurring clause patterns detected yet.",
              ].map((insight, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background:"rgba(15,23,42,0.4)", padding:"16px", borderRadius:12, border:"1px solid var(--vl-border)" }}>
                  <span style={{ fontSize: 14, color: "var(--vl-text2)", lineHeight: 1.6, fontFamily:"'Inter',sans-serif" }}>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
