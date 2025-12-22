import React, { useState, useCallback, useRef, useEffect } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { BlockRenderer } from "./blocks/BlockRenderer";
import { BlockActionBar } from "./BlockActionBar";
import { useBlockFocus } from "./BlockFocusContext";
import type { Block } from "@/types/presentation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  DEFAULT_THEME,
  duplicateBlock,
  deleteBlock,
  type Theme,
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
  const { focusedBlockId, focusedSlideId, setFocusedBlock } = useBlockFocus();
  const isFocused = focusedBlockId === block.id && focusedSlideId === slideId;

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
        target.closest("[data-block-action-bar]") ||
        target.closest("[data-transform-menu]")
      ) {
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      setFocusedBlock(slideId, block.id);
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
        setFocusedBlock(null, null);
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
    setFocusedBlock(null, null);
  }, [dispatch, slideId, rowId, block.id, setFocusedBlock]);


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
            isVisible={isFocused}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onAddColumn={() => onAddColumn(rowId, block.id)}
            canAddColumn={isLastBlock && canAddColumn}
          />
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
