import React, { useState, useCallback, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BlockRenderer } from "./blocks/BlockRenderer";
import { BlockActionBar } from "./BlockActionBar";
import { useBlockFocus } from "./BlockFocusContext";
import type { Block } from "@/lib/editor/types";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  DEFAULT_THEME,
  duplicateBlock,
  deleteBlock,
  transformBlock,
  reorderBlocksInRow,
} from "@/store/slices/slidesSlice";

interface DraggableBlockProps {
  block: Block;
  slideId: string;
  rowId: string;
  blockIndex: number;
  totalBlocksInRow: number;
  rowIndex: number;
  totalRowsInSlide: number;
  onUpdate: (blockId: string, content: any) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  isLastBlock: boolean;
  canAddColumn: boolean;
  hideDragHandle?: boolean;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  slideId,
  rowId,
  blockIndex,
  totalBlocksInRow,
  rowIndex,
  totalRowsInSlide,
  onUpdate,
  onAddColumn,
  isLastBlock,
  canAddColumn,
  hideDragHandle = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const { focusedBlockId, setFocusedBlock } = useBlockFocus();
  const isFocused = focusedBlockId === block.id;

  // Only use sortable if drag handle is not hidden (i.e., not using ResizableColumn)
  const sortable = useSortable({
    id: `${slideId}-${block.id}`,
    data: { type: "block", block, slideId },
    disabled: hideDragHandle, // Disable when used in ResizableColumn
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    minWidth: 0,
  };

  // Handle block click to set focus
  const handleBlockClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't focus if clicking inside editor
      const target = e.target as HTMLElement;
      if (
        target.closest(".ProseMirror") ||
        target.closest("[data-block-action-bar]")
      ) {
        return;
      }
      setFocusedBlock(block.id);
    },
    [block.id, setFocusedBlock]
  );

  // Handle clicking outside to unfocus
  useEffect(() => {
    if (!isFocused) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        blockRef.current &&
        !blockRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest("[data-block-action-bar]") &&
        !(e.target as HTMLElement).closest("[data-transform-menu]")
      ) {
        setFocusedBlock(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFocused, setFocusedBlock]);

  // Action handlers
  const handleDuplicate = useCallback(() => {
    dispatch(duplicateBlock({ slideId, rowId, blockId: block.id }));
  }, [dispatch, slideId, rowId, block.id]);

  const handleDelete = useCallback(() => {
    dispatch(deleteBlock({ slideId, rowId, blockId: block.id }));
    setFocusedBlock(null);
  }, [dispatch, slideId, rowId, block.id, setFocusedBlock]);

  const handleTransform = useCallback(
    (newType: string) => {
      dispatch(transformBlock({ slideId, rowId, blockId: block.id, newType }));
    },
    [dispatch, slideId, rowId, block.id]
  );

  const handleMoveUp = useCallback(() => {
    if (rowIndex === 0 && blockIndex === 0) return;

    // If first block in row, we'd need to move to previous row
    // For now, just swap with previous block in same row
    if (blockIndex > 0) {
      dispatch(
        reorderBlocksInRow({
          slideId,
          rowId,
          oldIndex: blockIndex,
          newIndex: blockIndex - 1,
        })
      );
    }
  }, [dispatch, slideId, rowId, blockIndex, rowIndex]);

  const handleMoveDown = useCallback(() => {
    if (
      rowIndex === totalRowsInSlide - 1 &&
      blockIndex === totalBlocksInRow - 1
    )
      return;

    // If last block in row, we'd need to move to next row
    // For now, just swap with next block in same row
    if (blockIndex < totalBlocksInRow - 1) {
      dispatch(
        reorderBlocksInRow({
          slideId,
          rowId,
          oldIndex: blockIndex,
          newIndex: blockIndex + 1,
        })
      );
    }
  }, [dispatch, slideId, rowId, blockIndex, totalBlocksInRow, rowIndex, totalRowsInSlide]);

  const canMoveUp = blockIndex > 0;
  const canMoveDown = blockIndex < totalBlocksInRow - 1;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (blockRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }}
      style={style}
      className={`group/block relative min-w-0 h-full w-full flex flex-col ${
        isFocused ? "z-20" : ""
      }`}
      onClick={handleBlockClick}
    >
      <div
        className={`relative p-2 transition-all h-full w-full flex flex-col flex-1 rounded-lg ${
          isDragging ? "bg-blue-50" : ""
        }`}
        style={{
          outline: isFocused ? `2px solid ${theme.primary}` : "none",
          outlineOffset: "2px",
        }}
      >
        {/* Block Action Bar - Shows on focus */}
        <BlockActionBar
          block={block}
          isVisible={isFocused || isHovered}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onTransform={handleTransform}
          canMoveUp={canMoveUp}
          canMoveDown={canMoveDown}
          dragHandleProps={!hideDragHandle ? { ...attributes, ...listeners } : undefined}
        />

        {/* Drag Handle - Only show if not hidden and no action bar visible */}
        {!hideDragHandle && !isFocused && (
          <div
            {...attributes}
            {...listeners}
            className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 cursor-grab opacity-0 group-hover/block:opacity-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all z-10"
          >
            <svg width="6" height="14" viewBox="0 0 6 14" fill="currentColor">
              <circle cx="1.5" cy="1.5" r="1.5" />
              <circle cx="4.5" cy="1.5" r="1.5" />
              <circle cx="1.5" cy="7" r="1.5" />
              <circle cx="4.5" cy="7" r="1.5" />
              <circle cx="1.5" cy="12.5" r="1.5" />
              <circle cx="4.5" cy="12.5" r="1.5" />
            </svg>
          </div>
        )}

        {/* Add Column Button - Only on last block and if can add more */}
        {isLastBlock && canAddColumn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddColumn(rowId, block.id);
            }}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-white opacity-0 group-hover/row:opacity-100 hover:scale-110 transition-all z-20 flex items-center justify-center shadow-md"
            style={{
              backgroundColor: theme.primary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            title="Add column"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="6" y1="2" x2="6" y2="10" />
              <line x1="2" y1="6" x2="10" y2="6" />
            </svg>
          </button>
        )}

        {/* Block Renderer */}
        <BlockRenderer
          block={block}
          onUpdate={(content) => onUpdate(block.id, content)}
          theme={theme}
          placeholder="Type '/' for commands"
        />
      </div>
    </div>
  );
};
