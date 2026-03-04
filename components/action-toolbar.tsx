/**
 * FoldPDF - Action Toolbar
 *
 * Split, Merge, Download, and Select All controls.
 * Shows a Pro nudge inline when limits are hit.
 */

"use client";

import {
  Scissors,
  Merge,
  Download,
  CheckSquare,
  Square,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePro } from "@/lib/pro-context";
import { ProNudgeInline, ProActiveBadge } from "@/components/pro-upgrade-card";

interface ActionToolbarProps {
  totalPages: number;
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onSplit: () => void;
  onMerge: () => void;
  onClearAll: () => void;
  isProcessing: boolean;
  pageLimit: boolean;
  fileLimit: boolean;
}

export function ActionToolbar({
  totalPages,
  selectedCount,
  allSelected,
  onSelectAll,
  onDeselectAll,
  onSplit,
  onMerge,
  onClearAll,
  isProcessing,
  pageLimit,
  fileLimit,
}: ActionToolbarProps) {
  const { isPro, canReorder } = usePro();

  if (totalPages === 0) return null;

  const limitHit = pageLimit || fileLimit;
  const nudgeReason = pageLimit
    ? "Page limit reached -- upgrade to Pro"
    : fileLimit
      ? "File limit reached -- upgrade to Pro"
      : undefined;

  return (
    <div className="flex flex-col gap-2">
      {/* Main toolbar row */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
        {/* Selection */}
        <Button
          variant="ghost"
          size="sm"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="gap-1.5 text-xs"
        >
          {allSelected ? (
            <Square className="h-3.5 w-3.5" />
          ) : (
            <CheckSquare className="h-3.5 w-3.5" />
          )}
          {allSelected ? "Deselect All" : "Select All"}
        </Button>

        <div className="h-5 w-px bg-border" />

        {/* Split */}
        <Button
          variant="outline"
          size="sm"
          onClick={onSplit}
          disabled={selectedCount === 0 || isProcessing}
          className="gap-1.5 text-xs"
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Scissors className="h-3.5 w-3.5" />
          )}
          Split ({selectedCount})
        </Button>

        {/* Merge */}
        <Button
          size="sm"
          onClick={onMerge}
          disabled={totalPages < 2 || isProcessing}
          className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isProcessing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Merge className="h-3.5 w-3.5" />
          )}
          Merge All ({totalPages})
        </Button>

        {/* Merge Selected */}
        {selectedCount >= 2 && selectedCount < totalPages && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onMerge}
            disabled={isProcessing}
            className="gap-1.5 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Merge Selected ({selectedCount})
          </Button>
        )}

        <div className="flex-1" />

        {/* Pro badge when active */}
        <ProActiveBadge />

        {/* Reorder hint for non-pro */}
        {!canReorder && totalPages > 1 && !isPro && (
          <span className="text-[10px] text-muted-foreground">
            Reorder: Pro only
          </span>
        )}

        {/* Clear */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      {/* Inline Pro nudge -- only shows when a limit is hit */}
      {limitHit && <ProNudgeInline reason={nudgeReason} />}
    </div>
  );
}
