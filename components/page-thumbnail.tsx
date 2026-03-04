/**
 * FoldPDF - Page Thumbnail Renderer
 *
 * Uses PDF.js (pdfjs-dist) to render a real canvas preview of a single PDF page.
 * Loaded lazily via dynamic import so the ~4 MB PDF.js bundle is code-split and
 * only fetched when the user has actually uploaded a file.
 *
 * The PDF.js worker is loaded from the CDN (matching the installed package version)
 * so no worker copy / Webpack magic is needed.
 *
 * Props:
 *   sourceBytes  — raw bytes of the source PDF (Uint8Array)
 *   pageIndex    — 0-based page index within that PDF
 *   targetWidth  — canvas output width in CSS pixels (height is auto-scaled)
 */

"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Worker initialisation (run once across component instances) ────────── */
let workerReady = false;

async function ensureWorker() {
  if (workerReady) return;
  const { GlobalWorkerOptions } = await import("pdfjs-dist");
  // Served from /public under the /pdf basePath.
  // ADMIN: if you upgrade pdfjs-dist, run:
  //   cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  GlobalWorkerOptions.workerSrc = `${base}/pdf.worker.min.mjs`;
  workerReady = true;
}

/* ─── Component ──────────────────────────────────────────────────────────── */

interface PageThumbnailProps {
  sourceBytes: Uint8Array;
  pageIndex: number;
  /** Width the canvas will be rendered at (height auto-scales). Default 180. */
  targetWidth?: number;
  className?: string;
}

export function PageThumbnail({
  sourceBytes,
  pageIndex,
  targetWidth = 180,
  className,
}: PageThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        await ensureWorker();

        // Dynamically import getDocument so the bundle is split
        const { getDocument } = await import("pdfjs-dist");

        // We deliberately copy the bytes so each PDF.js task owns its buffer.
        const dataCopy = new Uint8Array(sourceBytes);
        const loadingTask = getDocument({ data: dataCopy });
        const pdf = await loadingTask.promise;
        if (cancelled) {
          pdf.destroy();
          return;
        }

        // PDF.js pages are 1-indexed
        const page = await pdf.getPage(pageIndex + 1);
        if (cancelled) {
          pdf.destroy();
          return;
        }

        const baseViewport = page.getViewport({ scale: 1 });
        const scale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) {
          pdf.destroy();
          return;
        }

        // Size via attributes (not CSS) to avoid blurry rendering
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          pdf.destroy();
          return;
        }

        // Render the page into the canvas
        await page.render({ canvasContext: ctx, viewport }).promise;

        if (!cancelled) {
          setState("done");
        }

        pdf.destroy();
      } catch (err) {
        console.warn("[PageThumbnail] render error:", err);
        if (!cancelled) setState("error");
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [sourceBytes, pageIndex, targetWidth]);

  /* ── Fallback: error or loading ── */
  if (state === "error") {
    return (
      <div
        className={cn(
          "flex h-full w-full flex-col items-center justify-center",
          className
        )}
      >
        <FileText className="h-8 w-8 text-muted-foreground/50" />
        <span className="mt-1 text-[10px] font-medium text-muted-foreground">
          PDF
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Loading placeholder */}
      {state === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/30">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/50" />
        </div>
      )}

      {/* Actual canvas — hidden until rendered so we don't show a blank box */}
      <canvas
        ref={canvasRef}
        className="h-full w-full object-contain"
        style={{ display: state === "done" ? "block" : "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
