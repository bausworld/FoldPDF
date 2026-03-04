/**
 * FoldPDF - Real-File E2E Test
 * Tests merge, split, split-all, and reorder against the 5 real PDFs.
 */

import { PDFDocument } from "../node_modules/pdf-lib/cjs/index.js";
import { readFileSync, writeFileSync, existsSync } from "fs";

const FILES = [
    "/Users/chadaust/Desktop/PDF/sample-1.pdf",
    "/Users/chadaust/Desktop/PDF/sample-2.pdf",
    "/Users/chadaust/Desktop/PDF/sample-3.pdf",
    "/Users/chadaust/Desktop/PDF/sample-4.pdf",
    "/Users/chadaust/Desktop/PDF/sample-5.pdf",
];

let passed = 0;
let failed = 0;

function assert(label, got, expected) {
    if (got === expected) {
        console.log(`  ✅  ${label}: ${got}`);
        passed++;
    } else {
        console.error(`  ❌  ${label}: expected ${expected}, got ${got}`);
        failed++;
    }
}

function assertGt(label, got, min) {
    if (got > min) {
        console.log(`  ✅  ${label}: ${got} (> ${min})`);
        passed++;
    } else {
        console.error(`  ❌  ${label}: expected > ${min}, got ${got}`);
        failed++;
    }
}

async function run() {
    console.log("\n── FoldPDF Real-File E2E Tests ─────────────────────────\n");

    // ── 1. Load all 5 PDFs ───────────────────────────────────────────────────
    console.log("Loading real PDFs…");
    const docs = [];
    for (const path of FILES) {
        if (!existsSync(path)) {
            console.error(`  ❌  File not found: ${path}`);
            process.exit(1);
        }
        const bytes = new Uint8Array(readFileSync(path));
        const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const pages = doc.getPageCount();
        const name = path.split("/").pop();
        console.log(`  📄  ${name}: ${pages} page${pages > 1 ? "s" : ""}`);
        docs.push({ name, bytes, pages });
    }

    const totalPages = docs.reduce((sum, d) => sum + d.pages, 0);
    console.log(`\n  Total pages across all files: ${totalPages}`);
    assertGt("All files loaded with pages", totalPages, 0);

    // ── 2. Merge all 5 into one PDF ──────────────────────────────────────────
    console.log("\nMerge test (all 5 PDFs → 1 file)…");
    const mergedDoc = await PDFDocument.create();
    for (const { bytes, pages }
        of docs) {
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const copied = await mergedDoc.copyPages(src, [...Array(pages).keys()]);
        copied.forEach((p) => mergedDoc.addPage(p));
    }
    const mergedBytes = await mergedDoc.save();
    writeFileSync("/tmp/foldpdf_real_merged.pdf", mergedBytes);
    const mergedCount = (await PDFDocument.load(mergedBytes)).getPageCount();
    assert("Merge: output page count equals sum of all inputs", mergedCount, totalPages);

    // ── 3. Split first file into individual pages ────────────────────────────
    console.log(`\nSplit test (${docs[0].name} → individual pages)…`);
    const splitSrc = await PDFDocument.load(docs[0].bytes, { ignoreEncryption: true });
    let splitAllOk = true;
    for (let i = 0; i < docs[0].pages; i++) {
        const d = await PDFDocument.create();
        const [pg] = await d.copyPages(splitSrc, [i]);
        d.addPage(pg);
        const b = await d.save();
        writeFileSync(`/tmp/foldpdf_real_split_page${i + 1}.pdf`, b);
        const check = await PDFDocument.load(b);
        if (check.getPageCount() !== 1) splitAllOk = false;
    }
    assert(
        `Split: all ${docs[0].pages} pages extracted as 1-page PDFs`,
        splitAllOk ? docs[0].pages : -1,
        docs[0].pages
    );

    // ── 4. Merge only selected pages (first page of each file) ──────────────
    console.log("\nPartial merge test (page 1 from each of the 5 files)…");
    const partialDoc = await PDFDocument.create();
    for (const { bytes }
        of docs) {
        const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const [pg] = await partialDoc.copyPages(src, [0]);
        partialDoc.addPage(pg);
    }
    const partialBytes = await partialDoc.save();
    writeFileSync("/tmp/foldpdf_real_partial.pdf", partialBytes);
    const partialCount = (await PDFDocument.load(partialBytes)).getPageCount();
    assert("Partial merge: exactly 5 pages (one from each file)", partialCount, 5);

    // ── 5. Reorder (reverse the full merged PDF) ─────────────────────────────
    console.log("\nReorder test (reverse page order of merged PDF)…");
    const roDoc = await PDFDocument.create();
    const roSrc = await PDFDocument.load(mergedBytes, { ignoreEncryption: true });
    const n = roSrc.getPageCount();
    const reversed = await roDoc.copyPages(roSrc, [...Array(n).keys()].reverse());
    reversed.forEach((p) => roDoc.addPage(p));
    const roBytes = await roDoc.save();
    writeFileSync("/tmp/foldpdf_real_reordered.pdf", roBytes);
    const roCount = (await PDFDocument.load(roBytes)).getPageCount();
    assert("Reorder: page count preserved after reversal", roCount, totalPages);

    // ── 6. Validate page dimensions are non-zero in all outputs ─────────────
    console.log("\nDimension sanity check (all output PDFs)…");
    for (const [label, path] of[
            ["merged", "/tmp/foldpdf_real_merged.pdf"], ["partial", "/tmp/foldpdf_real_partial.pdf"], ["reordered", "/tmp/foldpdf_real_reordered.pdf"],
        ]) {
        const doc = await PDFDocument.load(new Uint8Array(readFileSync(path)));
        const { width, height } = doc.getPage(0).getSize();
        assertGt(`${label}: page width > 0`, width, 0);
        assertGt(`${label}: page height > 0`, height, 0);
    }

    // ── Summary ──────────────────────────────────────────────────────────────
    console.log("\n────────────────────────────────────────────────────────");
    console.log(`Results: ${passed} passed, ${failed} failed`);

    if (failed === 0) {
        console.log("\nAll tests passed ✅");
        console.log("\nOutput files written to /tmp/:");
        console.log("  foldpdf_real_merged.pdf   — all 5 PDFs combined");
        console.log("  foldpdf_real_partial.pdf  — page 1 from each of the 5 files");
        console.log("  foldpdf_real_reordered.pdf — full merge in reverse page order");
        console.log(`  foldpdf_real_split_page1..${docs[0].pages}.pdf — individual pages from ${docs[0].name}\n`);
    } else {
        console.error("\nSome tests failed ❌\n");
        process.exit(1);
    }
}

run().catch((err) => {
    console.error("Unexpected error:", err.message);
    process.exit(1);
});