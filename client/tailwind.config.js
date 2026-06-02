/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vl: {
          bg:        "#050505",
          bg2:       "#111111",
          card:      "#141414",
          card2:     "#1A1A1A",
          border:    "#2A2A2A",
          border2:   "#3A3A3A",
          ochre:     "#E0C39A", /* Pale Champagne */
          ochre2:    "#F2DDBA",
          ochre3:    "#FFF2DF",
          text:      "#FFFFFF",
          text2:     "#D6C7B8",
          muted:     "#888888",
          muted2:    "#555555",
          success:   "#4CAF50",
          warning:   "#F59E0B",
          risk:      "#EF4444",
          info:      "#3B82F6",
        },
      },
      fontFamily: {
        serif:  ["'Cormorant Garamond'", "Georgia", "serif"],
        sans:   ["Montserrat", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "card":      "0 2px 12px rgba(0,0,0,0.5)",
        "card-hover":"0 12px 40px rgba(0,0,0,0.8)",
        "ochre":     "0 0 24px rgba(224,195,154,0.15)",
        "ochre-lg":  "0 0 40px rgba(224,195,154,0.25)",
        "risk":      "0 0 24px rgba(239,68,68,0.15)",
        "success":   "0 0 24px rgba(76,175,80,0.15)",
      },
      animation: {
        "fade-up":     "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "slide-in":    "slideIn 0.3s cubic-bezier(0.22,1,0.36,1) both",
        "spin-slow":   "spin 2s linear infinite",
        "pulse-ochre": "pulseOchre 2s ease-in-out infinite",
        "shimmer":     "shimmer 1.8s ease-in-out infinite",
        "counter":     "counterUp 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
      keyframes: {
        fadeUp: {
          "from": { opacity: "0", transform: "translateY(16px)" },
          "to":   { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "from": { opacity: "0", transform: "translateY(-8px)" },
          "to":   { opacity: "1", transform: "translateY(0)" },
        },
        pulseOchre: {
          "0%, 100%": { boxShadow: "0 0 8px rgba(212,164,74,0.2)" },
          "50%":      { boxShadow: "0 0 24px rgba(212,164,74,0.5)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
        counterUp: {
          "from": { opacity: "0", transform: "translateY(10px)" },
          "to":   { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};