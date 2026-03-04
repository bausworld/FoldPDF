/**
 * FoldPDF - Drag & Drop PDF Upload Zone
 * 
 * Handles file selection via drag-and-drop or click-to-browse.
 * Enforces free-tier limits (max files / max pages).
 * Accepts only .pdf files.
 */

"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, FileUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePro } from "@/lib/pro-context";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  currentFileCount: number;
  currentPageCount: number;
  isLoading: boolean;
}

export function DropZone({
  onFilesSelected,
  currentFileCount,
  currentPageCount,
  isLoading,
}: DropZoneProps) {
  const { maxFiles, maxPages } = usePro();
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback(
    (files: File[]): File[] | null => {
      const pdfFiles = files.filter(
        (f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
      );

      if (pdfFiles.length === 0) {
        setError("Please select PDF files only.");
        return null;
      }

      if (currentFileCount + pdfFiles.length > maxFiles) {
        setError(
          `Free tier allows up to ${maxFiles} files. Upgrade to Pro for unlimited.`
        );
        return null;
      }

      setError(null);
      return pdfFiles;
    },
    [currentFileCount, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (isLoading) return;

      const files = Array.from(e.dataTransfer.files);
      const valid = validateFiles(files);
      if (valid) onFilesSelected(valid);
    },
    [validateFiles, onFilesSelected, isLoading]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || isLoading) return;
      const files = Array.from(e.target.files);
      const valid = validateFiles(files);
      if (valid) onFilesSelected(valid);
      // Reset input so re-selecting the same file works
      e.target.value = "";
    },
    [validateFiles, onFilesSelected, isLoading]
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload PDF files by dropping them here or clicking to browse"
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all md:p-12",
          isDragOver
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-dropzone-border bg-dropzone hover:border-primary/60 hover:bg-primary/5",
          isLoading && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          {isDragOver ? (
            <FileUp className="h-7 w-7 text-primary" />
          ) : (
            <Upload className="h-7 w-7 text-primary" />
          )}
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">
            {isDragOver ? "Drop your PDFs here" : "Drag & drop your PDFs here"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            or click to browse files
          </p>
        </div>
        <Button variant="outline" size="sm" className="pointer-events-none">
          Choose Files
        </Button>
        <p className="text-xs text-muted-foreground">
          {maxFiles === Infinity
            ? "Unlimited files and pages (Pro)"
            : `Free: up to ${maxFiles} files, ${maxPages} pages`}
          {currentFileCount > 0 &&
            ` | ${currentFileCount} file${currentFileCount > 1 ? "s" : ""}, ${currentPageCount} page${currentPageCount > 1 ? "s" : ""} loaded`}
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        onChange={handleFileInput}
        className="sr-only"
        aria-hidden="true"
      />
    </div>
  );
}
