import React, { useState, useRef, useCallback, memo, useMemo } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { BlockColumn } from "./BlockColumn";
import type { Row } from "@/store/slices/slidesSlice";
import type { BlockContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME, type Theme } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";
import { InsertionIndicator } from "./InsertionIndicator";
import { IconTrash } from "@tabler/icons-react";

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

interface ContentRowProps {
  row: Row;
  slideId: string;
  rowIndex: number;
  totalRowsInSlide: number;
  isDragging?: boolean;
  enableDragHints?: boolean;
  onUpdateBlock: (blockId: string, content: BlockContent) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  onUpdateColumnWidths: (rowId: string, columnWidths: number[]) => void;
  rowCount: number;
  readOnly?: boolean;
  /** Optional theme prop. If not provided, falls back to Redux store theme */
  theme?: Theme;
}

export const ContentRow = memo(function ContentRow({
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
  readOnly = false,
  theme: themeProp,
}: ContentRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isAnyDragActive, setIsAnyDragActive] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    leftPercent: number;
  } | null>(null);

  const [localWidths, setLocalWidths] = useState<number[]>(() => {
    if (row.columnWidths && row.columnWidths.length === row.blocks.length) {
      return row.columnWidths;
    }
    return row.blocks.map(() => 1);
  });
  
  const latestWidthsRef = useRef<number[]>(localWidths);
  const rowContainerRef = useRef<HTMLDivElement>(null);
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const { setNodeRef, isOver } = useDroppable({
    id: `row-drop-${slideId}-${row.id}`,
    data: {
      type: "row",
      rowId: row.id,
      slideId,
      insertIndex: dropIndicator?.index ?? row.blocks.length,
    },
    disabled: readOnly,
  });

  const MAX_COLUMNS = 3;
  const canAddColumn = row.blocks.length < MAX_COLUMNS;

  React.useEffect(() => {
    if (row.columnWidths && row.columnWidths.length === row.blocks.length) {
      setLocalWidths(row.columnWidths);
      latestWidthsRef.current = row.columnWidths;
    } else if (row.blocks.length !== localWidths.length) {
      const newWidths = row.blocks.map(() => 1);
      setLocalWidths(newWidths);
      latestWidthsRef.current = newWidths;
    }
  }, [row.columnWidths, row.blocks.length, row.blocks, localWidths.length]);

  const gridTemplateColumns = useMemo(
    () => localWidths.map((width) => `${width}fr`).join(" "),
    [localWidths]
  );

  const handleResize = useCallback((index: number, deltaX: number) => {
    if (!rowContainerRef.current) return;

    const containerWidth = rowContainerRef.current.offsetWidth;

    setLocalWidths((prevWidths) => {
      const totalFr = prevWidths.reduce((sum, w) => sum + w, 0);
      const deltaFr = (deltaX / containerWidth) * totalFr;
      const newWidths = [...prevWidths];
      const nextIndex = index + 1;

      if (nextIndex >= newWidths.length) return prevWidths;

      const currentFr = newWidths[index];
      const nextFr = newWidths[nextIndex];
      const minFrPercent = 0.1;
      const minFr = totalFr * minFrPercent;

      const maxIncrease = nextFr - minFr;
      const maxDecrease = currentFr - minFr;

      let actualDelta = deltaFr;
      if (deltaFr > 0) {
        actualDelta = Math.min(deltaFr, maxIncrease);
      } else if (deltaFr < 0) {
        actualDelta = Math.max(deltaFr, -maxDecrease);
      }

      const newCurrentFr = currentFr + actualDelta;
      const newNextFr = nextFr - actualDelta;

      if (newCurrentFr >= minFr && newNextFr >= minFr) {
        newWidths[index] = newCurrentFr;
        newWidths[nextIndex] = newNextFr;
      }

      latestWidthsRef.current = newWidths;
      return newWidths;
    });
  }, []);

  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    onUpdateColumnWidths(row.id, latestWidthsRef.current);
  }, [onUpdateColumnWidths, row.id]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if ((!isOver && !isAnyDragActive) || !rowContainerRef.current) {
        if (!isOver && !isAnyDragActive) setDropIndicator(null);
        return;
      }

      const rect = rowContainerRef.current.getBoundingClientRect();
      if (e.clientY < rect.top - 20 || e.clientY > rect.bottom + 20) {
        setDropIndicator(null);
        return;
      }

      const mouseX = e.clientX;
      const relativeX = mouseX - rect.left;

      const widths = latestWidthsRef.current;
      if (!widths || widths.length === 0) {
        setDropIndicator({ index: 0, leftPercent: 50 });
        return;
      }

      const totalFr = widths.reduce((sum, w) => sum + w, 0);
      let currentLeft = 0;
      const boundaries: number[] = [0];

      widths.forEach((w) => {
        const pxWidth = (w / totalFr) * rect.width;
        currentLeft += pxWidth;
        boundaries.push(currentLeft);
      });

      let closestIndex = 0;
      let minDistance = Infinity;

      boundaries.forEach((boundary, index) => {
        const dist = Math.abs(relativeX - boundary);
        if (dist < minDistance) {
          minDistance = dist;
          closestIndex = index;
        }
      });

      const leftPercent = (boundaries[closestIndex] / rect.width) * 100;

      setDropIndicator({
        index: closestIndex,
        leftPercent: Math.min(100, Math.max(0, leftPercent)),
      });
    },
    [isOver, isAnyDragActive]
  );

  const handleMouseLeave = useCallback(() => {}, []);

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
      {enableDragHints && !readOnly && (
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
      
      {/* Row Menu Handle - Minimal */}
      {!readOnly && (
        <div className="relative flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-4 h-full flex items-center justify-center opacity-0 group-hover/row:opacity-40 hover:opacity-100 transition-all"
            style={{ color: isDark ? "#fff" : "#000" }}
            title="Row options"
            aria-label="Row options menu"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <svg width="3" height="12" viewBox="0 0 3 12" fill="currentColor">
              <circle cx="1.5" cy="1.5" r="1.5" />
              <circle cx="1.5" cy="6" r="1.5" />
              <circle cx="1.5" cy="10.5" r="1.5" />
            </svg>
          </button>

          {/* Dropdown Menu - Minimal */}
          {isMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsMenuOpen(false)}
              />
              <div
                className="absolute left-5 top-0 rounded-xl py-1 z-40 min-w-[100px] overflow-hidden"
                style={{
                  backgroundColor: isDark ? "rgba(30,30,35,0.98)" : "rgba(255,255,255,0.98)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <button
                  onClick={() => {
                    onDeleteRow(row.id);
                    setIsMenuOpen(false);
                  }}
                  disabled={rowCount <= 1}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors disabled:opacity-30"
                  style={{ color: "#ef4444" }}
                  aria-label="Delete row"
                >
                  <IconTrash size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Row Content */}
      <div
        ref={(node) => {
          setNodeRef(node);
          rowContainerRef.current = node;
        }}
        className="group/row flex-1 grid gap-1 transition-all items-stretch rounded-xl relative max-w-full overflow-hidden"
        style={{
          gridTemplateColumns,
          fontFamily: getFontFamily(theme.fontFamily || "Inter"),
          backgroundColor: isOver ? `${theme.primary}08` : "transparent",
        }}
      >
        {row.blocks.map((block, index) => (
          <BlockColumn
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
            readOnly={readOnly}
            theme={theme}
          />
        ))}

        {/* The Blue Drop Indicator Line */}
        {isAnyDragActive && dropIndicator && (
          <InsertionIndicator
            isVisible={true}
            orientation="vertical"
            position={`${dropIndicator.leftPercent}%`}
          />
        )}
      </div>
    </div>
  );
});

