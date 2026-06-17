import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Verification } from '@/types/database';

export function generateVerificationReport(verification: Verification, orgName: string): Buffer {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('VerifySA', 14, 18);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Document Verification Report', 14, 26);
  doc.text(`Generated: ${new Date().toISOString()}`, pageWidth - 14, 26, { align: 'right' });

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Verification Summary', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const summaryLines = [
    `Organization: ${orgName}`,
    `Document: ${verification.document_name}`,
    `Type: ${verification.document_type}`,
    `Status: ${verification.status}`,
    `Verification ID: ${verification.id}`,
    `Created: ${new Date(verification.created_at).toLocaleString()}`,
  ];
  summaryLines.forEach((line, i) => doc.text(line, 14, 56 + i * 6));

  // Trust Score
  const trustY = 100;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Trust Score', 14, trustY);

  const score = verification.trust_score ?? 0;
  const riskColor =
    verification.risk_level === 'LOW'
      ? [16, 185, 129]
      : verification.risk_level === 'MEDIUM'
        ? [245, 158, 11]
        : [239, 68, 68];

  doc.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.roundedRect(14, trustY + 4, 50, 30, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(`${score}`, 28, trustY + 24);
  doc.setFontSize(10);
  doc.text(`/ 100`, 48, trustY + 24);
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Risk Level: ${verification.risk_level ?? 'N/A'}`, 70, trustY + 16);
  doc.text(`Recommendation: ${verification.recommendation ?? 'N/A'}`, 70, trustY + 24);
  doc.text(`OCR Confidence: ${verification.ocr_confidence ?? 0}%`, 70, trustY + 32);

  // Extracted Fields
  let currentY = trustY + 50;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Extracted Document Fields', 14, currentY);
  currentY += 6;

  const extracted = verification.extracted_data;
  const extractedRows = Object.entries(extracted)
    .filter(([key]) => key !== 'documentType')
    .map(([key, value]) => [
      key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      String(value ?? '—'),
    ]);

  if (extractedRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Field', 'Value']],
      body: extractedRows,
      theme: 'grid',
      headStyles: { fillColor: [6, 182, 212] },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // AI Findings
  if (currentY > 240) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Findings', 14, currentY);
  currentY += 6;

  const findings = verification.ai_findings;
  if (findings?.summary) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitSummary = doc.splitTextToSize(findings.summary, pageWidth - 28);
    doc.text(splitSummary, 14, currentY + 4);
    currentY += splitSummary.length * 5 + 10;
  }

  if (findings?.indicators?.length) {
    const indicatorRows = findings.indicators.map((ind) => [
      ind.type.toUpperCase(),
      ind.text,
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [['Type', 'Finding']],
      body: indicatorRows,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246] },
      margin: { left: 14, right: 14 },
    });
    currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Rule Checks
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Rule Validation Results', 14, currentY);
  currentY += 6;

  if (verification.rule_checks?.length) {
    const ruleRows = verification.rule_checks.map((rule) => [
      rule.rule,
      rule.status.toUpperCase(),
      rule.detail,
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [['Rule', 'Status', 'Detail']],
      body: ruleRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      margin: { left: 14, right: 14 },
      columnStyles: { 2: { cellWidth: 80 } },
    });
    currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  }

  // Audit Trail
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Audit Trail', 14, currentY);
  currentY += 6;

  if (verification.audit_trail?.length) {
    const auditRows = verification.audit_trail.map((entry) => [
      new Date(entry.timestamp).toLocaleString(),
      entry.action,
      entry.actor,
      entry.detail,
    ]);
    autoTable(doc, {
      startY: currentY,
      head: [['Timestamp', 'Action', 'Actor', 'Detail']],
      body: auditRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59] },
      margin: { left: 14, right: 14 },
      columnStyles: { 3: { cellWidth: 70 } },
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `VerifySA Confidential — Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
