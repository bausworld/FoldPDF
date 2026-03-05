/**
 * FoldPDF - Main PDF Tool Component
 *
 * Orchestrates the entire PDF workflow:
 * 1. Upload PDFs via drag-and-drop
 * 2. View pages in a grid
 * 3. Select pages for split/merge
 * 4. Email gate: user must subscribe before first download
 * 5. Reorder pages (Pro only)
 * 6. Download results
 *
 * All processing is 100% client-side using pdf-lib.
 */

"use client";

import { useState, useCallback, useRef } from "react";
import { DropZone } from "@/components/drop-zone";
import { PageGrid } from "@/components/page-grid";
import { ActionToolbar } from "@/components/action-toolbar";
import { PrivacyBanner } from "@/components/privacy-banner";
import { EmailGateDialog } from "@/components/email-gate-dialog";
import { SuccessModal, type ConversionResult } from "@/components/success-modal";
import { usePro } from "@/lib/pro-context";
import {
  loadPdf,
  splitPages,
  mergePages,
  downloadBlob,
  downloadMultiple,
  type PdfPageInfo,
} from "@/lib/pdf-engine";
import { Loader2 } from "lucide-react";

export function PdfTool() {
  const { isPro, maxPages, maxFiles } = usePro();
  const [pages, setPages] = useState<PdfPageInfo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pageLimitHit, setPageLimitHit] = useState(false);
  const [fileLimitHit, setFileLimitHit] = useState(false);
  const [successResult, setSuccessResult] = useState<ConversionResult | null>(null);

  // Email gate state
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [emailGateOpen, setEmailGateOpen] = useState(false);
  const [emailGateAction, setEmailGateAction] = useState<string>("Download");
  const pendingAction = useRef<(() => Promise<void>) | null>(null);

  // --- Gate helper: wrap any action to require email first ---
  const runWithEmailGate = useCallback(
    (action: () => Promise<void>, actionLabel: string) => {
      if (isSubscribed) {
        action();
      } else {
        pendingAction.current = action;
        setEmailGateAction(actionLabel);
        setEmailGateOpen(true);
      }
    },
    [isSubscribed]
  );

  const handleEmailSuccess = useCallback((email: string) => {
    setIsSubscribed(true);
    // Schedule a follow-up email 5 minutes later — free tier only
    if (!isPro) {
      const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
      fetch(`${base}/api/followup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(() => { /* non-critical — ignore errors */ });
    }
    // Run the pending action now that they're subscribed
    if (pendingAction.current) {
      pendingAction.current();
      pendingAction.current = null;
    }
  }, [isPro]);

  // --- File Upload Handler ---

  const handleFilesSelected = useCallback(
    async (files: File[]) => {
      setIsLoading(true);
      setStatusMessage("Loading PDFs...");

      try {
        const newPages: PdfPageInfo[] = [];

        for (const file of files) {
          const result = await loadPdf(file);
          newPages.push(...result.pages);
        }

        const totalPages = pages.length + newPages.length;
        if (totalPages > maxPages) {
          setPageLimitHit(true);
          setStatusMessage(
            `Free tier allows ${maxPages} pages. You tried to load ${totalPages}. Upgrade to Pro for unlimited.`
          );
          setIsLoading(false);
          return;
        }

        const existingFiles = new Set(pages.map((p) => p.sourceFileName));
        files.forEach((f) => existingFiles.add(f.name));
        if (existingFiles.size > maxFiles) {
          setFileLimitHit(true);
          setStatusMessage(
            `Free tier allows ${maxFiles} files. Upgrade to Pro for unlimited.`
          );
          setIsLoading(false);
          return;
        }

        setPages((prev) => [...prev, ...newPages]);
        setStatusMessage(
          `Loaded ${newPages.length} page${newPages.length > 1 ? "s" : ""} from ${files.length} file${files.length > 1 ? "s" : ""}`
        );
      } catch (err) {
        setStatusMessage(
          `Error loading PDF: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      } finally {
        setIsLoading(false);
      }
    },
    [pages.length, maxPages]
  );

  // --- Selection ---

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(pages.map((p) => p.id)));
  }, [pages]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // --- Page Management ---

  const handleReorder = useCallback((newPages: PdfPageInfo[]) => {
    setPages(newPages);
  }, []);

  const handleRemovePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setPages([]);
    setSelectedIds(new Set());
    setStatusMessage(null);
    setPageLimitHit(false);
    setFileLimitHit(false);
  }, []);

  // --- Split Action (gated) ---

  const doSplit = useCallback(async () => {
    const selected = pages.filter((p) => selectedIds.has(p.id));
    if (selected.length === 0) return;

    setIsProcessing(true);
    setStatusMessage("Splitting pages...");

    try {
      const results = await splitPages(selected);
      downloadMultiple(results);
      setSuccessResult({
        type: "split",
        fileCount: results.length,
        pageCount: selected.length,
      });
    } catch (err) {
      setStatusMessage(
        `Split error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  }, [pages, selectedIds]);

  const handleSplit = useCallback(() => {
    runWithEmailGate(doSplit, "Split Pages");
  }, [runWithEmailGate, doSplit]);

  // --- Merge Action (gated) ---

  const doMerge = useCallback(async () => {
    const toMerge =
      selectedIds.size >= 2
        ? pages.filter((p) => selectedIds.has(p.id))
        : pages;

    if (toMerge.length < 2) return;

    setIsProcessing(true);
    setStatusMessage("Merging pages...");

    try {
      const mergedBytes = await mergePages(toMerge);
      const fileName = "FoldPDF_merged.pdf";
      downloadBlob(mergedBytes, fileName);
      setSuccessResult({
        type: "merge",
        pageCount: toMerge.length,
        fileName,
      });
    } catch (err) {
      setStatusMessage(
        `Merge error: ${err instanceof Error ? err.message : "Unknown error"}`
      );
    } finally {
      setIsProcessing(false);
    }
  }, [pages, selectedIds]);

  const handleMerge = useCallback(() => {
    runWithEmailGate(doMerge, "Merge Pages");
  }, [runWithEmailGate, doMerge]);

  // --- Render ---

  const fileCount = new Set(pages.map((p) => p.sourceFileName)).size;

  return (
    <div className="flex flex-col gap-6">
      {/* Privacy Banner */}
      <PrivacyBanner />

      {/* Upload Zone */}
      <DropZone
        onFilesSelected={handleFilesSelected}
        currentFileCount={fileCount}
        currentPageCount={pages.length}
        isLoading={isLoading}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing PDFs...</span>
        </div>
      )}

      {/* Status Message */}
      {statusMessage && !isLoading && (
        <div className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
          {statusMessage}
        </div>
      )}

      {/* Action Toolbar */}
      <ActionToolbar
        totalPages={pages.length}
        selectedCount={selectedIds.size}
        allSelected={pages.length > 0 && selectedIds.size === pages.length}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onSplit={handleSplit}
        onMerge={handleMerge}
        onClearAll={handleClearAll}
        isProcessing={isProcessing}
        pageLimit={pageLimitHit}
        fileLimit={fileLimitHit}
      />

      {/* Page Grid */}
      <PageGrid
        pages={pages}
        onReorder={handleReorder}
        onRemovePage={handleRemovePage}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
      />

      {/* Email Gate Dialog */}
      <EmailGateDialog
        open={emailGateOpen}
        onOpenChange={setEmailGateOpen}
        onSuccess={handleEmailSuccess}
        actionLabel={emailGateAction}
      />

      {/* Conversion Success Modal */}
      <SuccessModal
        result={successResult}
        onClose={() => setSuccessResult(null)}
        onStartAgain={() => {
          setSuccessResult(null);
          handleClearAll();
        }}
      />
    </div>
  );
}
