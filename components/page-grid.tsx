/**
 * FoldPDF - Page Thumbnail Grid
 * 
 * Displays loaded PDF pages as visual cards.
 * Supports drag-and-drop reordering (Pro tier only).
 * Each card shows page info and a remove button.
 */

"use client";

import { useCallback, useState, useRef } from "react";
import { X, GripVertical, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePro } from "@/lib/pro-context";
import type { PdfPageInfo } from "@/lib/pdf-engine";
import { PageThumbnail } from "@/components/page-thumbnail";
import { cn } from "@/lib/utils";

interface PageGridProps {
  pages: PdfPageInfo[];
  onReorder: (pages: PdfPageInfo[]) => void;
  onRemovePage: (id: string) => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function PageGrid({
  pages,
  onReorder,
  onRemovePage,
  selectedIds,
  onToggleSelect,
}: PageGridProps) {
  const { canReorder } = usePro();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragNodeRef = useRef<HTMLDivElement | null>(null);

  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      if (!canReorder) return;
      setDragIndex(index);
      dragNodeRef.current = e.currentTarget as HTMLDivElement;
      e.dataTransfer.effectAllowed = "move";
      // Make the drag image slightly transparent
      if (dragNodeRef.current) {
        dragNodeRef.current.style.opacity = "0.5";
      }
    },
    [canReorder]
  );

  const handleDragEnd = useCallback(() => {
    if (dragNodeRef.current) {
      dragNodeRef.current.style.opacity = "1";
    }
    if (dragIndex !== null && overIndex !== null && dragIndex !== overIndex) {
      const newPages = [...pages];
      const [removed] = newPages.splice(dragIndex, 1);
      newPages.splice(overIndex, 0, removed);
      onReorder(newPages);
    }
    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex, overIndex, pages, onReorder]);

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      if (!canReorder) return;
      e.dataTransfer.dropEffect = "move";
      setOverIndex(index);
    },
    [canReorder]
  );

  if (pages.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">
          Pages ({pages.length})
        </h2>
        {!canReorder && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Reorder with Pro</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {pages.map((page, index) => {
          const isSelected = selectedIds.has(page.id);
          const isDragging = dragIndex === index;
          const isOver = overIndex === index && dragIndex !== index;

          return (
            <div
              key={page.id}
              draggable={canReorder}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onClick={() => onToggleSelect(page.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggleSelect(page.id);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`${page.label}${isSelected ? " (selected)" : ""}`}
              aria-pressed={isSelected}
              className={cn(
                "group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border transition-all",
                isSelected
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border bg-card hover:border-primary/40",
                isDragging && "opacity-50",
                isOver && "border-primary ring-2 ring-primary/30"
              )}
            >
              {/* Page preview — rendered via PDF.js canvas */}
              <div className="flex aspect-[3/4] items-center justify-center overflow-hidden bg-muted/30 p-1.5">
                <PageThumbnail
                  sourceBytes={page.sourceBytes}
                  pageIndex={page.pageIndex}
                  targetWidth={160}
                  className="rounded-sm shadow-sm"
                />
              </div>

              {/* Page info footer */}
              <div className="flex items-center gap-1.5 border-t border-border px-2 py-1.5">
                {canReorder && (
                  <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60 cursor-grab" />
                )}
                <span className="flex-1 truncate text-[11px] font-medium text-foreground">
                  Page {page.pageIndex + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePage(page.id);
                  }}
                  aria-label={`Remove ${page.label}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Selection badge */}
              {isSelected && (
                <Badge className="absolute right-1.5 top-1.5 bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                  Selected
                </Badge>
              )}

              {/* File name tooltip */}
              <span className="sr-only">{page.sourceFileName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
