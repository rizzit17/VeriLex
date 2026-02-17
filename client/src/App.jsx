import { useState, useRef, useCallback, useEffect } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";
import StatsGrid from "./components/StatsGrid";
import RecentDocuments from "./components/RecentDocuments";
import RiskAnalysis from "./components/RiskAnalysis";
import ActivityFeed from "./components/ActivityFeed";
import Notifications, { notify } from "./components/Notifications";
import DocumentsPage from "./pages/DocumentsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import { useHistory } from "./hooks/useHistory";

const API_URL = "http://localhost:3000/api/upload";


const getGlobalStyles = (theme) => `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  body {
    font-family: 'Inter', sans-serif;
    background: ${theme === 'dark' ? '#1a1410' : '#faf7f2'};
    color: ${theme === 'dark' ? '#faf7f2' : '#2a1f1a'};
    -webkit-font-smoothing: antialiased;
    margin: 0;
    position: relative;
    transition: background 0.3s ease, color 0.3s ease;
  }

  /* Parchment texture overlay */
  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: ${theme === 'dark' ? '0.03' : '0.06'};
    pointer-events: none;
    z-index: 0;
    background-image: 
      repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,165,116,0.03) 2px, rgba(212,165,116,0.03) 4px),
      repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(212,165,116,0.03) 2px, rgba(212,165,116,0.03) 4px),
      radial-gradient(ellipse at 20% 30%, rgba(245,230,211,0.05) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 70%, rgba(212,165,116,0.05) 0%, transparent 50%);
  }

  h1, h2, h3 {
    font-family: 'Playfair Display', Georgia, serif;
    letter-spacing: -0.02em;
    font-weight: 800;
    color: ${theme === 'dark' ? '#d4a574' : '#b8860b'};
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes modalIn {
    from { opacity: 0; transform: translateY(24px) scale(0.98); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .fade-up { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${theme === 'dark' ? '#1a1410' : '#f5f0e8'}; }
  ::-webkit-scrollbar-thumb { background: ${theme === 'dark' ? '#4a3728' : '#c4b59a'}; border-radius: 99px; }
  ::-webkit-scrollbar-thumb:hover { background: ${theme === 'dark' ? '#6b5d52' : '#b8a68a'}; }
`;

// ── Intro Landing Page ─────────────────────────────────────────────────────────
function IntroPage({ onSkip, theme = 'dark' }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation at 3.5s
    const fadeTimer = setTimeout(() => setFadeOut(true), 3500);
    // Complete transition at 4s
    const skipTimer = setTimeout(onSkip, 4000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(skipTimer);
    };
  }, [onSkip]);

  const handleSkip = () => {
    setFadeOut(true);
    setTimeout(onSkip, 500);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      background: theme === 'dark' ? '#1a1410' : '#faf7f2',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      opacity: fadeOut ? 0 : 1,
      transition: 'opacity 0.5s ease-out',
    }}>
      {/* Parchment texture overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: theme === 'dark' ? 0.03 : 0.06,
        pointerEvents: 'none',
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(212,165,116,0.03) 2px, rgba(212,165,116,0.03) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(212,165,116,0.03) 2px, rgba(212,165,116,0.03) 4px),
          radial-gradient(ellipse at 20% 30%, rgba(245,230,211,0.05) 0%, transparent 50%),
          radial-gradient(ellipse at 80% 70%, rgba(212,165,116,0.05) 0%, transparent 50%)
        `,
      }} />

      {/* Skip button */}
      <button
        onClick={handleSkip}
        style={{
          position: 'absolute',
          top: 32,
          right: 40,
          background: 'transparent',
          border: `1px solid ${theme === 'dark' ? '#4a3728' : '#c4b59a'}`,
          color: theme === 'dark' ? '#d4a574' : '#b8860b',
          padding: '8px 16px',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: 'Inter, sans-serif',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = theme === 'dark' ? 'rgba(212,165,116,0.1)' : 'rgba(184,134,11,0.1)';
          e.currentTarget.style.borderColor = theme === 'dark' ? '#d4a574' : '#b8860b';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = theme === 'dark' ? '#4a3728' : '#c4b59a';
        }}
      >
        Skip Intro →
      </button>

      {/* Content container */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        maxWidth: 600,
        textAlign: 'center',
        padding: '0 40px',
      }}>
        {/* Logo - scales badge icon */}
        <div style={{
          animation: 'introLogo 0.8s cubic-bezier(0.22, 1, 0.36, 1) both',
        }}>
          <svg width="64" height="64" viewBox="0 0 100 100" fill="none">
            <rect x="10" y="10" width="80" height="80" rx="12"
              fill={theme === 'dark' ? '#3a2f28' : '#e8dfd5'}
              stroke={theme === 'dark' ? '#d4a574' : '#b8860b'}
              strokeWidth="2"
            />
            <path
              d="M50 30 L35 45 L42 45 L42 60 L50 60 L50 45 L58 45 L58 60 L65 60 L65 45 L72 45 Z"
              fill={theme === 'dark' ? '#d4a574' : '#b8860b'}
              stroke={theme === 'dark' ? '#d4a574' : '#b8860b'}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <rect x="35" y="65" width="30" height="3" rx="1.5"
              fill={theme === 'dark' ? '#d4a574' : '#b8860b'}
            />
          </svg>
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 48,
          fontWeight: 800,
          margin: 0,
          color: theme === 'dark' ? '#d4a574' : '#b8860b',
          letterSpacing: '-0.02em',
          animation: 'introWordmark 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both',
        }}>
          VeriLex
        </h1>

        {/* Tagline */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 18,
          fontWeight: 600,
          margin: 0,
          color: theme === 'dark' ? '#faf7f2' : '#2a1f1a',
          letterSpacing: '0.02em',
          animation: 'introTagline 0.8s cubic-bezier(0.22, 1, 0.36, 1) 1.0s both',
        }}>
          AI-Powered Legal Document Analysis
        </p>

        {/* Purpose statement */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 14,
          fontWeight: 400,
          margin: 0,
          color: theme === 'dark' ? '#c4b59a' : '#6b5d52',
          lineHeight: 1.6,
          maxWidth: 500,
          animation: 'introPurpose 1.0s cubic-bezier(0.22, 1, 0.36, 1) 1.5s both',
        }}>
          Intelligent contract review and risk assessment for legal professionals.
          Analyze documents, identify clauses, and assess compliance with precision.
        </p>
      </div>

      {/* Keyframe animations */}
      <style>{`
        @keyframes introLogo {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes introWordmark {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes introTagline {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes introPurpose {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// ── Risk badge ─────────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const map = {
    HIGH: { bg: "rgba(139,46,46,0.15)", color: "#d4a574", border: "rgba(139,46,46,0.4)" },
    MEDIUM: { bg: "rgba(204,119,34,0.15)", color: "#d4a574", border: "rgba(204,119,34,0.4)" },
    LOW: { bg: "rgba(45,80,22,0.15)", color: "#d4a574", border: "rgba(45,80,22,0.4)" },
  };
  const s = map[level] ?? map.LOW;
  return (
    <span style={{
      padding: "2px 9px", borderRadius: 99,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      flexShrink: 0,
    }}>
      {level}
    </span>
  );
}

// ── Analysis modal ─────────────────────────────────────────────────────────────
function AnalysisModal({ result, onClose }) {
  const { file, analysis } = result;
  const { summary, key_obligations = [], risky_clauses = [], missing_clauses = [], suggestions = [] } = analysis;

  const Section = ({ icon, title, children }) => (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h3 style={{
          margin: 0, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em",
          textTransform: "uppercase", color: "#6b5d52",
        }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#2a1f1a", border: "1px solid #4a3728",
          borderRadius: 20, width: "100%", maxWidth: 720,
          maxHeight: "88vh", display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          animation: "modalIn 0.35s cubic-bezier(0.22,1,0.36,1) both",
        }}
      >
        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: "1px solid #4a3728", flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: "rgba(212,165,116,0.15)", border: "1px solid rgba(212,165,116,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
            }}>📄</div>
            <div>
              <h2 style={{ margin: 0, fontSize: 15, color: "#faf7f2" }}>{file.originalName}</h2>
              <p style={{ margin: 0, fontSize: 11, color: "#6b5d52" }}>
                {(file.sizeBytes / 1024).toFixed(1)} KB · AI Analysis Complete
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "#3a2f28", border: "1px solid #4a3728",
              color: "#6b5d52", cursor: "pointer", fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#4a3728"; e.currentTarget.style.color = "#faf7f2"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#3a2f28"; e.currentTarget.style.color = "#6b5d52"; }}
          >✕</button>
        </div>

        {/* Modal body — scrollable */}
        <div style={{ overflowY: "auto", padding: "24px", flex: 1 }}>

          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
            {[
              { label: "Obligations", value: key_obligations.length, color: "#d4a574" },
              { label: "Risky Clauses", value: risky_clauses.length, color: "#8b2e2e" },
              { label: "Missing Clauses", value: missing_clauses.length, color: "#cc7722" },
              { label: "Suggestions", value: suggestions.length, color: "#2d5016" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{
                background: "#2a1f1a", border: "1px solid #4a3728",
                borderRadius: 12, padding: "14px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "'Playfair Display', serif", lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 10, color: "#6b5d52", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <Section icon="📋" title="Summary">
            <p style={{ margin: 0, fontSize: 14, color: "#c9b8a8", lineHeight: 1.7, background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 12, padding: "14px 16px" }}>
              {summary}
            </p>
          </Section>

          {/* Key obligations */}
          {key_obligations.length > 0 && (
            <Section icon="📌" title="Key Obligations">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {key_obligations.map((o, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#d4a574", flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: "#e8dfd5", lineHeight: 1.6 }}>{o}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Risky clauses */}
          {risky_clauses.length > 0 && (
            <Section icon="⚠️" title="Risky Clauses">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {risky_clauses.map((c, i) => (
                  <div key={i} style={{
                    padding: "12px 14px", background: "#2a1f1a",
                    borderLeft: `3px solid ${c.risk_level === "HIGH" ? "#8b2e2e" : c.risk_level === "MEDIUM" ? "#cc7722" : "#2d5016"}`,
                    borderRadius: "0 10px 10px 0", border: "1px solid #4a3728",
                    borderLeftWidth: 3,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <RiskBadge level={c.risk_level} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#faf7f2" }}>{c.clause}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#a39688", lineHeight: 1.6 }}>{c.reason}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Missing clauses */}
          {missing_clauses.length > 0 && (
            <Section icon="🔍" title="Missing Clauses">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {missing_clauses.map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#cc7722", flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: "#e8dfd5", lineHeight: 1.6 }}>{m}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <Section icon="💡" title="Suggestions">
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {suggestions.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 14px", background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#2d5016", flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 13, color: "#e8dfd5", lineHeight: 1.6 }}>{s}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Upload button with hidden input ───────────────────────────────────────────
function UploadButton({ onResult }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";            // reset so same file can be re-selected
    if (!file) return;

    if (file.type !== "application/pdf") {
      notify("Only PDF files are accepted.", "error");
      return;
    }

    setLoading(true);
    notify(`Analyzing ${file.name}…`, "info");

    try {
      const form = new FormData();
      form.append("file", file);

      const { data } = await axios.post(API_URL, form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 90_000,
      });

      if (!data.success) throw new Error(data.error || "Analysis failed.");

      notify("Analysis complete!", "success");
      onResult(data);
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Upload failed.";
      notify(`Error: ${msg}`, "error");
    } finally {
      setLoading(false);
    }
  }, [onResult]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button
        disabled={loading}
        onClick={() => !loading && fileInputRef.current?.click()}
        style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          padding: "9px 20px",
          background: loading ? "#4a3728" : "linear-gradient(135deg, #d4a574 0%, #b8860b 100%)",
          color: loading ? "#6b5d52" : "#1a1410", border: "none", borderRadius: 10,
          fontSize: 13, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          boxShadow: loading ? "none" : "0 4px 20px rgba(212,165,116,0.35)",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          fontFamily: "inherit",
          opacity: loading ? 0.75 : 1,
        }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(212,165,116,0.45)"; } }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 20px rgba(212,165,116,0.35)"; }}
      >
        {loading ? (
          <>
            <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
            Analyzing…
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8.5 11.5a.5.5 0 01-1 0V7.707L6.354 8.854a.5.5 0 11-.708-.708l2-2a.5.5 0 01.708 0l2 2a.5.5 0 01-.708.708L8.5 7.707V11.5z" />
              <path d="M14 14V4.5L9.5 0H4a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2zM9.5 3A1.5 1.5 0 0011 4.5h2V14a1 1 0 01-1 1H4a1 1 0 01-1-1V2a1 1 0 011-1h5.5v2z" />
            </svg>
            Upload Document
          </>
        )}
      </button>
    </>
  );
}

// ── Dashboard page ─────────────────────────────────────────────────────────────
function DashboardPage({ onViewAnalysis, theme = 'dark' }) {
  return (
    <main style={{ marginLeft: 268, flex: 1, padding: "36px 40px 60px" }}>
      {/* ── Page header ─────────────────────────────────────────── */}
      <header className="fade-up" style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 40,
      }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(212,165,116,0.12)", border: "1px solid rgba(212,165,116,0.25)",
            borderRadius: 99, padding: "3px 12px", marginBottom: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#d4a574", display: "inline-block" }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#d4a574", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Live Overview
            </span>
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.15, color: theme === 'dark' ? '#faf7f2' : '#2a1f1a' }}>
            Dashboard
          </h1>
          <p style={{ color: theme === 'dark' ? '#94a3b8' : '#6b5d52', fontSize: 14, margin: 0 }}>
            Monitor your legal document analysis in real-time
          </p>
        </div>

      </header>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <StatsGrid />

      {/* ── Section divider ───────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, marginTop: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: theme === 'dark' ? '#6b5d52' : '#8a7a6a', letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Activity & Insights
        </span>
        <div style={{ flex: 1, height: 1, background: "#4a3728" }} />
      </div>

      {/* ── Dashboard grid ─────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: 20 }}>
        <RecentDocuments onViewAnalysis={onViewAnalysis} />
        <RiskAnalysis />
        <ActivityFeed />
      </div>
    </main>
  );
}

// ── App root ───────────────────────────────────────────────────────────────────
export default function App() {
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [theme, setTheme] = useState(() => localStorage.getItem('verilex-theme') || 'dark');
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('verilex-intro-seen'));
  const { refresh } = useHistory();

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('verilex-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSkipIntro = useCallback(() => {
    setShowIntro(false);
    sessionStorage.setItem('verilex-intro-seen', 'true');
  }, []);

  const handleUploadResult = useCallback((data) => {
    setAnalysisResult(data);
    refresh(); // Refresh history after successful upload
  }, [refresh]);

  const handleViewAnalysis = useCallback((entry) => {
    setAnalysisResult(entry);
  }, []);

  // Show intro page on first visit
  if (showIntro) {
    return (
      <>
        <style>{getGlobalStyles(theme)}</style>
        <IntroPage onSkip={handleSkipIntro} theme={theme} />
      </>
    );
  }

  return (
    <>
      <style>{getGlobalStyles(theme)}</style>
      <Notifications />

      {/* Analysis modal — rendered when a result is available */}
      {analysisResult && (
        <AnalysisModal result={analysisResult} onClose={() => setAnalysisResult(null)} />
      )}

      {/* Theme Toggle, Refresh & Upload — fixed position */}
      <div style={{ position: "fixed", top: 36, right: 40, zIndex: 999, display: "flex", gap: 10, alignItems: "center" }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 38, height: 38,
            background: "#3a2f28", color: "#d4a574",
            border: "1px solid #4a3728", borderRadius: 10,
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#4a3728"; e.currentTarget.style.color = "#e8c896"; e.currentTarget.style.borderColor = "#6b5d52"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#3a2f28"; e.currentTarget.style.color = "#d4a574"; e.currentTarget.style.borderColor = "#4a3728"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {theme === 'dark' ? (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 11a3 3 0 110-6 3 3 0 010 6zm0 1a4 4 0 100-8 4 4 0 000 8zM8 0a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 0zm0 13a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 13zm8-5a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2a.5.5 0 01.5.5zM3 8a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2A.5.5 0 013 8zm10.657-5.657a.5.5 0 010 .707l-1.414 1.415a.5.5 0 11-.707-.708l1.414-1.414a.5.5 0 01.707 0zm-9.193 9.193a.5.5 0 010 .707L3.05 13.657a.5.5 0 01-.707-.707l1.414-1.414a.5.5 0 01.707 0zm9.193 2.121a.5.5 0 01-.707 0l-1.414-1.414a.5.5 0 01.707-.707l1.414 1.414a.5.5 0 010 .707zM4.464 4.465a.5.5 0 01-.707 0L2.343 3.05a.5.5 0 11.707-.707l1.414 1.414a.5.5 0 010 .708z" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278zM4.858 1.311A7.269 7.269 0 001.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 005.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z" />
            </svg>
          )}
        </button>

        {/* Refresh Button */}
        <button
          onClick={() => window.location.reload()}
          style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "9px 18px",
            background: "#3a2f28", color: "#d4a574",
            border: "1px solid #4a3728", borderRadius: 10,
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
            fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#4a3728"; e.currentTarget.style.color = "#e8c896"; e.currentTarget.style.borderColor = "#6b5d52"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#3a2f28"; e.currentTarget.style.color = "#d4a574"; e.currentTarget.style.borderColor = "#4a3728"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path fillRule="evenodd" d="M8 3a5 5 0 104.546 2.914.5.5 0 00-.908-.417A4 4 0 118 4v1H6.5a.5.5 0 000 1H9a.5.5 0 00.5-.5V2.5a.5.5 0 00-1 0V3z" clipRule="evenodd" />
          </svg>
          Refresh
        </button>
        <UploadButton onResult={handleUploadResult} />
      </div>

      <div style={{ display: "flex", minHeight: "100vh", background: theme === 'dark' ? '#1a1410' : '#faf7f2', transition: "background 0.3s ease" }}>
        <Sidebar activePage={activePage} setActivePage={setActivePage} />

        {activePage === "dashboard" && <DashboardPage onViewAnalysis={handleViewAnalysis} theme={theme} />}
        {activePage === "documents" && <DocumentsPage onViewAnalysis={handleViewAnalysis} theme={theme} />}
        {activePage === "analytics" && <AnalyticsPage theme={theme} />}
        {activePage === "reports" && <ReportsPage theme={theme} />}
        {activePage === "settings" && <SettingsPage theme={theme} />}
      </div>
    </>
  );
}