import React, { useState, useRef, useCallback, memo, useMemo } from "react";
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

  // Calculate equal width columns
  const gridTemplateColumns = useMemo(
    () => `repeat(${row.blocks.length}, 1fr)`,
    [row.blocks.length]
  );

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

      const blockCount = row.blocks.length;
      if (blockCount === 0) {
        setDropIndicator({ index: 0, leftPercent: 50 });
        return;
      }

      // Calculate equal-width boundaries
      const boundaries: number[] = [];
      for (let i = 0; i <= blockCount; i++) {
        boundaries.push((i / blockCount) * rect.width);
      }

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
    [isOver, isAnyDragActive, row.blocks.length]
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

            // If row already has 3 blocks (MAX_COLUMNS), create a new row below
            if (row.blocks.length >= MAX_COLUMNS) {
              // We need to use the Redux action to add a new row with the same block type
              // Import and dispatch addRowWithColumnsAtIndex
              // For now, use onAddColumn which will trigger the existing logic
              onAddColumn(row.id, lastBlock.id);
            } else {
              // Row has space, add to current row
              onAddColumn(row.id, lastBlock.id);
            }
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

