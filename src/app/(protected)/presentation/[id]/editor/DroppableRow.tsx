import React, { useState, useRef, useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { ResizableColumn } from "./ResizableColumn";
import type { Row } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";

interface DroppableRowProps {
  row: Row;
  slideId: string;
  onUpdateBlock: (blockId: string, content: any) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  onUpdateColumnWidths: (rowId: string, columnWidths: number[]) => void;
  rowCount: number;
}

export const DroppableRow: React.FC<DroppableRowProps> = ({
  row,
  slideId,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onUpdateColumnWidths,
  rowCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  // Store widths as fractional units (fr) for grid-template-columns
  const [localWidths, setLocalWidths] = useState<number[]>(() => {
    if (row.columnWidths && row.columnWidths.length === row.blocks.length) {
      return row.columnWidths;
    }
    // Default to equal fractional units
    return row.blocks.map(() => 1);
  });
  const latestWidthsRef = useRef<number[]>(localWidths);
  const rowContainerRef = useRef<HTMLDivElement>(null);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const { setNodeRef, isOver } = useDroppable({
    id: `row-drop-${slideId}-${row.id}`,
    data: { type: "row", rowId: row.id, slideId },
  });

  const MAX_COLUMNS = 3;
  const canAddColumn = row.blocks.length < MAX_COLUMNS;

  // Update local widths when row.columnWidths changes externally
  React.useEffect(() => {
    if (row.columnWidths && row.columnWidths.length === row.blocks.length) {
      setLocalWidths(row.columnWidths);
      latestWidthsRef.current = row.columnWidths;
    } else if (row.blocks.length !== localWidths.length) {
      // Recalculate equal widths when block count changes
      const newWidths = row.blocks.map(() => 1);
      setLocalWidths(newWidths);
      latestWidthsRef.current = newWidths;
    }
  }, [row.columnWidths, row.blocks.length, row.blocks, localWidths.length]);

  // Convert fractional units to grid-template-columns string
  const gridTemplateColumns = localWidths
    .map((width) => `${width}fr`)
    .join(" ");

  const handleResize = useCallback((index: number, deltaX: number) => {
    if (!rowContainerRef.current) return;

    const containerWidth = rowContainerRef.current.offsetWidth;

    setLocalWidths((prevWidths) => {
      const totalFr = prevWidths.reduce((sum, w) => sum + w, 0);

      // Convert deltaX to fractional units
      // Each pixel represents (totalFr / containerWidth) fractional units
      const deltaFr = (deltaX / containerWidth) * totalFr;

      const newWidths = [...prevWidths];
      const nextIndex = index + 1;

      if (nextIndex >= newWidths.length) return prevWidths;

      // Calculate new fractional widths
      const currentFr = newWidths[index];
      const nextFr = newWidths[nextIndex];

      // Minimum width constraint (10% of total width per column)
      const minFrPercent = 0.1; // 10%
      const minFr = totalFr * minFrPercent;

      // Calculate constraints
      // When dragging right (deltaFr > 0): increasing current, decreasing next
      // - Current can increase up to: (currentFr + nextFr) - minFr - minFr = currentFr + nextFr - 2*minFr
      //   But simpler: current can't exceed (currentFr + nextFr - minFr) and next can't go below minFr
      // - So max increase = nextFr - minFr (because we're taking from next)
      // When dragging left (deltaFr < 0): decreasing current, increasing next
      // - Current can decrease up to: currentFr - minFr (to keep current above min)
      // - Next can increase up to: (currentFr + nextFr) - minFr - minFr, but simpler: currentFr - minFr (what we take from current)

      const maxIncrease = nextFr - minFr; // Can't take more than what would leave next below min
      const maxDecrease = currentFr - minFr; // Can't give more than what would leave current below min

      // Clamp the delta to valid range
      let actualDelta = deltaFr;
      if (deltaFr > 0) {
        // Dragging right - increasing current column, decreasing next
        actualDelta = Math.min(deltaFr, maxIncrease);
      } else if (deltaFr < 0) {
        // Dragging left - decreasing current column, increasing next
        actualDelta = Math.max(deltaFr, -maxDecrease);
      }

      // Apply the resize
      const newCurrentFr = currentFr + actualDelta;
      const newNextFr = nextFr - actualDelta;

      // Double-check constraints (safety check)
      if (newCurrentFr >= minFr && newNextFr >= minFr) {
        newWidths[index] = newCurrentFr;
        newWidths[nextIndex] = newNextFr;
      }

      // Update ref with latest widths
      latestWidthsRef.current = newWidths;
      return newWidths;
    });
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    // Save the final widths using the ref which always has the latest value
    onUpdateColumnWidths(row.id, latestWidthsRef.current);
  }, [onUpdateColumnWidths, row.id]);

  return (
    <div className="group/row relative flex">
      {/* Row Menu Handle - Left Side */}
      <div className="relative flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-5 h-full flex items-center justify-center text-gray-400 opacity-0 group-hover/row:opacity-100 hover:text-gray-600 transition-all"
          title="Row options"
        >
          <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="2" cy="8" r="1.5" />
            <circle cx="2" cy="14" r="1.5" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute left-6 top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-40 min-w-[120px]">
              <button
                onClick={() => {
                  onDeleteRow(row.id);
                  setIsMenuOpen(false);
                }}
                disabled={rowCount <= 1}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Row Content */}
      <div
        ref={(node) => {
          setNodeRef(node);
          rowContainerRef.current = node;
        }}
        className={`group/row flex-1 grid transition-all items-start border ${
          isOver
            ? "bg-green-50 ring-1 ring-dashed ring-green-400 border-green-400"
            : "border-transparent hover:border-opacity-30"
        }`}
        style={{
          gridTemplateColumns,
          borderColor: isOver ? undefined : "transparent",
          fontFamily: getFontFamily(theme.fontFamily || "Inter"),
        }}
        onMouseEnter={(e) => {
          if (!isOver) {
            e.currentTarget.style.borderColor = theme.primary + "30";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOver) {
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        <SortableContext
          items={row.blocks.map((b) => `${slideId}-${b.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {row.blocks.map((block, index) => (
            <ResizableColumn
              key={block.id}
              block={block}
              slideId={slideId}
              rowId={row.id}
              index={index}
              onUpdate={onUpdateBlock}
              onAddColumn={onAddColumn}
              isLastBlock={index === row.blocks.length - 1}
              canAddColumn={canAddColumn}
              onResize={handleResize}
              isResizing={isResizing}
              onResizeStart={handleResizeStart}
              onResizeEnd={handleResizeEnd}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};
