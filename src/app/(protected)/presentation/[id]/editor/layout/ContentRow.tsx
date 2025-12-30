import React, { useState, useRef, useCallback, memo, useMemo, useEffect } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { BlockColumn } from "./BlockColumn";
import type { Row } from "@/store/slices/slidesSlice";
import type { BlockContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME, type Theme } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";
import { InsertionIndicator } from "./InsertionIndicator";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { getBlockTypeLabel } from "../utils/blockTypeUtils";

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
  const [isAnyDragActive, setIsAnyDragActive] = useState(false);
  const [dropIndicator, setDropIndicator] = useState<{
    index: number;
    leftPercent: number;
  } | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  
  // Initialize widths
  const [localWidths, setLocalWidths] = useState<number[]>(
    row.columnWidths && row.columnWidths.length === row.blocks.length
      ? row.columnWidths
      : Array(row.blocks.length).fill(1)
  );
  
  // Keep tracks of widths without triggering effects during drag
  const latestWidthsRef = useRef<number[]>(localWidths);

  // Sync state when row blocks change or external updates happen
  useEffect(() => {
    if (!isResizing) {
      const newWidths =
        row.columnWidths && row.columnWidths.length === row.blocks.length
          ? row.columnWidths
          : Array(row.blocks.length).fill(1);
      
      setLocalWidths(newWidths);
      latestWidthsRef.current = newWidths;
    }
  }, [row.columnWidths, row.blocks.length, isResizing]);

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
  const canAddColumn = true; // Still allow calling the action, it handles row splitting

  // Use localWidths for rendering
  const gridTemplateColumns = useMemo(
    () => localWidths.map((w) => `${w}fr`).join(" "),
    [localWidths]
  );
  
  const handleResizeStart = useCallback(() => {
    setIsResizing(true);
  }, []);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    // Commit the final widths to Redux
    if (latestWidthsRef.current) {
      onUpdateColumnWidths(row.id, latestWidthsRef.current);
    }
  }, [onUpdateColumnWidths, row.id]);

  const handleResize = useCallback(
    (index: number, deltaX: number) => {
      if (!rowContainerRef.current) return;
      const containerWidth = rowContainerRef.current.offsetWidth;
      const totalFr = latestWidthsRef.current.reduce((sum, w) => sum + w, 0);
      
      // Convert pixel delta to Fr delta
      const deltaFr = (deltaX / containerWidth) * totalFr;

      // Update the two adjacent columns
      setLocalWidths((prev) => {
        const next = [...prev];
        const leftWidth = next[index];
        const rightWidth = next[index + 1];

        // Limits for min width (e.g. 0.2fr)
        const MIN_WIDTH = 0.2;

        if (leftWidth + deltaFr < MIN_WIDTH) {
           return prev; // Too small
        }
        if (rightWidth - deltaFr < MIN_WIDTH) {
           return prev; // Too small
        }
        
        next[index] = leftWidth + deltaFr;
        next[index + 1] = rightWidth - deltaFr;
        
        latestWidthsRef.current = next;
        return next;
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
      if ((!isOver && !isAnyDragActive) || !rowContainerRef.current || isResizing) {
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

      const blockCount = row.blocks.length;
      if (blockCount === 0) {
        setDropIndicator({ index: 0, leftPercent: 50 });
        return;
      }
      
      // Calculate boundaries based on current widths
      const totalFr = localWidths.reduce((sum, w) => sum + w, 0);
      const boundaries: number[] = [0];
      let currentX = 0;
      
      for (let i = 0; i < blockCount; i++) {
        const widthPercent = localWidths[i] / totalFr;
        currentX += widthPercent * rect.width;
        boundaries.push(currentX);
      }

      // Find closest boundary
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
    [isOver, isAnyDragActive, row.blocks.length, localWidths, isResizing]
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
        className="group/row flex-1 grid gap-1 transition-all items-stretch rounded-xl relative max-w-full"
        style={{
          gridTemplateColumns,
          fontFamily: getFontFamily(theme.fontFamily || "Inter"),
          backgroundColor: isOver ? `${theme.primary}08` : "transparent",
          overflow: "visible",
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
            readOnly={readOnly}
            theme={theme}
            // Resize props
            onResize={handleResize}
            isResizing={isResizing}
            onResizeStart={handleResizeStart}
            onResizeEnd={handleResizeEnd}
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

      {/* Row-level Add Button - Right Side Center */}
      {!readOnly && (
        <button
          onClick={() => {
            const lastBlock = row.blocks[row.blocks.length - 1];
            if (!lastBlock) return;
            onAddColumn(row.id, lastBlock.id);
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-30 opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:scale-110"
          style={{
            backgroundColor: theme.primary,
            color: "#ffffff",
            width: "24px",
            height: "24px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDark 
              ? "0 2px 8px rgba(0,0,0,0.3)" 
              : "0 2px 8px rgba(0,0,0,0.15)",
          }}
          title={
            row.blocks.length > 0
              ? row.blocks.length >= MAX_COLUMNS 
                ? `Add ${getBlockTypeLabel(row.blocks[0].type || 'prosemirror')} (new row)` 
                : `Add ${getBlockTypeLabel(row.blocks[0].type || 'prosemirror')}`
              : "Add block"
          }
        >
          <IconPlus size={14} stroke={2.5} />
        </button>
      )}
    </div>
  );
});
