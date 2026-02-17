import { useState, useEffect } from "react";
import VeriLexLogo from "./VeriLexLogo";

const navLinks = [
  { id: "dashboard", label: "Dashboard", icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" /></svg> },
  { id: "documents", label: "Documents", icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" /></svg> },
  { id: "analytics", label: "Analytics", icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg> },
  { id: "reports", label: "Reports", icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" /></svg> },
  { id: "settings", label: "Settings", icon: <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg> },
];

function getInitials(name) {
  return name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Sidebar({ activePage, setActivePage }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [profileName, setProfileName] = useState("Rishit Chaudhary");
  const [profileRole, setProfileRole] = useState("Legal Analyst");

  useEffect(() => {
    // Load profile from localStorage
    const loadProfile = () => {
      const savedName = localStorage.getItem("profile_name") || "Rishit Chaudhary";
      const savedRole = localStorage.getItem("profile_role") || "Legal Analyst";
      setProfileName(savedName);
      setProfileRole(savedRole);
    };

    loadProfile();

    // Listen for profile updates
    const handleProfileUpdate = () => loadProfile();
    window.addEventListener("profileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdate);
  }, []);

  const initials = getInitials(profileName);

  return (
    <aside style={{
      position: "fixed", left: 0, top: 0,
      width: 268, height: "100vh",
      background: "#2a1f1a",
      borderRight: "1px solid #4a3728",
      display: "flex", flexDirection: "column",
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: "28px 24px 22px", borderBottom: "1px solid #4a3728" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <VeriLexLogo size={34} />
          <div>
            <h1 style={{
              margin: 0, fontSize: 20, fontWeight: 800,
              background: "linear-gradient(135deg, #d4a574 0%, #b8860b 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              fontFamily: "'Playfair Display', Georgia, serif",
              letterSpacing: "-0.02em",
            }}>VeriLex</h1>
            <p style={{ margin: 0, fontSize: 10, color: "#6b5d52", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>Legal Analyzer</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div style={{ padding: "20px 24px 8px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6b5d52", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Main Menu
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 12px", overflowY: "auto" }}>
        {navLinks.map((link) => {
          const isActive = activePage === link.id;
          const isHovered = hoveredId === link.id;
          return (
            <a
              key={link.id}
              href="#"
              onClick={e => { e.preventDefault(); setActivePage(link.id); }}
              onMouseEnter={() => setHoveredId(link.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: "relative",
                display: "flex", alignItems: "center", gap: 11,
                padding: "11px 14px", marginBottom: 3,
                borderRadius: 10,
                color: isActive ? "#d4a574" : isHovered ? "#e8dfd5" : "#a39688",
                background: isActive
                  ? "rgba(212,165,116,0.12)"
                  : isHovered ? "rgba(212,165,116,0.04)" : "transparent",
                textDecoration: "none",
                fontSize: 14, fontWeight: 600,
                transform: isHovered && !isActive ? "translateX(3px)" : "translateX(0)",
                transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                border: isActive ? "1px solid rgba(212,165,116,0.2)" : "1px solid transparent",
              }}
            >
              {/* Active left bar */}
              {isActive && (
                <span style={{
                  position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: "55%",
                  background: "linear-gradient(180deg, #d4a574, #b8860b)",
                  borderRadius: "0 3px 3px 0",
                }} />
              )}
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{link.icon}</span>
              <span>{link.label}</span>
              {isActive && (
                <span style={{
                  marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                  background: "#d4a574", boxShadow: "0 0 8px #d4a574",
                }} />
              )}
            </a>
          );
        })}
      </nav>

      {/* Divider */}
      <div style={{ height: 1, margin: "0 16px", background: "#4a3728" }} />

      {/* User */}
      <div style={{ padding: "16px 12px" }}>
        <div
          onClick={() => setActivePage("settings")}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "12px 14px", borderRadius: 12,
            background: "#3a2f28", border: "1px solid #4a3728",
            cursor: "pointer", transition: "all 0.2s ease",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "#4a3728"; e.currentTarget.style.borderColor = "#6b5d52"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#3a2f28"; e.currentTarget.style.borderColor = "#4a3728"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #d4a574, #b8860b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700, color: "#1a1410", flexShrink: 0,
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#faf7f2", lineHeight: 1.3 }}>{profileName}</div>
            <div style={{ fontSize: 11, color: "#a39688" }}>{profileRole}</div>
          </div>
          <svg width="14" height="14" viewBox="0 0 20 20" fill="#6b5d52" style={{ marginLeft: "auto", flexShrink: 0 }}>
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </aside>
  );
}