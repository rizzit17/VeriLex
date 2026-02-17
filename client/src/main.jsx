// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// ✅ Tailwind CSS — must be imported here so styles apply globally
import "./index.css";

import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);