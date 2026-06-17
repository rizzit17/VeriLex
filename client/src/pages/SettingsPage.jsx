import { useState, useEffect } from "react";
import { notify } from "../components/Notifications";

function FormSection({ title, description, children, delayIndex }) {
  return (
    <div className="glass-panel fade-up" style={{ 
      borderRadius: 20, overflow: "hidden", marginBottom: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      animationDelay: `${delayIndex * 100}ms`
    }}>
      <div style={{ padding: "24px 28px", borderBottom: "1px solid var(--vl-border)", background: "rgba(15,23,42,0.3)" }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "var(--vl-text)", fontFamily: "'Cormorant Garamond', serif" }}>{title}</h3>
        {description && <p style={{ margin: "4px 0 0", fontSize: 13, color: "var(--vl-muted)", fontFamily:"'Inter',sans-serif" }}>{description}</p>}
      </div>
      <div style={{ padding: "28px" }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--vl-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily:"'Montserrat',sans-serif" }}>{label}</label>
      {children}
      {hint && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--vl-muted2)", fontFamily:"'Inter',sans-serif" }}>{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("profile_name") || "Rishit Chaudhary");
    setRole(localStorage.getItem("profile_role") || "Senior Partner");
  }, []);

  const handleSave = () => {
    localStorage.setItem("profile_name", name);
    localStorage.setItem("profile_role", role);
    notify("Profile settings saved successfully", "success");
    window.dispatchEvent(new Event("profileUpdated"));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="vl-page" style={{ maxWidth: 720 }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ marginBottom: 40 }} className="fade-up">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.2)", borderRadius: 99, padding: "4px 14px", marginBottom: 16 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", display: "inline-block", boxShadow:"0 0 8px rgba(212,175,55,0.8)" }} />
          <span style={{ fontSize: 10, fontWeight: 600, color: "var(--vl-ochre)", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily:"'Montserrat',sans-serif" }}>Configuration</span>
        </div>
        <h1 style={{ fontSize: 36, margin: "0 0 8px", lineHeight: 1.15, fontFamily: "'Cormorant Garamond', serif" }}>Settings</h1>
        <p style={{ color: "var(--vl-muted)", fontSize: 15, margin: 0, fontFamily:"'Inter', sans-serif" }}>Manage your profile and platform preferences</p>
      </header>

      {/* ── Profile section ─────────────────────────────────────── */}
      <FormSection title="Profile Information" description="Your identity shown in the sidebar and exported reports" delayIndex={1}>
        <FormField label="Display Name" hint="Used in report headers and sidebar display">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="vl-input"
            placeholder="Enter your full name"
            style={{ fontSize: 14, padding: "14px 16px" }}
          />
        </FormField>
        <FormField label="Role / Title" hint="Your professional role — e.g. Senior Partner, Legal Counsel">
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="vl-input"
            placeholder="Enter your role"
            style={{ fontSize: 14, padding: "14px 16px" }}
          />
        </FormField>
        <div style={{ marginTop: 32 }}>
          <button
            onClick={handleSave}
            className="vl-btn-primary"
            style={{ minWidth: 160, padding: "12px 24px", fontSize: 13 }}
          >
            {saved ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" clipRule="evenodd" />
                </svg>
                Saved!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 1a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1H9.5a1 1 0 00-1 1v7.293l2.646-2.647a.5.5 0 01.708.708l-3.5 3.5a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L7.5 10.293V3a2 2 0 012-2H14a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2h2.5a.5.5 0 010 1H2z"/>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </FormSection>

      {/* ── Platform info ──────────────────────────────────────── */}
      <FormSection title="System Information" description="Current platform version and core components" delayIndex={2}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { label: "Platform",  value: "VeriLex Legal Intelligence" },
            { label: "Version",   value: "2.0.0 — Premium" },
            { label: "AI Engine", value: "Google Gemini Pro" },
            { label: "Build",     value: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "16px 20px", background: "rgba(255,255,255,0.02)", border: "1px solid var(--vl-border)", borderRadius: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6, fontFamily:"'Montserrat',sans-serif" }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: "var(--vl-text)", fontFamily:"'Inter',sans-serif" }}>{value}</div>
            </div>
          ))}
        </div>
      </FormSection>
    </div>
  );
}
