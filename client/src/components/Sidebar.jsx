import { useState, useEffect } from "react";
import VeriLexLogo from "./VeriLexLogo";

const navLinks = [
  {
    id: "dashboard", label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
    ),
  },
  {
    id: "documents", label: "Documents",
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "analytics", label: "Analytics",
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    id: "reports", label: "Reports",
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    id: "settings", label: "Settings",
    icon: (
      <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
    ),
  },
];

function getInitials(name) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function Sidebar({ activePage, setActivePage }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [profileName, setProfileName] = useState("Rishit Chaudhary");
  const [profileRole, setProfileRole] = useState("Senior Partner");

  useEffect(() => {
    const load = () => {
      setProfileName(localStorage.getItem("profile_name") || "Rishit Chaudhary");
      setProfileRole(localStorage.getItem("profile_role") || "Senior Partner");
    };
    load();
    window.addEventListener("profileUpdated", load);
    return () => window.removeEventListener("profileUpdated", load);
  }, []);

  const initials = getInitials(profileName);

  return (
    <>
      <style>{`
        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          margin-bottom: 4px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'Montserrat', sans-serif;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          cursor: pointer;
          color: var(--vl-muted);
          border: 1px solid transparent;
        }
        .sidebar-nav-item:hover {
          color: var(--vl-text);
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.05);
          transform: translateX(4px);
        }
        .sidebar-nav-item.active {
          color: var(--vl-ochre) !important;
          background: rgba(212, 175, 55, 0.05);
          border-color: var(--vl-border-gold);
          box-shadow: 0 4px 12px rgba(212,175,55,0.05);
        }
        .sidebar-user-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: 12px;
          background: var(--vl-card);
          border: 1px solid var(--vl-border);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .sidebar-user-card:hover {
          background: var(--vl-card2);
          border-color: var(--vl-border-gold);
          box-shadow: 0 4px 12px rgba(212,175,55,0.1);
        }
      `}</style>

      <aside style={{
        position: "fixed", left: 0, top: 0,
        width: "var(--sidebar-w)", height: "100vh",
        background: "rgba(11, 15, 25, 0.8)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderRight: "1px solid var(--vl-border)",
        display: "flex", flexDirection: "column",
        zIndex: 100,
      }}>

        {/* ── Logo ─────────────────────────────────────────────── */}
        <div style={{ padding: "40px 24px 24px", borderBottom: "1px solid var(--vl-border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 0, justifyContent: "center", marginBottom: 12 }}>
            <h1 style={{
              margin: 0, fontSize: 26, fontWeight: 400,
              fontFamily: "'Cormorant Garamond', serif",
              color: "var(--vl-text)",
              letterSpacing: "0.02em",
            }}>Veri</h1>
            <h1 style={{
              margin: 0, fontSize: 24, fontWeight: 300,
              fontFamily: "'Montserrat', sans-serif",
              color: "var(--vl-ochre)",
              letterSpacing: "0.05em",
            }}>Lex</h1>
          </div>

          <div style={{ textAlign: "center" }}>
            <p style={{
              margin: 0, fontSize: 9, color: "var(--vl-muted)",
              letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 500, fontFamily:"'Inter', sans-serif"
            }}>Legal Intelligence</p>
          </div>

          {/* Live indicator */}
          <div style={{
            display: "flex", justifyContent:"center",
            marginTop: 20
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(52, 211, 153, 0.1)",
              border: "1px solid rgba(52, 211, 153, 0.2)",
              borderRadius: 99, padding: "4px 12px",
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%", background: "var(--vl-success)",
                animation: "pulseOchre 2s ease-in-out infinite",
                display: "inline-block",
                boxShadow: "0 0 8px var(--vl-success)"
              }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: "var(--vl-success)", letterSpacing: "0.08em", fontFamily:"'Inter',sans-serif", textTransform:"uppercase" }}>
                AI Core Online
              </span>
            </div>
          </div>
        </div>

        {/* ── Section label ─────────────────────────────────────── */}
        <div style={{ padding: "24px 24px 8px" }}>
          <span style={{
            fontSize: 10, fontWeight: 700, color: "var(--vl-muted2)",
            letterSpacing: "0.2em", textTransform: "uppercase", fontFamily:"'Montserrat', sans-serif"
          }}>Navigation</span>
        </div>

        {/* ── Nav links ─────────────────────────────────────────── */}
        <nav style={{ flex: 1, padding: "8px 16px", overflowY: "auto" }}>
          {navLinks.map((link) => {
            const isActive = activePage === link.id;
            const isHovered = hoveredId === link.id;
            return (
              <a
                key={link.id}
                href="#"
                className={`sidebar-nav-item${isActive ? " active" : ""}`}
                onClick={e => { e.preventDefault(); setActivePage(link.id); }}
                onMouseEnter={() => setHoveredId(link.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span style={{ opacity: isActive ? 1 : isHovered ? 0.9 : 0.65, flexShrink: 0, transition:"all 0.2s" }}>
                  {link.icon}
                </span>
                <span style={{ flex: 1 }}>{link.label}</span>
                {isActive && (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--vl-ochre)",
                    boxShadow: "0 0 8px var(--vl-ochre)",
                    flexShrink: 0,
                  }} />
                )}
              </a>
            );
          })}
        </nav>

        {/* ── Divider ───────────────────────────────────────────── */}
        <div style={{ height: 1, margin: "0 24px", background: "var(--vl-border)" }} />

        {/* ── User profile card ─────────────────────────────────── */}
        <div style={{ padding: "20px 16px 24px" }}>
          <div
            className="sidebar-user-card"
            onClick={() => setActivePage("settings")}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "10px", flexShrink: 0,
              background: "linear-gradient(135deg, var(--vl-ochre2), var(--vl-ochre))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "#000", fontFamily: "'Montserrat', sans-serif",
              boxShadow: "0 4px 12px rgba(212,175,55,0.3)"
            }}>{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: "var(--vl-text)",
                lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                fontFamily: "'Inter', sans-serif"
              }}>{profileName}</div>
              <div style={{ fontSize: 11, color: "var(--vl-ochre2)", fontFamily: "'Inter', sans-serif", marginTop:2 }}>{profileRole}</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="var(--vl-muted)" style={{ flexShrink: 0 }}>
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}