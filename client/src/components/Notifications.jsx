import { useState, useEffect } from "react";

let _notify = null;

export function notify(message, type = "info") {
  if (_notify) _notify(message, type);
}

const typeConfig = {
  success: { bg: "#2a1f1a", border: "#4a3728", color: "#d4a574", icon: "✓" },
  info: { bg: "#2a1f1a", border: "#4a3728", color: "#d4a574", icon: "ℹ" },
  error: { bg: "#2a1f1a", border: "#8b2e2e", color: "#d4a574", icon: "✕" },
  default: { bg: "#2a1f1a", border: "#4a3728", color: "#d4a574", icon: "•" },
};

export default function Notifications() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    _notify = (message, type) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3200);
    };
    return () => { _notify = null; };
  }, []);

  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, pointerEvents: "none" }}>
      {toasts.map(toast => {
        const cfg = typeConfig[toast.type] ?? typeConfig.default;
        return (
          <div key={toast.id} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "11px 16px", borderRadius: 12,
            background: cfg.bg, border: `1px solid ${cfg.border}`,
            color: "#f1f5f9", fontSize: 13, fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            animation: "slideIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
            minWidth: 240,
          }}>
            <span style={{
              width: 20, height: 20, borderRadius: "50%",
              background: cfg.color + "22", color: cfg.color,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}>{cfg.icon}</span>
            {toast.message}
          </div>
        );
      })}
      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-8px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }`}</style>
    </div>
  );
}