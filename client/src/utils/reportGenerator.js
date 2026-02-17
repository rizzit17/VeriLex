import { formatRelativeTime, formatFileSize } from "./timeUtils";

// ── Generate plain text report from history entry ────────────────────────────

export function generateTextReport(entry) {
    const { file, analysis, timestamp } = entry;
    const date = new Date(timestamp).toLocaleString();

    let report = "";
    report += "═══════════════════════════════════════════════════════════════════\n";
    report += "                    LEGAL DOCUMENT ANALYSIS REPORT\n";
    report += "═══════════════════════════════════════════════════════════════════\n\n";

    report += `Document:  ${file.originalName}\n`;
    report += `Size:      ${formatFileSize(file.sizeBytes)}\n`;
    report += `Analyzed:  ${date}\n`;
    report += `Report ID: ${entry.id}\n\n`;

    report += "───────────────────────────────────────────────────────────────────\n";
    report += "SUMMARY\n";
    report += "───────────────────────────────────────────────────────────────────\n\n";
    report += `${analysis.summary || "No summary available."}\n\n`;

    if (analysis.key_obligations && analysis.key_obligations.length > 0) {
        report += "───────────────────────────────────────────────────────────────────\n";
        report += "KEY OBLIGATIONS\n";
        report += "───────────────────────────────────────────────────────────────────\n\n";
        analysis.key_obligations.forEach((obligation, i) => {
            report += `${i + 1}. ${obligation}\n`;
        });
        report += "\n";
    }

    if (analysis.risky_clauses && analysis.risky_clauses.length > 0) {
        report += "───────────────────────────────────────────────────────────────────\n";
        report += "RISKY CLAUSES\n";
        report += "───────────────────────────────────────────────────────────────────\n\n";
        analysis.risky_clauses.forEach((clause, i) => {
            report += `${i + 1}. [${clause.risk_level}] ${clause.clause}\n`;
            report += `   Reason: ${clause.reason}\n\n`;
        });
    }

    if (analysis.missing_clauses && analysis.missing_clauses.length > 0) {
        report += "───────────────────────────────────────────────────────────────────\n";
        report += "MISSING CLAUSES\n";
        report += "───────────────────────────────────────────────────────────────────\n\n";
        analysis.missing_clauses.forEach((clause, i) => {
            report += `${i + 1}. ${clause}\n`;
        });
        report += "\n";
    }

    if (analysis.suggestions && analysis.suggestions.length > 0) {
        report += "───────────────────────────────────────────────────────────────────\n";
        report += "SUGGESTIONS\n";
        report += "───────────────────────────────────────────────────────────────────\n\n";
        analysis.suggestions.forEach((suggestion, i) => {
            report += `${i + 1}. ${suggestion}\n`;
        });
        report += "\n";
    }

    report += "═══════════════════════════════════════════════════════════════════\n";
    report += "                         END OF REPORT\n";
    report += "═══════════════════════════════════════════════════════════════════\n";

    return report;
}

// ── Download text file ────────────────────────────────────────────────────────

export function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
