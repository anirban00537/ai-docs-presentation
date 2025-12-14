import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { DraggableBlock } from "./DraggableBlock";
import { useBlockFocus } from "./BlockFocusContext";
import type { Block } from "@/lib/editor/types";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME, deleteBlock } from "@/store/slices/slidesSlice";
import { withAlpha } from "./blocks/definitions/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";

interface ResizableColumnProps {
  block: Block;
  slideId: string;
  rowId: string;
  index: number;
  totalBlocksInRow: number;
  rowIndex: number;
  totalRowsInSlide: number;
  onUpdate: (blockId: string, content: any) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  isLastBlock: boolean;
  canAddColumn: boolean;
  onResize: (index: number, deltaX: number) => void;
  isResizing: boolean;
  onResizeStart: () => void;
  onResizeEnd: () => void;
  readOnly?: boolean;
}

export const ResizableColumn: React.FC<ResizableColumnProps> = ({
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
  onResize,
  isResizing,
  onResizeStart,
  onResizeEnd,
  readOnly = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBorderHovered, setIsBorderHovered] = useState(false);
  const borderResizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const lastXRef = useRef<number>(0);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const dispatch = useAppDispatch();
  const { setFocusedBlock } = useBlockFocus();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const handleStartRef = useRef<{ x: number, y: number } | null>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const wasDraggingRef = useRef(false);
  const mouseMoveHandlerRef = useRef<((e: MouseEvent) => void) | null>(null);
  const mouseUpHandlerRef = useRef<(() => void) | null>(null);

  // Drag and drop for column reordering
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
      ref={!readOnly ? setNodeRef : undefined}
      className={`group/column relative h-full w-full min-w-0 border border-transparent rounded-lg transition-colors duration-200 ${readOnly ? "" : ""}`}
      style={!readOnly ? {
        ...dragStyle,
      } : {}}
      onMouseEnter={(e) => {
        if (!readOnly) setIsHovered(true);
      }}
      onMouseLeave={(e) => {
        if (!readOnly) setIsHovered(false);
      }}
    >
      <div className="relative h-full w-full flex flex-col">
        {/* Column Controls - Top center */}
        {!readOnly && (
        <div
          className={`absolute flex items-center justify-center gap-1 z-30 transition-all duration-200 ${
            isHovered
              ? "opacity-100"
              : "opacity-0 group-hover/column:opacity-100"
          }`}
          style={{
            top: 0,
            left: "50%",
            transform: "translateY(-50%) translateX(-50%)",
          }}
        >
          {/* Drag Handle - separate from menu trigger */}
          <div
              ref={handleRef}
              {...attributes}
              {...listeners}
              className="flex items-center justify-center w-[26px] h-4 cursor-grab active:cursor-grabbing rounded transition-all outline-none"
              onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
                  e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)";
                  e.currentTarget.style.color = theme.primary;
              }}
              onPointerDown={(e) => {
                  handleStartRef.current = { x: e.clientX, y: e.clientY };
                  wasDraggingRef.current = false;
                  // Pass event to dnd-kit listeners to start drag
                  listeners?.onPointerDown?.(e);
              }}
              onPointerMove={() => {
                  // If pointer moves after down, it's a drag
                  if (handleStartRef.current) {
                      wasDraggingRef.current = true;
                  }
              }}
              onPointerUp={(e) => {
                   // Only open menu if it was a click (no drag movement)
                   if (!wasDraggingRef.current && handleStartRef.current) {
                       const dist = Math.sqrt(
                           Math.pow(e.clientX - handleStartRef.current.x, 2) +
                           Math.pow(e.clientY - handleStartRef.current.y, 2)
                       );
                       if (dist < 5) {
                           e.preventDefault();
                           e.stopPropagation();
                           setFocusedBlock(block.id);
                           setIsMenuOpen(true);
                       }
                   }
                   handleStartRef.current = null;
              }}
              style={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  backdropFilter: "blur(8px)",
                  border: `1px solid ${withAlpha(theme.primary, 0.2)}`,
                  color: theme.primary,
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
              }}
          >
              <span className="select-none text-xs font-bold">⋯</span>
          </div>
          
          {/* Menu positioned relative to handle */}
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
                <span className="sr-only">Options</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" sideOffset={4}>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                onClick={() => {
                    dispatch(deleteBlock({ slideId, rowId, blockId: block.id }));
                    setIsMenuOpen(false);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        )}

        <DraggableBlock
          block={block}
          slideId={slideId}
          rowId={rowId}
          blockIndex={index}
          totalBlocksInRow={totalBlocksInRow}
          rowIndex={rowIndex}
          totalRowsInSlide={totalRowsInSlide}
          onUpdate={onUpdate}
          onAddColumn={onAddColumn}
          isLastBlock={isLastBlock}
          canAddColumn={canAddColumn}
          hideDragHandle={true}
          readOnly={readOnly}
        />

        {/* Border between columns - Resizable handle */}
        {!isLastBlock && !readOnly && (
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
