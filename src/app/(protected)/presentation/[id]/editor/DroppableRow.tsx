import React, { useState, useRef, useCallback } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { ResizableColumn } from "./ResizableColumn";
import type { Row } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";
import { DropIndicator } from "./DropIndicator";

// Wrapper to safely use useDndMonitor only when inside DndContext
const DragMonitorBridge: React.FC<{
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragCancel: () => void;
}> = ({ onDragStart, onDragEnd, onDragCancel }) => {
  useDndMonitor({
    onDragStart,
    onDragEnd,
    onDragCancel,
  });
  return null;
};

interface DroppableRowProps {
  row: Row;
  slideId: string;
  rowIndex: number;
  totalRowsInSlide: number;
  isDragging?: boolean;
  enableDragHints?: boolean;
  onUpdateBlock: (blockId: string, content: any) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  onUpdateColumnWidths: (rowId: string, columnWidths: number[]) => void;
  rowCount: number;
}

export const DroppableRow: React.FC<DroppableRowProps> = ({
  row,
  slideId,
  rowIndex,
  totalRowsInSlide,
  isDragging = false,
  enableDragHints = true,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onUpdateColumnWidths,
  rowCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isAnyDragActive, setIsAnyDragActive] = useState(false);

  // New state for manual drop indicators
  // We'll track where the user wants to drop: { index: number }
  // index 0 = before first block
  // index 1 = after first block (between 1 and 2)
  // ...
  // index N = after last block
  const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    leftPercent: number;
  } | null>(null);

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

  // Use unique ID for this row's drop zone to distinguish it
  const { setNodeRef, isOver } = useDroppable({
    id: `row-drop-${slideId}-${row.id}`,
    data: {
      type: "row",
      rowId: row.id,
      slideId,
      // Pass the calculated insertion index to the drag event
      insertIndex: dropIndicator?.index ?? row.blocks.length,
    },
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

  // Enhanced mouse move handler to calculate insertion point
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if ((!isOver && !isAnyDragActive) || !rowContainerRef.current) {
        if (!isOver && !isAnyDragActive) setDropIndicator(null);
        return;
      }

      const rect = rowContainerRef.current.getBoundingClientRect();
      // If mouse is just outside but dragging is active (safety buffer), or inside
      // Check if mouse is roughly over this row's vertical area
      if (e.clientY < rect.top - 20 || e.clientY > rect.bottom + 20) {
        setDropIndicator(null);
        return;
      }

      const mouseX = e.clientX;
      const relativeX = mouseX - rect.left;

      const widths = latestWidthsRef.current;
      if (!widths || widths.length === 0) {
        // Empty row case
        setDropIndicator({ index: 0, leftPercent: 50 });
        return;
      }

      // Calculate split points (boundaries between columns) in pixels
      const totalFr = widths.reduce((sum, w) => sum + w, 0);
      let currentLeft = 0;
      const boundaries: number[] = [0]; // Include start edge

      widths.forEach((w) => {
        const pxWidth = (w / totalFr) * rect.width;
        currentLeft += pxWidth;
        boundaries.push(currentLeft);
      });

      // boundaries now has [0, widthCol1, widthCol1+widthCol2, ..., totalWidth]
      // Find the closest boundary to the mouse X
      let closestIndex = 0;
      let minDistance = Infinity;

      boundaries.forEach((boundary, index) => {
        const dist = Math.abs(relativeX - boundary);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = index;
        }
      });

      // Calculate percent position for the indicator
      const leftPercent = (boundaries[closestIndex] / rect.width) * 100;

      // Only allow adding new columns if not full, or if we are just rearranging existing ones within limits
      // But for drop indicator visualization, we show it anyway, and the logic in onDragEnd will decide valid/invalid
      // Actually, we should probably enforce MAX_COLUMNS visually too if it's a new block?
      // For now, let's just show the indicator where the user points.

      setDropIndicator({
        index: closestIndex,
        leftPercent: Math.min(100, Math.max(0, leftPercent)),
      });
    },
    [isOver, isAnyDragActive]
  );

  const handleMouseLeave = useCallback(() => {
    // Only clear if not dragging anything active (but we track global mouse if dragging)
    // Actually, if we leave boundaries we clear
    // setDropIndicator(null);
  }, []);

  // Track global mouse when dragging to ensure smooth indicator updates even if cursor slips out slightly
  React.useEffect(() => {
    if (!isAnyDragActive) {
      setDropIndicator(null);
      return;
    }

    const onGlobalMove = (e: MouseEvent) => handleMouseMove(e);
    window.addEventListener("mousemove", onGlobalMove);
    return () => window.removeEventListener("mousemove", onGlobalMove);
  }, [isAnyDragActive, handleMouseMove]);

  return (
    <div className="group/row relative flex">
      {enableDragHints && (
        <DragMonitorBridge
          onDragStart={() => setIsAnyDragActive(true)}
          onDragEnd={() => {
            setIsAnyDragActive(false);
            setDropIndicator(null);
          }}
          onDragCancel={() => {
            setIsAnyDragActive(false);
            setDropIndicator(null);
          }}
        />
      )}
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
        className={`group/row flex-1 grid gap-2 transition-all items-stretch rounded-xl relative ${
          isOver || (dropIndicator && isAnyDragActive)
            ? "border border-dashed border-gray-300"
            : "border border-transparent"
        }`}
        style={{
          gridTemplateColumns,
          fontFamily: getFontFamily(theme.fontFamily || "Inter"),
        }}
        onMouseLeave={handleMouseLeave}
      >
        {row.blocks.map((block, index) => (
          <ResizableColumn
            key={block.id}
            block={block}
            slideId={slideId}
            rowId={row.id}
            index={index}
            totalBlocksInRow={row.blocks.length}
            rowIndex={rowIndex}
            totalRowsInSlide={totalRowsInSlide}
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

        {/* The Blue Drop Indicator Line */}
        {isAnyDragActive && dropIndicator && (
          <DropIndicator
            isVisible={true}
            orientation="vertical"
            position={`${dropIndicator.leftPercent}%`}
          />
        )}
      </div>
    </div>
  );
};
