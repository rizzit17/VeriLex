const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const fallbackBaseUrl = import.meta.env.DEV ? "http://localhost:3000" : "";

const normalizedBaseUrl = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, "")
  : fallbackBaseUrl;

export const API_BASE_URL = normalizedBaseUrl;

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath || "/"}`;
}
