/**
 * FoldPDF - Client-Side PDF Processing Engine
 * 
 * All PDF processing happens entirely in the browser using pdf-lib.
 * No files are ever uploaded to a server. This ensures complete privacy.
 * 
 * Capabilities:
 * - Split a PDF into individual pages
 * - Merge multiple PDFs into a single document
 * - Reorder pages from one or more PDFs
 * - Generate page thumbnails (rendered via canvas)
 */

import { PDFDocument } from "pdf-lib";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PdfPageInfo {
  /** Unique identifier for drag-and-drop reordering */
  id: string;
  /** Index of the page within its source PDF (0-based) */
  pageIndex: number;
  /** Display label, e.g. "document.pdf - Page 3" */
  label: string;
  /** Original file name */
  sourceFileName: string;
  /** Raw bytes of the source PDF (shared reference) */
  sourceBytes: Uint8Array;
  /** Page width in points */
  width: number;
  /** Page height in points */
  height: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Read a File object into a Uint8Array */
export async function fileToBytes(file: File): Promise<Uint8Array> {
  const buffer = await file.arrayBuffer();
  return new Uint8Array(buffer);
}

/** Load a PDF and return page metadata */
export async function loadPdf(
  file: File
): Promise<{ pages: PdfPageInfo[]; pageCount: number }> {
  const bytes = await fileToBytes(file);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();
  const pages: PdfPageInfo[] = [];

  for (let i = 0; i < pageCount; i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    pages.push({
      id: `${file.name}-${i}-${Date.now()}`,
      pageIndex: i,
      label: `${file.name} - Page ${i + 1}`,
      sourceFileName: file.name,
      sourceBytes: bytes,
      width,
      height,
    });
  }

  return { pages, pageCount };
}

/** Split: create individual single-page PDFs from selected pages */
export async function splitPages(
  pages: PdfPageInfo[]
): Promise<{ fileName: string; bytes: Uint8Array }[]> {
  const results: { fileName: string; bytes: Uint8Array }[] = [];

  for (const page of pages) {
    const srcDoc = await PDFDocument.load(page.sourceBytes, {
      ignoreEncryption: true,
    });
    const newDoc = await PDFDocument.create();
    const [copiedPage] = await newDoc.copyPages(srcDoc, [page.pageIndex]);
    newDoc.addPage(copiedPage);
    const pdfBytes = await newDoc.save();
    const baseName = page.sourceFileName.replace(/\.pdf$/i, "");
    results.push({
      fileName: `${baseName}_page${page.pageIndex + 1}.pdf`,
      bytes: pdfBytes,
    });
  }

  return results;
}

/** Merge: combine pages (in current order) into a single PDF */
export async function mergePages(pages: PdfPageInfo[]): Promise<Uint8Array> {
  const newDoc = await PDFDocument.create();

  // Group pages by source to minimize repeated loads
  const sourceCache = new Map<Uint8Array, PDFDocument>();

  for (const page of pages) {
    let srcDoc = sourceCache.get(page.sourceBytes);
    if (!srcDoc) {
      srcDoc = await PDFDocument.load(page.sourceBytes, {
        ignoreEncryption: true,
      });
      sourceCache.set(page.sourceBytes, srcDoc);
    }
    const [copiedPage] = await newDoc.copyPages(srcDoc, [page.pageIndex]);
    newDoc.addPage(copiedPage);
  }

  return newDoc.save();
}

/** Trigger a browser download for the given bytes */
export function downloadBlob(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  // Cleanup: revoke object URL and remove element
  setTimeout(() => {
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}

/** Download multiple files as individual downloads */
export function downloadMultiple(
  files: { fileName: string; bytes: Uint8Array }[]
) {
  files.forEach((file, index) => {
    setTimeout(() => {
      downloadBlob(file.bytes, file.fileName);
    }, index * 200); // Stagger downloads to avoid browser blocking
  });
}
