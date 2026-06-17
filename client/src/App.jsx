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
  @keyframes statusPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
  @keyframes introLogo { from{opacity:0;transform:scale(0.8) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes introWord { from{opacity:0;transform:translateY(15px); filter:blur(4px);} to{opacity:1;transform:translateY(0); filter:blur(0);} }
  @keyframes modalIn { from{opacity:0;transform:translateY(30px) scale(0.95); filter:blur(10px);} to{opacity:1;transform:translateY(0) scale(1); filter:blur(0);} }
  @keyframes scanLine { 0%{top:0; opacity:0;} 10%{opacity:1;} 90%{opacity:1;} 100%{top:100%; opacity:0;} }
  .fade-up { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both; }
`;

// ── Risk badge (corrected per-level colors) ─────────────────────────────────
function RiskBadge({ level }) {
  const cls = { HIGH: "vl-badge vl-badge-high", MEDIUM: "vl-badge vl-badge-medium", LOW: "vl-badge vl-badge-low" };
  return <span className={cls[level] ?? cls.LOW}>{level}</span>;
}

// ── Landing Page ────────────────────────────────────────────────────────────
function LandingPage({ onSkip }) {
  const [fadeOut, setFadeOut] = useState(false);



  const handleEnter = () => {
    setFadeOut(true);
    setTimeout(onSkip, 500);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"var(--vl-bg)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:9999, opacity: fadeOut ? 0 : 1, transition:"opacity 0.5s ease-out" }}>
      {/* Background radial glow */}
      <div style={{ position:"absolute", top:"-20%", right:"-10%", width:"800px", height:"800px", background:"radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)", zIndex:1 }}></div>
      <div style={{ position:"absolute", bottom:"-20%", left:"-10%", width:"800px", height:"800px", background:"radial-gradient(circle, rgba(96,165,250,0.04) 0%, transparent 70%)", zIndex:1 }}></div>

      <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", alignItems:"center", gap:24, textAlign:"center", padding:"0 40px", maxWidth: 860 }}>
        <div style={{ animation:"introLogo 1s cubic-bezier(0.22,1,0.36,1) both", marginBottom: 16 }}>
          <VeriLexLogo size={84} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", animation:"introWord 0.9s cubic-bezier(0.22,1,0.36,1) 0.4s both" }}>
          <h1 style={{
            margin: 0, fontSize: 64, fontWeight: 400,
            fontFamily: "'Cormorant Garamond', serif",
            color: "var(--vl-text)",
            letterSpacing: "0.02em",
          }}>Veri</h1>
          <h1 style={{
            margin: 0, fontSize: 58, fontWeight: 300,
            fontFamily: "'Montserrat', sans-serif",
            color: "var(--vl-ochre)",
            letterSpacing: "0.05em",
          }}>Lex</h1>
        </div>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:18, fontWeight:300, margin:0, color:"var(--vl-muted)", letterSpacing:"0.15em", textTransform:"uppercase", animation:"introWord 0.9s cubic-bezier(0.22,1,0.36,1) 0.6s both" }}>
          AI-Powered Legal Intelligence
        </p>
        
        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 24, marginBottom: 32, animation: "introWord 1s cubic-bezier(0.22,1,0.36,1) 0.8s both" }}>
          {[
            { title: "Risk Assessment", desc: "Automated analysis of high-risk clauses and liabilities with strict JSON verification." },
            { title: "Clause Extraction", desc: "Instant detection of key obligations and missing standard terms." },
            { title: "Executive Reports", desc: "Generate premium PDF reports designed for top-tier legal teams." }
          ].map((feat, i) => (
            <div key={i} className="vl-card" style={{ padding: "24px", textAlign: "left", background: "rgba(15,23,42,0.4)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--vl-ochre)", marginBottom: 16, boxShadow:"0 0 12px rgba(212,175,55,0.4)" }}></div>
              <h3 style={{ margin: "0 0 10px", fontSize: 14, fontFamily: "'Montserrat', sans-serif", color: "var(--vl-text)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>{feat.title}</h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--vl-muted)", lineHeight: 1.6, fontFamily: "'Inter', sans-serif" }}>{feat.desc}</p>
            </div>
          ))}
        </div>

        <button 
          onClick={handleEnter}
          className="vl-btn-primary"
          style={{ padding: "18px 48px", fontSize: 13, animation: "introWord 1s cubic-bezier(0.22,1,0.36,1) 1.2s both" }}
        >
          Enter Platform <span style={{marginLeft:8}}>→</span>
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
  const riskColor = riskScore >= 70 ? "var(--vl-risk)" : riskScore >= 40 ? "var(--vl-warning)" : "var(--vl-success)";
  const riskLabel = riskScore >= 70 ? "High Risk" : riskScore >= 40 ? "Medium Risk" : "Low Risk";

  const tabs = [
    { id:"summary",     label:"Summary",     count: null },
    { id:"obligations", label:"Obligations", count: key_obligations.length },
    { id:"risky",       label:"Risky Clauses", count: risky_clauses.length },
    { id:"missing",     label:"Missing",     count: missing_clauses.length },
    { id:"suggestions", label:"Suggestions", count: suggestions.length },
  ];

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:1000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(16px)", display:"flex", alignItems:"center", justifyContent:"center", padding:32 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:"var(--vl-card)", border:"1px solid var(--vl-border2)", borderRadius:24, width:"100%", maxWidth:900, height:"85vh", display:"flex", flexDirection:"column", boxShadow:"0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px var(--vl-border-gold) inset", animation:"modalIn 0.5s cubic-bezier(0.22,1,0.36,1) both", overflow:"hidden" }}>

        {/* Modal header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"24px 32px", borderBottom:"1px solid var(--vl-border)", background:"rgba(15,23,42,0.4)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:"rgba(212,175,55,0.1)", border:"1px solid var(--vl-border-gold)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--vl-ochre)", boxShadow:"0 0 20px rgba(212,175,55,0.1)" }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>
            </div>
            <div>
              <h2 style={{ margin:"0 0 4px", fontSize:20, color:"var(--vl-text)", fontFamily:"'Cormorant Garamond',serif" }}>{file.originalName}</h2>
              <p style={{ margin:0, fontSize:12, color:"var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>{(file.sizeBytes/1024).toFixed(1)} KB · AI Analysis Complete</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, background:"var(--vl-card2)", border:"1px solid var(--vl-border)", color:"var(--vl-muted)", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background="var(--vl-border2)"; e.currentTarget.style.color="var(--vl-text)"; }}
            onMouseLeave={e => { e.currentTarget.style.background="var(--vl-card2)"; e.currentTarget.style.color="var(--vl-muted)"; }}
          >✕</button>
        </div>

        {/* Two-column layout for modal body */}
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          
          {/* Left Column: Stats & Risk */}
          <div style={{ width: 280, borderRight:"1px solid var(--vl-border)", background:"rgba(30,41,59,0.2)", display:"flex", flexDirection:"column", padding:"24px" }}>
            <div style={{ marginBottom:32 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:11, color:"var(--vl-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.1em" }}>Risk Assessment</span>
              </div>
              <div style={{ fontSize:28, fontWeight:600, fontFamily:"'Cormorant Garamond',serif", color:riskColor, marginBottom:12 }}>{riskLabel}</div>
              <div style={{ height:6, background:"var(--vl-card-solid)", borderRadius:99, overflow:"hidden", boxShadow:"inset 0 1px 3px rgba(0,0,0,0.5)" }}>
                <div style={{ height:"100%", width:`${riskScore}%`, background:`linear-gradient(90deg, transparent, ${riskColor})`, borderRadius:99, transition:"width 1s cubic-bezier(0.4,0,0.2,1)" }} />
              </div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {[
                { label:"Obligations", value:key_obligations.length, color:"var(--vl-ochre)" },
                { label:"Risky Clauses", value:risky_clauses.length, color:"var(--vl-risk)" },
                { label:"Missing Terms", value:missing_clauses.length, color:"var(--vl-warning)" },
                { label:"Suggestions", value:suggestions.length, color:"var(--vl-success)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:"var(--vl-card)", border:"1px solid var(--vl-border)", borderRadius:12 }}>
                  <span style={{ fontSize:12, color:"var(--vl-text2)", fontWeight:500 }}>{label}</span>
                  <span style={{ fontSize:16, fontWeight:700, color, fontFamily:"'Inter',sans-serif" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Tabs & Content */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ display:"flex", gap:4, padding:"0 32px", borderBottom:"1px solid var(--vl-border)", flexShrink:0, background:"rgba(15,23,42,0.4)", overflowX:"auto" }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding:"16px 8px", margin:"0 12px", background:"transparent", border:"none", borderBottom:`2px solid ${activeTab===tab.id ? "var(--vl-ochre)" : "transparent"}`, color: activeTab===tab.id ? "var(--vl-text)" : "var(--vl-muted)", fontSize:13, fontWeight:activeTab===tab.id ? 600 : 500, cursor:"pointer", display:"flex", alignItems:"center", gap:8, whiteSpace:"nowrap", transition:"all 0.2s", fontFamily:"'Inter',sans-serif" }}>
                  {tab.label}
                  {tab.count !== null && <span style={{ background: activeTab===tab.id ? "rgba(212,175,55,0.15)" : "var(--vl-card2)", color: activeTab===tab.id ? "var(--vl-ochre)" : "var(--vl-muted)", padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:700 }}>{tab.count}</span>}
                </button>
              ))}
            </div>

            <div style={{ overflowY:"auto", padding:"32px", flex:1, background:"transparent" }}>
              {activeTab === "summary" && (
                <div className="fade-up" style={{ background:"var(--vl-card2)", border:"1px solid var(--vl-border)", borderLeft:"4px solid var(--vl-ochre)", borderRadius:"8px", padding:"24px" }}>
                  <h3 style={{ margin:"0 0 16px", fontSize:18, color:"var(--vl-text)", fontFamily:"'Cormorant Garamond',serif" }}>Document Summary</h3>
                  <p style={{ margin:0, fontSize:15, color:"var(--vl-text2)", lineHeight:1.8, fontFamily:"'Inter',sans-serif" }}>{summary}</p>
                </div>
              )}
              {activeTab === "obligations" && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {key_obligations.length === 0 ? <EmptyState label="No obligations detected" /> : key_obligations.map((o, i) => (
                    <div key={i} className="vl-card" style={{ display:"flex", gap:16, padding:"16px 20px" }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--vl-ochre)", flexShrink:0, marginTop:8, boxShadow:"0 0 8px rgba(212,175,55,0.5)" }} />
                      <span style={{ fontSize:14, color:"var(--vl-text2)", lineHeight:1.6 }}>{o}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "risky" && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:16 }}>
                  {risky_clauses.length === 0 ? <EmptyState label="No risky clauses detected" /> : risky_clauses.map((c, i) => {
                    const lc = c.risk_level;
                    const borderC = lc==="HIGH" ? "var(--vl-risk)" : lc==="MEDIUM" ? "var(--vl-warning)" : "var(--vl-success)";
                    const bgC = lc==="HIGH" ? "rgba(248,113,113,0.05)" : lc==="MEDIUM" ? "rgba(251,191,36,0.05)" : "rgba(52,211,153,0.05)";
                    return (
                      <div key={i} style={{ padding:"20px", background:bgC, borderLeft:`4px solid ${borderC}`, borderRadius:"8px", borderRight:"1px solid var(--vl-border)", borderTop:"1px solid var(--vl-border)", borderBottom:"1px solid var(--vl-border)" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                          <RiskBadge level={lc} />
                          <span style={{ fontSize:14, fontWeight:600, color:"var(--vl-text)", fontFamily:"'Inter',sans-serif" }}>{c.clause}</span>
                        </div>
                        <p style={{ margin:0, fontSize:13, color:"var(--vl-muted)", lineHeight:1.6 }}>{c.reason}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              {activeTab === "missing" && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {missing_clauses.length === 0 ? <EmptyState label="No missing clauses identified" /> : missing_clauses.map((m, i) => (
                    <div key={i} className="vl-card" style={{ display:"flex", gap:16, padding:"16px 20px" }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--vl-warning)", flexShrink:0, marginTop:8 }} />
                      <span style={{ fontSize:14, color:"var(--vl-text2)", lineHeight:1.6 }}>{m}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "suggestions" && (
                <div className="fade-up" style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {suggestions.length === 0 ? <EmptyState label="No suggestions available" /> : suggestions.map((s, i) => (
                    <div key={i} className="vl-card" style={{ display:"flex", gap:16, padding:"16px 20px" }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--vl-success)", flexShrink:0, marginTop:8 }} />
                      <span style={{ fontSize:14, color:"var(--vl-text2)", lineHeight:1.6 }}>{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function EmptyState({ label }) {
  return <div style={{ textAlign:"center", padding:"48px 20px", color:"var(--vl-muted)", fontSize:14, fontFamily:"'Inter',sans-serif", border:"1px dashed var(--vl-border2)", borderRadius:12 }}>{label}</div>;
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
      className="vl-card"
      style={{
        position: "relative",
        border: `2px dashed ${dragging ? "var(--vl-ochre)" : loading ? "var(--vl-border-gold)" : "var(--vl-border2)"}`,
        padding: "48px 24px", textAlign:"center",
        background: dragging ? "rgba(212,175,55,0.05)" : "var(--vl-card)",
        cursor: loading ? "default" : "pointer",
        transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: dragging ? "0 0 24px rgba(212,175,55,0.15) inset" : "none",
        marginBottom: 40,
        overflow: "hidden"
      }}
    >
      {loading && (
        <div style={{ position:"absolute", left:0, right:0, height:2, background:"var(--vl-ochre)", animation:"scanLine 2s linear infinite", zIndex:0, boxShadow:"0 0 10px var(--vl-ochre)" }}></div>
      )}
      
      <div style={{ position:"relative", zIndex:1 }}>
        <input ref={ref} type="file" accept=".pdf,application/pdf" style={{display:"none"}} onChange={onInputChange} />
        <div style={{ fontSize:42, marginBottom:16, opacity: dragging ? 1 : 0.8, filter: dragging ? "drop-shadow(0 0 10px rgba(212,175,55,0.5))" : "none", transition:"all 0.3s" }}>
          {loading ? "⏳" : dragging ? "📂" : "📄"}
        </div>
        <h3 style={{ margin:"0 0 8px", fontSize:18, fontWeight:500, color:"var(--vl-text)", fontFamily:"'Cormorant Garamond',serif" }}>
          {loading ? "Analyzing Document Architecture…" : dragging ? "Drop PDF to Analyze" : "Upload Legal Document"}
        </h3>
        <p style={{ margin:0, fontSize:13, color:"var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>
          {loading ? "Our AI engine is currently processing the legal structure." : "Drag & drop your PDF contract, or click to browse files"}
        </p>
      </div>
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
          <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,175,55,0.1)", border:"1px solid var(--vl-border-gold)", borderRadius:99, padding:"4px 14px", marginBottom:16 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"var(--vl-ochre)", display:"inline-block", boxShadow:"0 0 8px rgba(212,175,55,0.8)" }} />
            <span style={{ fontSize:10, fontWeight:600, color:"var(--vl-ochre)", letterSpacing:"0.15em", textTransform:"uppercase" }}>Live Overview</span>
          </div>
          <h1 style={{ fontSize:36, margin:"0 0 8px", lineHeight:1.15, fontFamily:"'Cormorant Garamond',serif" }}>Dashboard</h1>
          <p style={{ color:"var(--vl-muted)", fontSize:15, margin:0, fontFamily:"'Inter',sans-serif" }}>Monitor your legal document analysis and risk metrics.</p>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <button onClick={() => window.location.reload()} className="vl-btn-ghost" style={{ padding:"10px 18px" }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 00-.908-.417A4 4 0 118 4v1H6.5a.5.5 0 000 1H9a.5.5 0 00.5-.5V2.5a.5.5 0 00-1 0V3z" clipRule="evenodd"/></svg>
            Refresh
          </button>
          <UploadButton onResult={onUploadResult} />
        </div>
      </header>

      {/* Drag-and-drop zone */}
      <div className="fade-up delay-100">
        <DropZone onResult={onUploadResult} />
      </div>

      {/* KPI Cards */}
      <div className="fade-up delay-200">
        <StatsGrid />
      </div>

      {/* Section divider */}
      <div className="fade-up delay-300" style={{ display:"flex", alignItems:"center", gap:16, margin:"48px 0 24px" }}>
        <span style={{ fontSize:12, fontWeight:600, color:"var(--vl-muted)", letterSpacing:"0.15em", textTransform:"uppercase", fontFamily:"'Montserrat',sans-serif" }}>Activity & Insights</span>
        <div style={{ flex:1, height:1, background:"var(--vl-border)" }} />
      </div>

      {/* Grid widgets */}
      <div className="fade-up delay-400" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(380px,1fr))", gap:24 }}>
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

      <div style={{ display:"flex", minHeight:"100vh", background:"transparent" }}>
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
