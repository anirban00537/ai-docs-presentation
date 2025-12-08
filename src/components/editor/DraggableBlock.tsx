import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface DraggableBlockProps {
  block: Block;
  slideId: string;
  rowId: string;
  onUpdate: (blockId: string, content: any) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  isLastBlock: boolean;
  canAddColumn: boolean;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  slideId,
  rowId,
  onUpdate,
  onAddColumn,
  isLastBlock,
  canAddColumn,
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${slideId}-${block.id}`,
    data: { type: "block", block, slideId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    minWidth: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/block relative min-w-0 flex-1"
    >
      <div
        className={`relative p-2 transition-all ${
          isDragging ? "bg-blue-50" : ""
        } ${
          !isLastBlock
            ? "border-r border-transparent group-hover/row:border-opacity-30"
            : ""
        }`}
        style={
          !isLastBlock
            ? {
                borderRightColor: "transparent",
              }
            : undefined
        }
        onMouseEnter={(e) => {
          if (!isLastBlock) {
            e.currentTarget.style.borderRightColor = theme.primary + "30";
          }
        }}
        onMouseLeave={(e) => {
          if (!isLastBlock) {
            e.currentTarget.style.borderRightColor = "transparent";
          }
        }}
      >
        {/* Drag Handle */}
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

        {/* Editor */}
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={block.content}
          onChange={(val) => onUpdate(block.id, val)}
          placeholder="Type '/' for commands"
          className=""
        />
      </div>
    </div>
  );
};
