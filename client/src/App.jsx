import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import StatsGrid from "./components/StatsGrid";
import RecentDocuments from "./components/RecentDocuments";
import RiskAnalysis from "./components/RiskAnalysis";
import ActivityFeed from "./components/ActivityFeed";
import VeriLexLogo from "./components/VeriLexLogo";
import Notifications, { notify } from "./components/Notifications";
import DocumentsPage from "./pages/DocumentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { useHistory } from "./hooks/useHistory";
import { buildApiUrl } from "./config/api";

const API_URL = buildApiUrl("/api/upload");

// ── Global keyframe injector ────────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes modalIn { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes introPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
  @keyframes introLogo { from{opacity:0;transform:scale(0.8) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes introWord { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
`;

// ── Risk badge (corrected per-level colors) ─────────────────────────────────
function RiskBadge({ level }) {
  const cls = { HIGH: "vl-badge vl-badge-high", MEDIUM: "vl-badge vl-badge-medium", LOW: "vl-badge vl-badge-low" };
  return <span className={cls[level] ?? cls.LOW}>{level}</span>;
}

// ── Landing Page ────────────────────────────────────────────────────────────
function LandingPage({ onSkip }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 2500); // Start fading out at 2.5s
    const t2 = setTimeout(onSkip, 3000);                 // Unmount at 3s
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onSkip]);

  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(onSkip, 500);
  };

  return (
    <div style={{ position:"fixed", inset:0, backgroundImage:"url('/bg_modern.png')", backgroundSize:"cover", backgroundPosition:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:9999, opacity: fadeOut ? 0 : 1, transition:"opacity 0.5s ease-out" }}>
      <div style={{ position:"absolute", inset:0, background:"rgba(5, 5, 5, 0.85)", backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)" }}></div>

      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:20, textAlign:"center", padding:"0 40px", maxWidth: 800 }}>
        <div style={{ animation:"introLogo 0.8s cubic-bezier(0.22,1,0.36,1) both", marginBottom: 10 }}>
          <VeriLexLogo size={72} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", animation:"introWord 0.7s cubic-bezier(0.22,1,0.36,1) 0.5s both" }}>
          <h1 style={{
            margin: 0, fontSize: 56, fontWeight: 400,
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--vl-text)",
            letterSpacing: "0.02em",
          }}>Veri</h1>
          <h1 style={{
            margin: 0, fontSize: 50, fontWeight: 300,
            fontFamily: "'Montserrat', sans-serif",
            color: "var(--vl-ochre)",
            letterSpacing: "0.05em",
          }}>Lex</h1>
        </div>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:18, fontWeight:400, margin:0, color:"var(--vl-text)", letterSpacing:"0.1em", textTransform:"uppercase", animation:"introWord 0.8s cubic-bezier(0.22,1,0.36,1) 0.6s both" }}>
          AI-Powered Legal Intelligence
        </p>
        
        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 12, marginBottom: 24, animation: "introWord 1s cubic-bezier(0.22,1,0.36,1) 0.8s both" }}>
          {[
            { title: "Risk Assessment", desc: "Automated analysis of high-risk clauses and liabilities." },
            { title: "Clause Extraction", desc: "Instant detection of key obligations and missing terms." },
            { title: "Executive Reports", desc: "Generate premium PDF reports for legal teams." }
          ].map((feat, i) => (
            <div key={i} style={{ background: "rgba(20, 20, 20, 0.6)", border: "1px solid var(--vl-border)", borderRadius: 12, padding: "20px", textAlign: "left" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", marginBottom: 12 }}></div>
              <h3 style={{ margin: "0 0 8px", fontSize: 14, fontFamily: "'Montserrat', sans-serif", color: "var(--vl-text)", fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{feat.title}</h3>
              <p style={{ margin: 0, fontSize: 12, color: "var(--vl-muted)", lineHeight: 1.6, fontFamily: "'Montserrat', sans-serif" }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={handleEnter}
          className="vl-btn-primary"
          style={{ padding: "16px 36px", fontSize: 12, animation: "introWord 1s cubic-bezier(0.22,1,0.36,1) 1s both" }}
        >
          Enter Platform →
        </button>
      </div>
    </div>
  );
}

// ── Upload logic (shared) ───────────────────────────────────────────────────
async function uploadFile(file, onResult, setLoading) {
  if (file.type !== "application/pdf") { notify("Only PDF files are accepted.", "error"); return; }
  setLoading(true);
  notify(`Analyzing ${file.name}…`, "info");
  try {
    const form = new FormData();
    form.append("file", file);
    const { data } = await axios.post(API_URL, form, { headers:{"Content-Type":"multipart/form-data"}, timeout:90_000 });
    if (!data.success) throw new Error(data.error || "Analysis failed.");
    notify("Analysis complete!", "success");
    onResult(data);
  } catch (err) {
    let errMsg = err.response?.data?.error || err.message || "Upload failed.";
    if (typeof errMsg === "object") {
      errMsg = errMsg.message || JSON.stringify(errMsg);
    }
    notify(`Error: ${errMsg}`, "error");
  } finally {
    setLoading(false);
  }
}

// ── Topbar upload button ────────────────────────────────────────────────────
function UploadButton({ onResult }) {
  const ref = useRef(null);
  const [loading, setLoading] = useState(false);
  const onChange = useCallback(async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await uploadFile(file, onResult, setLoading);
  }, [onResult]);

  return (
    <>
      <input ref={ref} type="file" accept=".pdf,application/pdf" style={{display:"none"}} onChange={onChange} />
      <button disabled={loading} onClick={() => !loading && ref.current?.click()} className="vl-btn-primary"
        style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
        {loading ? (
          <><span style={{width:13,height:13,border:"2px solid rgba(26,20,16,0.3)",borderTop:"2px solid #1A1410",borderRadius:"50%",display:"inline-block",animation:"spin 0.8s linear infinite"}} />Analyzing…</>
        ) : (
          <><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M.5 9.9a.5.5 0 01.5.5v2.5a1 1 0 001 1h12a1 1 0 001-1v-2.5a.5.5 0 011 0v2.5a2 2 0 01-2 2H2a2 2 0 01-2-2v-2.5a.5.5 0 01.5-.5z"/><path d="M7.646 1.146a.5.5 0 01.708 0l3 3a.5.5 0 01-.708.708L8.5 2.707V11.5a.5.5 0 01-1 0V2.707L5.354 4.854a.5.5 0 11-.708-.708l3-3z"/></svg>Upload Document</>
        )}
      </button>
    </>
  );
}

// ── Analysis Modal ──────────────────────────────────────────────────────────
function AnalysisModal({ result, onClose }) {
  const { file, analysis } = result;
  const { summary, key_obligations=[], risky_clauses=[], missing_clauses=[], suggestions=[] } = analysis;
  const [activeTab, setActiveTab] = useState("summary");

  const riskScore = risky_clauses.length === 0 ? 0 : risky_clauses.some(c => c.risk_level==="HIGH") ? 80 : risky_clauses.some(c => c.risk_level==="MEDIUM") ? 50 : 25;
  const riskColor = riskScore >= 70 ? "#EF4444" : riskScore >= 40 ? "#F59E0B" : "#4CAF50";
  const riskLabel = riskScore >= 70 ? "High Risk" : riskScore >= 40 ? "Medium Risk" : "Low Risk";

  const tabs = [
    { id:"summary",     label:"Summary",     count: null },
    { id:"obligations", label:"Obligations", count: key_obligations.length },
    { id:"risky",       label:"Risky Clauses", count: risky_clauses.length },
    { id:"missing",     label:"Missing",     count: missing_clauses.length },
    { id:"suggestions", label:"Suggestions", count: suggestions.length },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"var(--vl-card)", border:"1px solid var(--vl-border)", borderRadius:22, width:"100%", maxWidth:760, maxHeight:"90vh", display:"flex", flexDirection:"column", boxShadow:"0 40px 100px rgba(0,0,0,0.8)", animation:"modalIn 0.35s cubic-bezier(0.22,1,0.36,1) both" }}>

        {/* Modal header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 24px", borderBottom:"1px solid var(--vl-border)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:"rgba(212,164,74,0.15)", border:"1px solid rgba(212,164,74,0.25)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--vl-ochre)" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <h2 style={{ margin:0, fontSize:15, color:"var(--vl-text)", fontFamily:"'Playfair Display',serif" }}>{file.originalName}</h2>
              <p style={{ margin:0, fontSize:11, color:"var(--vl-muted)" }}>{(file.sizeBytes/1024).toFixed(1)} KB · AI Analysis Complete</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:"var(--vl-card2)", border:"1px solid var(--vl-border)", color:"var(--vl-muted)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background="var(--vl-border)"; e.currentTarget.style.color="var(--vl-text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="var(--vl-card2)"; e.currentTarget.style.color="var(--vl-muted)"; }}
          >✕</button>
        </div>

        {/* Risk score bar + stats */}
        <div style={{ padding:"20px 24px", borderBottom:"1px solid var(--vl-border)", background:"var(--vl-card2)", flexShrink:0 }}>
          <div style={{ display:"flex", gap:16, alignItems:"center", marginBottom:14 }}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:11, color:"var(--vl-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>Risk Score</span>
                <span style={{ fontSize:13, fontWeight:700, color:riskColor }}>{riskLabel}</span>
              </div>
              <div style={{ height:8, background:"var(--vl-border)", borderRadius:99, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${riskScore}%`, background:`linear-gradient(90deg,${riskColor}88,${riskColor})`, borderRadius:99, transition:"width 1s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { label:"Obligations", value:key_obligations.length, color:"var(--vl-ochre)" },
              { label:"Risky Clauses", value:risky_clauses.length, color:"#EF4444" },
              { label:"Missing", value:missing_clauses.length, color:"#F59E0B" },
              { label:"Suggestions", value:suggestions.length, color:"#4CAF50" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ textAlign:"center", padding:"10px 8px", background:"var(--vl-card)", border:"1px solid var(--vl-border)", borderRadius:10 }}>
                <div style={{ fontSize:24, fontWeight:800, color, fontFamily:"'Playfair Display',serif", lineHeight:1 }}>{value}</div>
                <div style={{ fontSize:9.5, color:"var(--vl-muted)", marginTop:3, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:2, padding:"0 24px", borderBottom:"1px solid var(--vl-border)", flexShrink:0, overflowX:"auto" }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ padding:"12px 14px", background:"transparent", border:"none", borderBottom:`2px solid ${activeTab===tab.id ? "var(--vl-ochre)" : "transparent"}`, color: activeTab===tab.id ? "var(--vl-ochre)" : "var(--vl-muted)", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6, whiteSpace:"nowrap", transition:"color 0.15s", fontFamily:"Inter,sans-serif" }}>
              {tab.label}
              {tab.count !== null && <span style={{ background: activeTab===tab.id ? "rgba(212,164,74,0.15)" : "var(--vl-card2)", color: activeTab===tab.id ? "var(--vl-ochre)" : "var(--vl-muted2)", padding:"1px 6px", borderRadius:99, fontSize:10, fontWeight:700 }}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ overflowY:"auto", padding:"20px 24px", flex:1 }}>
          {activeTab === "summary" && (
            <div style={{ background:"var(--vl-card2)", border:"1px solid var(--vl-border)", borderLeft:"3px solid var(--vl-ochre)", borderRadius:"0 12px 12px 0", padding:"16px 18px" }}>
              <p style={{ margin:0, fontSize:14, color:"var(--vl-text2)", lineHeight:1.75 }}>{summary}</p>
            </div>
          )}
          {activeTab === "obligations" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {key_obligations.length === 0 ? <EmptyState label="No obligations detected" /> : key_obligations.map((o, i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"10px 14px", background:"var(--vl-card2)", border:"1px solid var(--vl-border)", borderRadius:10 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"var(--vl-ochre)", flexShrink:0, marginTop:6 }} />
                  <span style={{ fontSize:13, color:"var(--vl-text2)", lineHeight:1.6 }}>{o}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "risky" && (
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {risky_clauses.length === 0 ? <EmptyState label="No risky clauses detected" /> : risky_clauses.map((c, i) => {
                const lc = c.risk_level;
                const borderC = lc==="HIGH" ? "#EF4444" : lc==="MEDIUM" ? "#F59E0B" : "#4CAF50";
                return (
                  <div key={i} style={{ padding:"12px 14px", background:"var(--vl-card2)", borderLeft:`3px solid ${borderC}`, borderRadius:"0 10px 10px 0", border:"1px solid var(--vl-border)", borderLeftWidth:3 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                      <RiskBadge level={lc} />
                      <span style={{ fontSize:13, fontWeight:600, color:"var(--vl-text)" }}>{c.clause}</span>
                    </div>
                    <p style={{ margin:0, fontSize:12, color:"var(--vl-muted)", lineHeight:1.6 }}>{c.reason}</p>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === "missing" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {missing_clauses.length === 0 ? <EmptyState label="No missing clauses identified" /> : missing_clauses.map((m, i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"10px 14px", background:"rgba(245,158,11,0.06)", border:"1px solid rgba(245,158,11,0.15)", borderRadius:10 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"#F59E0B", flexShrink:0, marginTop:6 }} />
                  <span style={{ fontSize:13, color:"var(--vl-text2)", lineHeight:1.6 }}>{m}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "suggestions" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {suggestions.length === 0 ? <EmptyState label="No suggestions available" /> : suggestions.map((s, i) => (
                <div key={i} style={{ display:"flex", gap:10, padding:"10px 14px", background:"rgba(76,175,80,0.06)", border:"1px solid rgba(76,175,80,0.15)", borderRadius:10 }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", background:"#4CAF50", flexShrink:0, marginTop:6 }} />
                  <span style={{ fontSize:13, color:"var(--vl-text2)", lineHeight:1.6 }}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return <div style={{ textAlign:"center", padding:"32px 20px", color:"var(--vl-muted)", fontSize:13 }}>{label}</div>;
}

// ── Drag-and-drop upload zone ───────────────────────────────────────────────
function DropZone({ onResult }) {
  const ref = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleFile = useCallback(async file => {
    await uploadFile(file, onResult, setLoading);
  }, [onResult]);

  const onDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onInputChange = useCallback(e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => !loading && ref.current?.click()}
      style={{
        border: `2px dashed ${dragging ? "var(--vl-ochre)" : loading ? "rgba(212,164,74,0.3)" : "var(--vl-border2)"}`,
        borderRadius: 16, padding: "36px 24px", textAlign:"center",
        background: dragging ? "rgba(212,164,74,0.06)" : "rgba(53,40,32,0.4)",
        cursor: loading ? "default" : "pointer",
        transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: dragging ? "0 0 0 4px rgba(212,164,74,0.12)" : "none",
        marginBottom: 32,
      }}
    >
      <input ref={ref} type="file" accept=".pdf,application/pdf" style={{display:"none"}} onChange={onInputChange} />
      <div style={{ fontSize:36, marginBottom:12, opacity: dragging ? 1 : 0.5 }}>{loading ? "⏳" : dragging ? "📂" : "📄"}</div>
      <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:600, color:"var(--vl-text2)" }}>
        {loading ? "Analyzing document…" : dragging ? "Drop your PDF here" : "Drag & drop a PDF contract"}
      </p>
      <p style={{ margin:0, fontSize:12, color:"var(--vl-muted)" }}>
        {loading ? "Please wait while AI processes your contract" : "or click to browse files · PDF only"}
      </p>
      {loading && (
        <div style={{ marginTop:16, display:"flex", justifyContent:"center" }}>
          <span style={{width:18,height:18,border:"2px solid rgba(212,164,74,0.2)",borderTop:"2px solid var(--vl-ochre)",borderRadius:"50%",display:"inline-block",animation:"spin 0.8s linear infinite"}} />
        </div>
      )}
    </div>
  );
}

// ── Dashboard page ──────────────────────────────────────────────────────────
function DashboardPage({ onViewAnalysis, onUploadResult }) {
  return (
    <main className="vl-page">
      {/* Header with upload button */}
      <header className="vl-page-header fade-up">
        <div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(212,164,74,0.1)", border:"1px solid rgba(212,164,74,0.2)", borderRadius:99, padding:"3px 12px", marginBottom:10 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--vl-ochre)", display:"inline-block" }} />
            <span style={{ fontSize:11, fontWeight:600, color:"var(--vl-ochre)", letterSpacing:"0.08em", textTransform:"uppercase" }}>Live Overview</span>
          </div>
          <h1 style={{ fontSize:30, margin:"0 0 6px", lineHeight:1.15 }}>Dashboard</h1>
          <p style={{ color:"var(--vl-muted)", fontSize:14, margin:0 }}>Monitor your legal document analysis in real-time</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={() => window.location.reload()} className="vl-btn-ghost" style={{ padding:"9px 16px" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 00-.908-.417A4 4 0 118 4v1H6.5a.5.5 0 000 1H9a.5.5 0 00.5-.5V2.5a.5.5 0 00-1 0V3z" clipRule="evenodd"/></svg>
            Refresh
          </button>
          <UploadButton onResult={onUploadResult} />
        </div>
      </header>

      {/* Drag-and-drop zone */}
      <DropZone onResult={onUploadResult} />

      {/* KPI Cards */}
      <StatsGrid />

      {/* Section divider */}
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <span style={{ fontSize:11, fontWeight:700, color:"var(--vl-muted2)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Activity & Insights</span>
        <div style={{ flex:1, height:1, background:"var(--vl-border)" }} />
      </div>

      {/* Grid widgets */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(360px,1fr))", gap:20 }}>
        <RecentDocuments onViewAnalysis={onViewAnalysis} />
        <RiskAnalysis />
        <ActivityFeed />
      </div>
    </main>
  );
}

// ── App root ────────────────────────────────────────────────────────────────
export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activePage, setActivePage]         = useState("dashboard");
  const [showIntro, setShowIntro]           = useState(() => !sessionStorage.getItem("verilex-intro-seen"));
  const { refresh } = useHistory();

  const handleSkipIntro = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem("verilex-intro-seen", "true");
  }, []);

  const handleUploadResult = useCallback(data => {
    setAnalysisResult(data);
    refresh();
  }, [refresh]);

  const handleViewAnalysis = useCallback(entry => setAnalysisResult(entry), []);

  if (showIntro) return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <LandingPage onSkip={handleSkipIntro} />
    </>
  );

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <Notifications />
      {analysisResult && <AnalysisModal result={analysisResult} onClose={() => setAnalysisResult(null)} />}

      <div style={{ display:"flex", minHeight:"100vh", background:"var(--vl-bg)" }}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
        {activePage === "dashboard"  && <DashboardPage onViewAnalysis={handleViewAnalysis} onUploadResult={handleUploadResult} />}
        {activePage === "documents"  && <DocumentsPage onViewAnalysis={handleViewAnalysis} />}
        {activePage === "analytics"  && <AnalyticsPage />}
        {activePage === "reports"    && <ReportsPage />}
        {activePage === "settings"   && <SettingsPage />}
      </div>
    </>
  );
}
