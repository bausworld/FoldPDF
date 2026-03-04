/**
 * FoldPDF - Conversion Success Modal
 *
 * Shown after a split or merge completes successfully.
 * Confirms what was downloaded and gives the user clear next steps.
 */

"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download, RotateCcw, Plus } from "lucide-react";

export type ConversionResult =
  | { type: "split"; fileCount: number; pageCount: number }
  | { type: "merge"; pageCount: number; fileName: string };

interface SuccessModalProps {
  result: ConversionResult | null;
  onClose: () => void;
  onStartAgain: () => void;
}

export function SuccessModal({ result, onClose, onStartAgain }: SuccessModalProps) {
  if (!result) return null;

  const isSplit = result.type === "split";

  const headline = isSplit
    ? `Split into ${result.fileCount} PDF${result.fileCount > 1 ? "s" : ""}`
    : `Merged into 1 PDF`;

  const detail = isSplit
    ? `${result.pageCount} page${result.pageCount > 1 ? "s" : ""} extracted and downloaded as individual files.`
    : `${(result as { type: "merge"; pageCount: number; fileName: string }).pageCount} pages combined and saved as "${(result as { type: "merge"; pageCount: number; fileName: string }).fileName}".`;

  return (
    <Dialog open={!!result} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        {/* Success icon */}
        <div className="flex flex-col items-center gap-4 pb-2 pt-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 ring-4 ring-green-500/20">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>

          <DialogHeader className="items-center gap-1">
            <DialogTitle className="text-2xl font-bold">{headline}</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground text-pretty">
              {detail}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Download confirmation pill */}
        <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground">
          <Download className="h-4 w-4 shrink-0 text-green-500" />
          <span>
            {isSplit
              ? `${result.fileCount} file${result.fileCount > 1 ? "s" : ""} downloading to your device`
              : "File downloading to your device"}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            className="flex-1 gap-2"
            variant="outline"
            onClick={onClose}
          >
            <Plus className="h-4 w-4" />
            Keep Working
          </Button>
          <Button
            className="flex-1 gap-2"
            onClick={() => {
              onStartAgain();
              onClose();
            }}
          >
            <RotateCcw className="h-4 w-4" />
            Start Again
          </Button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Your files were processed entirely in your browser and are not stored anywhere.
        </p>
      </DialogContent>
    </Dialog>
  );
}
