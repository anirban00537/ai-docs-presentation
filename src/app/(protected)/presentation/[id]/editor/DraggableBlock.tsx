import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
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
  type Theme,
} from "@/store/slices/slidesSlice";
import { IconPlus } from "@tabler/icons-react";

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
  readOnly?: boolean;
  /** Optional theme prop. If not provided, falls back to Redux store theme */
  theme?: Theme;
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
  readOnly = false,
  theme: themeProp,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const dispatch = useAppDispatch();
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const { focusedBlockId, setFocusedBlock } = useBlockFocus();
  const isFocused = focusedBlockId === block.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `${slideId}-${block.id}`,
    data: { type: "block", block, slideId, rowId, index: blockIndex },
    disabled: hideDragHandle || readOnly,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    minWidth: 0,
    zIndex: isDragging ? 200 : undefined,
  };

  const handleBlockClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        readOnly ||
        target.closest(".ProseMirror") ||
        target.closest("[data-block-action-bar]")
      ) {
        return;
      }
      setFocusedBlock(block.id);
    },
    [block.id, setFocusedBlock, readOnly]
  );

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
        if (!readOnly) setNodeRef(node);
        (blockRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      style={!readOnly ? style : {}}
      className={`group/block relative min-w-0 h-full w-full flex flex-col ${
        !readOnly && isFocused ? "z-20" : ""
      }`}
      onClick={!readOnly ? handleBlockClick : undefined}
      onMouseEnter={!readOnly ? () => setIsHovered(true) : undefined}
      onMouseLeave={!readOnly ? () => setIsHovered(false) : undefined}
    >
      <div
        className={`relative p-2 transition-all h-full w-full flex flex-col flex-1 rounded-xl ${
          isDragging && !readOnly ? "opacity-50" : ""
        }`}
        style={{
          outline: !readOnly && isFocused ? `2px solid ${theme.primary}` : "none",
          outlineOffset: "1px",
        }}
      >
        {/* Block Action Bar */}
        {!readOnly && (
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
        )}

        {/* Drag Handle - Minimal */}
        {!hideDragHandle && !isFocused && !readOnly && (
          <div
            {...attributes}
            {...listeners}
            className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-6 cursor-grab opacity-0 group-hover/block:opacity-40 hover:opacity-100 flex items-center justify-center transition-all z-10"
            style={{ color: isDark ? "#fff" : "#000" }}
          >
            <svg width="4" height="10" viewBox="0 0 4 10" fill="currentColor">
              <circle cx="1" cy="1" r="1" />
              <circle cx="3" cy="1" r="1" />
              <circle cx="1" cy="5" r="1" />
              <circle cx="3" cy="5" r="1" />
              <circle cx="1" cy="9" r="1" />
              <circle cx="3" cy="9" r="1" />
            </svg>
          </div>
        )}

        {/* Add Column Button - Minimal */}
        {isLastBlock && canAddColumn && !readOnly && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddColumn(rowId, block.id);
            }}
            className="absolute -right-2.5 top-1/2 -translate-y-1/2 opacity-0 group-hover/row:opacity-100 transition-all z-20"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{
                backgroundColor: `${theme.primary}20`,
                color: theme.primary,
              }}
            >
              <IconPlus size={12} stroke={2.5} />
            </div>
          </button>
        )}

        {/* Block Renderer */}
        <BlockRenderer
          block={block}
          onUpdate={(content) => onUpdate(block.id, content)}
          theme={theme}
          placeholder="Type '/' for commands"
          readOnly={readOnly}
        />
      </div>
    </div>
  );
};
