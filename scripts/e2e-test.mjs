/**
 * FoldPDF - PDF Engine E2E Test
 * Run with: node scripts/e2e-test.mjs
 *
 * Creates two in-memory test PDFs, then exercises merge, split, and reorder
 * using the same pdf-lib calls the browser engine makes.
 */

import { PDFDocument } from "../node_modules/pdf-lib/cjs/index.js";
import { writeFileSync } from "fs";

let passed = 0;
let failed = 0;

function assert(label, got, expected) {
  if (got === expected) {
    console.log(`  ✅  ${label}: got ${got}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}: expected ${expected}, got ${got}`);
    failed++;
  }
}

async function makePdf(pageCount, label) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.addPage([600, 800]);
    page.drawText(`${label} – Page ${i + 1}`, { x: 50, y: 740, size: 22 });
  }
  return new Uint8Array(await doc.save());
}

async function run() {
  console.log("\n── FoldPDF Engine E2E Tests ──────────────────────────\n");

  // ── Setup: create two test PDFs ──────────────────────────────────────────
  console.log("Setting up test PDFs…");
  const pdf1Bytes = await makePdf(3, "Test PDF 1");
  const pdf2Bytes = await makePdf(2, "Test PDF 2");

  const v1 = await PDFDocument.load(pdf1Bytes);
  const v2 = await PDFDocument.load(pdf2Bytes);
  assert("PDF 1 page count", v1.getPageCount(), 3);
  assert("PDF 2 page count", v2.getPageCount(), 2);

  // ── Test: Merge ───────────────────────────────────────────────────────────
  console.log("\nMerge test (5 total pages)…");
  const mergedDoc = await PDFDocument.create();
  for (const [bytes, n] of [[pdf1Bytes, 3], [pdf2Bytes, 2]]) {
    const src = await PDFDocument.load(bytes);
    const pages = await mergedDoc.copyPages(src, [...Array(n).keys()]);
    pages.forEach((p) => mergedDoc.addPage(p));
  }
  const mergedBytes = await mergedDoc.save();
  writeFileSync("/tmp/foldpdf_merged.pdf", mergedBytes);
  const mergedCheck = await PDFDocument.load(mergedBytes);
  assert("Merge: page count", mergedCheck.getPageCount(), 5);

  // ── Test: Split (extract single page) ────────────────────────────────────
  console.log("\nSplit test (extract page 2 from PDF 1)…");
  const splitDoc = await PDFDocument.create();
  const splitSrc = await PDFDocument.load(pdf1Bytes);
  const [splitPage] = await splitDoc.copyPages(splitSrc, [1]); // page 2 (0-indexed)
  splitDoc.addPage(splitPage);
  const splitBytes = await splitDoc.save();
  writeFileSync("/tmp/foldpdf_split.pdf", splitBytes);
  const splitCheck = await PDFDocument.load(splitBytes);
  assert("Split: page count", splitCheck.getPageCount(), 1);

  // ── Test: Split all pages individually ───────────────────────────────────
  console.log("\nSplit-all test (each page of merged into separate files)…");
  const splitAllSrc = await PDFDocument.load(mergedBytes);
  let splitAllOk = true;
  for (let i = 0; i < 5; i++) {
    const d = await PDFDocument.create();
    const [pg] = await d.copyPages(splitAllSrc, [i]);
    d.addPage(pg);
    const b = await d.save();
    const check = await PDFDocument.load(b);
    if (check.getPageCount() !== 1) splitAllOk = false;
  }
  assert("Split-all: every page extracted correctly", splitAllOk ? 1 : 0, 1);

  // ── Test: Reorder (reverse page order) ───────────────────────────────────
  console.log("\nReorder test (reverse 5 pages)…");
  const reorderDoc = await PDFDocument.create();
  const reorderSrc = await PDFDocument.load(mergedBytes);
  const total = reorderSrc.getPageCount();
  const reversedPages = await reorderDoc.copyPages(
    reorderSrc,
    [...Array(total).keys()].reverse()
  );
  reversedPages.forEach((p) => reorderDoc.addPage(p));
  const reorderBytes = await reorderDoc.save();
  writeFileSync("/tmp/foldpdf_reordered.pdf", reorderBytes);
  const reorderCheck = await PDFDocument.load(reorderBytes);
  assert("Reorder: page count preserved", reorderCheck.getPageCount(), 5);

  // Verify text on first page of reversed doc is now "Test PDF 2 – Page 2"
  // (just confirm it's a valid page; text verification requires PDF.js)
  const firstPageSize = reorderCheck.getPage(0).getSize();
  assert("Reorder: first page has valid dimensions", firstPageSize.width > 0 ? 1 : 0, 1);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n───────────────────────────────────────────────────────");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) {
    console.log("All tests passed ✅  Output PDFs written to /tmp/\n");
  } else {
    console.error("Some tests failed ❌\n");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
