import React, { useState, useRef, useCallback, useEffect, memo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BlockContainer } from "../block/BlockContainer";
import type { Block, BlockContent } from "@/types/presentation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME, deleteBlock, type Theme } from "@/store/slices/slidesSlice";
import { IconGripHorizontal } from "@tabler/icons-react";
import { useBlockFocus } from "../block/BlockSelectionContext";

interface BlockColumnProps {
  block: Block;
  slideId: string;
  rowId: string;
  index: number;
  totalBlocksInRow: number;
  rowIndex: number;
  totalRowsInSlide: number;
  onUpdate: (blockId: string, content: BlockContent) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  isLastBlock: boolean;
  canAddColumn: boolean;
  readOnly?: boolean;
  /** Optional theme prop. If not provided, falls back to Redux store theme */
  theme?: Theme;
}

export const BlockColumn = memo(function BlockColumn({
  block,
  slideId,
  rowId,
  index,
  totalBlocksInRow,
  rowIndex,
  totalRowsInSlide,
  onUpdate,
  onAddColumn,
  isLastBlock,
  canAddColumn,
  readOnly = false,
  theme: themeProp,
}: BlockColumnProps) {
  const [isHovered, setIsHovered] = useState(false);
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const dispatch = useAppDispatch();
  const { setFocusedBlock } = useBlockFocus();
  const handleStartRef = useRef<{ x: number; y: number } | null>(null);
  const wasDraggingRef = useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `${slideId}-${block.id}`,
    data: { type: "block", block, slideId, rowId, index },
    disabled: readOnly,
  });

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 200 : undefined,
  };


  return (
    <div
      ref={!readOnly ? setNodeRef : undefined}
      className="group/column relative h-full w-full min-w-0 rounded-xl transition-all"
      style={!readOnly ? dragStyle : {}}
      onMouseEnter={() => !readOnly && setIsHovered(true)}
      onMouseLeave={() => !readOnly && setIsHovered(false)}
    >
      <div className="relative h-full w-full flex flex-col">
        {/* Column Handle - Minimal */}
        {!readOnly && (
          <div
            className={`absolute z-30 transition-all duration-200 ${
              isHovered ? "opacity-100" : "opacity-0 group-hover/column:opacity-100"
            }`}
            style={{
              top: "-2px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <div
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-6 h-3 cursor-grab active:cursor-grabbing rounded-full transition-all"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                color: isDark ? "#000" : "#fff",
              }}
              role="button"
              aria-label={`Drag handle for block ${index + 1}`}
              aria-roledescription="Draggable block handle"
              onPointerDown={(e) => {
                handleStartRef.current = { x: e.clientX, y: e.clientY };
                wasDraggingRef.current = false;
                listeners?.onPointerDown?.(e);
              }}
              onPointerMove={() => {
                if (handleStartRef.current) {
                  wasDraggingRef.current = true;
                }
              }}
              onPointerUp={(e) => {
                if (!wasDraggingRef.current && handleStartRef.current) {
                  const dist = Math.sqrt(
                    Math.pow(e.clientX - handleStartRef.current.x, 2) +
                    Math.pow(e.clientY - handleStartRef.current.y, 2)
                  );
                  if (dist < 5) {
                    e.preventDefault();
                    e.stopPropagation();
                    setFocusedBlock(slideId, block.id);
                  }
                }
                handleStartRef.current = null;
              }}
            >
              <IconGripHorizontal size={10} />
            </div>
          </div>
        )}

        <BlockContainer
          block={block}
          slideId={slideId}
          rowId={rowId}
          blockIndex={index}
          totalBlocksInRow={totalBlocksInRow}
          rowIndex={rowIndex}
          totalRowsInSlide={totalRowsInSlide}
          onUpdate={onUpdate}
          isLastBlock={isLastBlock}
          hideDragHandle={true}
          readOnly={readOnly}
          theme={theme}
        />
      </div>
    </div>
  );
});

