import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRelativeTime, formatFileSize } from "./timeUtils";

// ── Shared formatting ────────────────────────────────────────────────────────
const BRAND_COLOR = [224, 195, 154]; // #E0C39A (Champagne)
const DARK_BG = [5, 5, 5];          // #050505 (Absolute Black)
const LIGHT_TEXT = [255, 255, 255]; // #FFFFFF
const MUTED_TEXT = [136, 136, 136]; // #888888

export async function downloadPdfReport(entry) {
  const { file, analysis, timestamp } = entry;
  const date = new Date(timestamp).toLocaleString();
  
  // Initialize PDF document (A4 portrait)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let cursorY = 20;

  // Helper: check page break
  const checkPageBreak = (neededHeight) => {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage();
      cursorY = 20;
    }
  };

  // ── 1. Header ─────────────────────────────────────────────────────────────
  doc.setFillColor(...DARK_BG);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(...BRAND_COLOR);
  doc.setFont("times", "normal");
  doc.setFontSize(28);
  doc.text("VeriLex", 20, 22);

  doc.setTextColor(...MUTED_TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("LEGAL INTELLIGENCE REPORT", 20, 30);

  // Logo icon (simulated)
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - 30, 15, 12, 15, 2, 2);
  doc.line(pageWidth - 27, 20, pageWidth - 21, 20);
  doc.line(pageWidth - 27, 24, pageWidth - 21, 24);

  cursorY = 55;

  // ── 2. Document Information ───────────────────────────────────────────────
  doc.setTextColor(20, 20, 20);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  
  const titleLines = doc.splitTextToSize(file.originalName, pageWidth - 40);
  doc.text(titleLines, 20, cursorY);
  cursorY += titleLines.length * 6 + 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  
  const infoData = [
    ["File Size:", formatFileSize(file.sizeBytes)],
    ["Analyzed:", date],
    ["Report ID:", entry.id]
  ];

  autoTable(doc, {
    startY: cursorY,
    margin: { left: 20 },
    body: infoData,
    theme: "plain",
    styles: { cellPadding: 1, fontSize: 10, textColor: [100, 100, 100] },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 30 } }
  });

  cursorY = doc.lastAutoTable.finalY + 15;

  // ── 3. Executive Summary ──────────────────────────────────────────────────
  checkPageBreak(30);
  doc.setTextColor(...DARK_BG);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("EXECUTIVE SUMMARY", 20, cursorY);
  
  doc.setDrawColor(...BRAND_COLOR);
  doc.setLineWidth(0.5);
  doc.line(20, cursorY + 2, pageWidth - 20, cursorY + 2);
  cursorY += 10;

  doc.setTextColor(40, 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryLines = doc.splitTextToSize(analysis.summary || "No summary available.", pageWidth - 40);
  doc.text(summaryLines, 20, cursorY);
  cursorY += summaryLines.length * 5 + 15;

  // ── 4. Key Obligations ────────────────────────────────────────────────────
  if (analysis.key_obligations && analysis.key_obligations.length > 0) {
    checkPageBreak(30);
    doc.setTextColor(...DARK_BG);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("KEY OBLIGATIONS", 20, cursorY);
    
    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(20, cursorY + 2, pageWidth - 20, cursorY + 2);
    cursorY += 10;

    const obligationsData = analysis.key_obligations.map((obs, i) => [`${i + 1}.`, obs]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: 20, right: 20 },
      body: obligationsData,
      theme: "plain",
      styles: { fontSize: 11, textColor: [40, 40, 40], cellPadding: 3 },
      columnStyles: { 0: { cellWidth: 10, fontStyle: "bold" } }
    });

    cursorY = doc.lastAutoTable.finalY + 15;
  }

  // ── 5. Risky Clauses ──────────────────────────────────────────────────────
  if (analysis.risky_clauses && analysis.risky_clauses.length > 0) {
    checkPageBreak(40);
    doc.setTextColor(...DARK_BG); 
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("FLAGGED RISKS & LIABILITIES", 20, cursorY);
    
    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(20, cursorY + 2, pageWidth - 20, cursorY + 2);
    cursorY += 8;

    const riskBody = analysis.risky_clauses.map(clause => [
      clause.risk_level,
      clause.clause,
      clause.reason
    ]);

    autoTable(doc, {
      startY: cursorY,
      margin: { left: 20, right: 20 },
      head: [["Risk Level", "Clause Extract", "AI Risk Analysis"]],
      body: riskBody,
      theme: "grid",
      headStyles: { fillColor: [...DARK_BG], textColor: [...BRAND_COLOR], lineColor: [200, 200, 200] },
      styles: { fontSize: 10, textColor: [40, 40, 40], cellPadding: 4, lineColor: [220, 220, 220] },
      columnStyles: {
        0: { cellWidth: 25, fontStyle: "bold", halign: "center" },
        1: { cellWidth: 70, fontStyle: "italic", font: "times" },
        2: { cellWidth: "auto" }
      },
      didParseCell: function (data) {
        if (data.section === "body" && data.column.index === 0) {
          const level = data.cell.raw;
          if (level === "HIGH") data.cell.styles.textColor = [239, 68, 68];
          else if (level === "MEDIUM") data.cell.styles.textColor = [245, 158, 11];
          else if (level === "LOW") data.cell.styles.textColor = [76, 175, 80];
        }
      }
    });

    cursorY = doc.lastAutoTable.finalY + 15;
  }

  // ── 6. Missing Clauses & Suggestions ──────────────────────────────────────
  if ((analysis.missing_clauses && analysis.missing_clauses.length > 0) || 
      (analysis.suggestions && analysis.suggestions.length > 0)) {
    
    checkPageBreak(40);
    doc.setTextColor(...DARK_BG);
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("RECOMMENDATIONS", 20, cursorY);
    
    doc.setDrawColor(...BRAND_COLOR);
    doc.setLineWidth(0.5);
    doc.line(20, cursorY + 2, pageWidth - 20, cursorY + 2);
    cursorY += 10;

    if (analysis.missing_clauses && analysis.missing_clauses.length > 0) {
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text("Standard Clauses Missing:", 20, cursorY);
      cursorY += 5;

      const missingData = analysis.missing_clauses.map(m => ["•", m]);
      autoTable(doc, {
        startY: cursorY,
        margin: { left: 22, right: 20 },
        body: missingData,
        theme: "plain",
        styles: { fontSize: 10, textColor: [80, 80, 80], cellPadding: 1 },
        columnStyles: { 0: { cellWidth: 5 } }
      });
      cursorY = doc.lastAutoTable.finalY + 10;
    }

    if (analysis.suggestions && analysis.suggestions.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(40, 40, 40);
      doc.text("Actionable Suggestions:", 20, cursorY);
      cursorY += 5;

      const suggestionsData = analysis.suggestions.map((s, i) => [`${i + 1}.`, s]);
      autoTable(doc, {
        startY: cursorY,
        margin: { left: 22, right: 20 },
        body: suggestionsData,
        theme: "plain",
        styles: { fontSize: 10, textColor: [80, 80, 80], cellPadding: 2 },
        columnStyles: { 0: { cellWidth: 6, fontStyle: "bold" } }
      });
    }
  }

  // ── 7. Footer & Page Numbers ──────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    
    // Line
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15);
    
    // Text
    doc.text(`VeriLex AI Analysis Report · Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 10);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 10, { align: "right" });
  }

  // ── Download ──────────────────────────────────────────────────────────────
  const filename = `${file.originalName.replace(/\.pdf$/i, "")}_VeriLex_Report.pdf`;
  doc.save(filename);
}

// ── Legacy text download for backwards compatibility if needed ──────────────
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
