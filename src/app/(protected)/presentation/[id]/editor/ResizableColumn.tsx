import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DraggableBlock } from "./DraggableBlock";
import type { Block } from "@/lib/editor/types";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface ResizableColumnProps {
  block: Block;
  slideId: string;
  rowId: string;
  index: number;
  onUpdate: (blockId: string, content: any) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  isLastBlock: boolean;
  canAddColumn: boolean;
  onResize: (index: number, deltaX: number) => void;
  isResizing: boolean;
  onResizeStart: () => void;
  onResizeEnd: () => void;
}

export const ResizableColumn: React.FC<ResizableColumnProps> = ({
  block,
  slideId,
  rowId,
  index,
  onUpdate,
  onAddColumn,
  isLastBlock,
  canAddColumn,
  onResize,
  isResizing,
  onResizeStart,
  onResizeEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBorderHovered, setIsBorderHovered] = useState(false);
  const borderResizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const mouseMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = useRef<(() => void) | null>(null);

  // Drag and drop for column reordering
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${slideId}-${block.id}`,
    data: { type: "block", block, slideId },
  });

  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // Resize handlers for border
  useEffect(() => {
    mouseMoveHandlerRef.current = (e: MouseEvent) => {
      // Calculate incremental delta from last position
      const deltaX = e.clientX - lastXRef.current;
      onResize(index, deltaX);
      // Update last position for next move
      lastXRef.current = e.clientX;
    };
  }, [index, onResize]);

  useEffect(() => {
    mouseUpHandlerRef.current = () => {
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener("mousemove", mouseMoveHandlerRef.current);
      }
      if (mouseUpHandlerRef.current) {
        document.removeEventListener("mouseup", mouseUpHandlerRef.current);
      }
      onResizeEnd();
    };
  }, [onResizeEnd]);

  const handleBorderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      startXRef.current = e.clientX;
      lastXRef.current = e.clientX; // Initialize last position
      onResizeStart();
      if (mouseMoveHandlerRef.current) {
        document.addEventListener("mousemove", mouseMoveHandlerRef.current);
      }
      if (mouseUpHandlerRef.current) {
        document.addEventListener("mouseup", mouseUpHandlerRef.current);
      }
    },
    [onResizeStart]
  );

  useEffect(() => {
    return () => {
      if (mouseMoveHandlerRef.current) {
        document.removeEventListener("mousemove", mouseMoveHandlerRef.current);
      }
      if (mouseUpHandlerRef.current) {
        document.removeEventListener("mouseup", mouseUpHandlerRef.current);
      }
    };
  }, []);

  const showBorder = isHovered || isBorderHovered || isResizing;

  return (
    <div
      ref={setSortableRef}
      style={dragStyle}
      className="group/column relative h-full min-w-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-full w-full">
        {/* Drag Handle - Top center of column (for drag and drop) */}
        <div
          {...attributes}
          {...listeners}
          className={`absolute flex items-center justify-center w-[26px] h-4 font-bold text-xs z-30 transition-all duration-200 cursor-grab active:cursor-grabbing ${
            isHovered
              ? "opacity-100"
              : "opacity-0 group-hover/column:opacity-100"
          }`}
          style={{
            top: 0,
            left: "50%",
            transform: "translateY(-50%) translateX(-50%)",
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            color: theme.primary,
            paddingTop: "1px",
          }}
        >
          <span className="select-none">⋯</span>
        </div>

        <DraggableBlock
          block={block}
          slideId={slideId}
          rowId={rowId}
          onUpdate={onUpdate}
          onAddColumn={onAddColumn}
          isLastBlock={isLastBlock}
          canAddColumn={canAddColumn}
          hideDragHandle={true}
        />

        {/* Border between columns - Resizable handle */}
        {!isLastBlock && (
          <div
            ref={borderResizeRef}
            className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-20 transition-all duration-200 ${
              isBorderHovered || isResizing
                ? "opacity-100"
                : "opacity-0 group-hover/row:opacity-100"
            }`}
            style={{
              transform: "translateX(50%)",
              backgroundColor: isResizing
                ? theme.primary
                : theme.primary + "80",
            }}
            onMouseDown={handleBorderMouseDown}
            onMouseEnter={() => setIsBorderHovered(true)}
            onMouseLeave={() => setIsBorderHovered(false)}
          >
            <div className="absolute inset-0 -mx-2" />
          </div>
        )}

        {/* Visual border line between columns */}
        {!isLastBlock && (
          <div
            className={`absolute right-0 top-0 bottom-0 w-px transition-all duration-200 ${
              showBorder
                ? "opacity-100"
                : "opacity-0 group-hover/row:opacity-40"
            }`}
            style={{
              backgroundColor: theme.primary,
              opacity: showBorder ? 0.6 : undefined,
            }}
          />
        )}
      </div>
    </div>
  );
};
