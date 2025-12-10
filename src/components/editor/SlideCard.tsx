import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { DroppableRow } from "./DroppableRow";
import { SlideDropZone } from "./SlideDropZone";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";

interface SlideCardProps {
  slide: Slide;
  index: number;
  totalSlides: number;
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  onDuplicateBlock: (slideId: string, rowId: string, afterBlockId: string, blockType: string) => void;
  onAddRowAtTop: (slideId: string) => void;
  onAddRowAtBottom: (slideId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  isLayoutDragging: boolean;
  activeLayoutSlideId: string | null;
}

export const SlideCard: React.FC<SlideCardProps> = ({
  slide,
  index,
  totalSlides,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onDuplicateBlock,
  onAddRowAtTop,
  onAddRowAtBottom,
  onDeleteSlide,
  isLayoutDragging,
  activeLayoutSlideId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const { setNodeRef, isOver } = useDroppable({
    id: `slide-drop-${slide.id}`,
    data: { type: "slide-drop-zone", slideId: slide.id },
  });

  return (
    <div
      className="group/slide relative rounded-2xl shadow-xl px-6 py-4"
      style={{
        backgroundColor: theme.cardBackground,
        fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Add Row at Top Button */}
      <button
        onClick={() => onAddRowAtTop(slide.id)}
        className={`absolute left-1/2 -translate-x-1/2 -top-4 z-10 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-md ${
          isHovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
        style={{
          backgroundColor: theme.primary,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = isHovered ? "1" : "0";
        }}
        title="Add row at top"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="2" x2="6" y2="10" />
          <line x1="2" y1="6" x2="10" y2="6" />
        </svg>
        <span>Add Row</span>
      </button>

      {/* Slide Content */}
      <div className="flex flex-col gap-6">
        {(slide.rows || []).map((row) => (
          <DroppableRow
            key={row.id}
            row={row}
            slideId={slide.id}
            onUpdateBlock={(blockId, content) =>
              onUpdateBlock(slide.id, blockId, content)
            }
            onDeleteRow={(rowId) => onDeleteRow(slide.id, rowId)}
            onAddColumn={(rowId, afterBlockId) =>
              onAddColumn(slide.id, rowId, afterBlockId)
            }
            onDuplicateBlock={(rowId, afterBlockId, blockType) =>
              onDuplicateBlock(slide.id, rowId, afterBlockId, blockType)
            }
            rowCount={slide.rows?.length || 0}
          />
        ))}
      </div>

      {/* Add Row at Bottom Button */}
      <button
        onClick={() => onAddRowAtBottom(slide.id)}
        className={`absolute left-1/2 -translate-x-1/2 -bottom-4 z-10 px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shadow-md ${
          isHovered
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{
          backgroundColor: theme.primary,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "0.9";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = isHovered ? "1" : "0";
        }}
        title="Add row at bottom"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="6" y1="2" x2="6" y2="10" />
          <line x1="2" y1="6" x2="10" y2="6" />
        </svg>
        <span>Add Row</span>
      </button>

      {/* Drop Zone for Layout */}
      {isLayoutDragging && (
        <div ref={setNodeRef}>
          <SlideDropZone slideId={slide.id} isOver={isOver} />
        </div>
      )}
    </div>
  );
};
