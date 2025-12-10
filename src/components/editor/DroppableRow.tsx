import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DraggableBlock } from "./DraggableBlock";
import type { Row } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";

interface DroppableRowProps {
  row: Row;
  slideId: string;
  onUpdateBlock: (blockId: string, content: any) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
  onDuplicateBlock: (rowId: string, afterBlockId: string, blockType: string) => void;
  rowCount: number;
}

export const DroppableRow: React.FC<DroppableRowProps> = ({
  row,
  slideId,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onDuplicateBlock,
  rowCount,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const { setNodeRef, isOver } = useDroppable({
    id: `row-drop-${slideId}-${row.id}`,
    data: { type: "row", rowId: row.id, slideId },
  });

  const MAX_COLUMNS = 3;
  const canAddColumn = row.blocks.length < MAX_COLUMNS;

  return (
    <div className="group/row relative flex">
      {/* Row Menu Handle - Left Side */}
      <div className="relative flex items-center">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-5 h-full flex items-center justify-center text-gray-400 opacity-0 group-hover/row:opacity-100 hover:text-gray-600 transition-all"
          title="Row options"
        >
          <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
            <circle cx="2" cy="2" r="1.5" />
            <circle cx="2" cy="8" r="1.5" />
            <circle cx="2" cy="14" r="1.5" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <>
            {/* Backdrop to close menu */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="absolute left-6 top-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-40 min-w-[120px]">
              <button
                onClick={() => {
                  onDeleteRow(row.id);
                  setIsMenuOpen(false);
                }}
                disabled={rowCount <= 1}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Row Content */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex transition-all items-start border ${
          isOver
            ? "bg-green-50 ring-1 ring-dashed ring-green-400 border-green-400"
            : "border-transparent hover:border-opacity-30"
        }`}
        style={{
          borderColor: isOver ? undefined : "transparent",
          fontFamily: getFontFamily(theme.fontFamily || "Inter"),
        }}
        onMouseEnter={(e) => {
          if (!isOver) {
            e.currentTarget.style.borderColor = theme.primary + "30";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOver) {
            e.currentTarget.style.borderColor = "transparent";
          }
        }}
      >
        <SortableContext
          items={row.blocks.map((b) => `${slideId}-${b.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {row.blocks.map((block, index) => (
            <DraggableBlock
              key={block.id}
              block={block}
              slideId={slideId}
              rowId={row.id}
              onUpdate={onUpdateBlock}
              onAddColumn={onAddColumn}
              onDuplicateBlock={onDuplicateBlock}
              isLastBlock={index === row.blocks.length - 1}
              canAddColumn={canAddColumn}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

