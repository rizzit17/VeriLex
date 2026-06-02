import { useState, useEffect } from "react";
import { notify } from "../components/Notifications";

function FormSection({ title, description, children }) {
  return (
    <div style={{ background: "var(--vl-card)", border: "1px solid var(--vl-border)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>
      <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--vl-border)", background: "var(--vl-card2)" }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--vl-text)", fontFamily: "'Playfair Display', serif" }}>{title}</h3>
        {description && <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--vl-muted)" }}>{description}</p>}
      </div>
      <div style={{ padding: "22px" }}>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--vl-muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
      {hint && <p style={{ margin: "5px 0 0", fontSize: 11, color: "var(--vl-muted2)" }}>{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("profile_name") || "Rishit Chaudhary");
    setRole(localStorage.getItem("profile_role") || "Legal Analyst");
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
    <div className="vl-page" style={{ maxWidth: 680 }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <header style={{ marginBottom: 32 }} className="fade-up">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(212,164,74,0.1)", border: "1px solid rgba(212,164,74,0.2)", borderRadius: 99, padding: "3px 12px", marginBottom: 10 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--vl-ochre)", display: "inline-block" }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--vl-ochre)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Configuration</span>
        </div>
        <h1 style={{ fontSize: 30, margin: "0 0 6px", lineHeight: 1.15 }}>Settings</h1>
        <p style={{ color: "var(--vl-muted)", fontSize: 14, margin: 0 }}>Manage your profile and preferences</p>
      </header>

      {/* ── Profile section ─────────────────────────────────────── */}
      <FormSection title="Profile" description="Your identity information shown in the sidebar and reports">
        <FormField label="Display Name" hint="Used in report headers and sidebar display">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="vl-input"
            placeholder="Enter your full name"
          />
        </FormField>
        <FormField label="Role / Title" hint="Your professional role — e.g. Legal Analyst, Senior Counsel">
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="vl-input"
            placeholder="Enter your role"
          />
        </FormField>
        <button
          onClick={handleSave}
          className="vl-btn-primary"
          style={{ minWidth: 140 }}
        >
          {saved ? (
            <>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" clipRule="evenodd" />
              </svg>
              Saved!
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                <path d="M2 1a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V2a1 1 0 00-1-1H9.5a1 1 0 00-1 1v7.293l2.646-2.647a.5.5 0 01.708.708l-3.5 3.5a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L7.5 10.293V3a2 2 0 012-2H14a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V2a2 2 0 012-2h2.5a.5.5 0 010 1H2z"/>
              </svg>
              Save Changes
            </>
          )}
        </button>
      </FormSection>

      {/* ── Platform info ──────────────────────────────────────── */}
      <FormSection title="About VeriLex" description="Platform version and system information">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Platform",  value: "VeriLex Legal Intelligence" },
            { label: "Version",   value: "2.0.0 — Premium" },
            { label: "AI Engine", value: "Google Gemini Pro" },
            { label: "Build",     value: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }) },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: "14px 16px", background: "var(--vl-bg2)", border: "1px solid var(--vl-border)", borderRadius: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "var(--vl-muted2)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--vl-text2)" }}>{value}</div>
            </div>
          ))}
        </div>
      </FormSection>
    </div>
  );
}
