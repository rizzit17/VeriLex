import { useState, useEffect } from "react";
import { notify } from "../components/Notifications";

export default function SettingsPage() {
    const [name, setName] = useState("");
    const [role, setRole] = useState("");

    useEffect(() => {
        // Load from localStorage
        const savedName = localStorage.getItem("profile_name") || "Rishit Chaudhary";
        const savedRole = localStorage.getItem("profile_role") || "Legal Analyst";
        setName(savedName);
        setRole(savedRole);
    }, []);

    const handleSave = () => {
        localStorage.setItem("profile_name", name);
        localStorage.setItem("profile_role", role);
        notify("Profile settings saved successfully", "success");
        // Trigger a custom event so Sidebar can update
        window.dispatchEvent(new Event("profileUpdated"));
    };

    return (
        <div style={{ marginLeft: 268, padding: "36px 40px 60px", maxWidth: 600 }}>
            {/* Header */}
            <header style={{ marginBottom: 32 }}>
                <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px", lineHeight: 1.15, color: "#f1f5f9", fontFamily: "'Fraunces', Georgia, serif" }}>
                    Settings
                </h1>
                <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
                    Manage your profile and preferences
                </p>
            </header>

            {/* Form */}
            <div style={{ background: "#2a1f1a", border: "1px solid #4a3728", borderRadius: 16, padding: "24px" }}>
                <div style={{ marginBottom: 20 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Your Name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        style={{
                            width: "100%", padding: "10px 14px", borderRadius: 10,
                            background: "#1a1410", border: "1px solid #4a3728",
                            color: "#e2e8f0", fontSize: 14,
                            outline: "none", transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = "#d4a574"}
                        onBlur={e => e.currentTarget.style.borderColor = "#4a3728"}
                    />
                </div>

                <div style={{ marginBottom: 24 }}>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#94a3b8", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                        Your Role
                    </label>
                    <input
                        type="text"
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        style={{
                            width: "100%", padding: "10px 14px", borderRadius: 10,
                            background: "#111827", border: "1px solid #1a2538",
                            color: "#e2e8f0", fontSize: 14,
                            outline: "none", transition: "border-color 0.2s",
                        }}
                        onFocus={e => e.currentTarget.style.borderColor = "#d4a574"}
                        onBlur={e => e.currentTarget.style.borderColor = "#1a2538"}
                    />
                </div>

                <button
                    onClick={handleSave}
                    style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        padding: "10px 20px", borderRadius: 10,
                        background: "linear-gradient(135deg, #d4a574 0%, #b8860b 100%)",
                        color: "#fff", border: "none",
                        fontSize: 13, fontWeight: 700, cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(99,102,241,0.45)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(99,102,241,0.35)"; }}
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                        <path fillRule="evenodd" d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" clipRule="evenodd" />
                    </svg>
                    Save Changes
                </button>
            </div>
        </div>
    );
}
