// ── Format relative time from ISO string ──────────────────────────────────────

export function formatRelativeTime(isoString) {
    const now = new Date();
    const then = new Date(isoString);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
    if (diffDay < 30) {
        const weeks = Math.floor(diffDay / 7);
        return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    }
    if (diffDay < 365) {
        const months = Math.floor(diffDay / 30);
        return `${months} month${months > 1 ? "s" : ""} ago`;
    }
    const years = Math.floor(diffDay / 365);
    return `${years} year${years > 1 ? "s" : ""} ago`;
}

// ── Check if ISO string is today ──────────────────────────────────────────────

export function isToday(isoString) {
    const now = new Date();
    const then = new Date(isoString);
    return (
        now.getFullYear() === then.getFullYear() &&
        now.getMonth() === then.getMonth() &&
        now.getDate() === then.getDate()
    );
}

// ── Format file size ──────────────────────────────────────────────────────────

export function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
