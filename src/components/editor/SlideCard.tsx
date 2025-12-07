import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { DroppableRow } from "./DroppableRow";
import { SlideDropZone } from "./SlideDropZone";
import type { Slide } from "@/store/slices/slidesSlice";

interface SlideCardProps {
  slide: Slide;
  index: number;
  totalSlides: number;
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
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
  onDeleteSlide,
  isLayoutDragging,
  activeLayoutSlideId,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slide-drop-${slide.id}`,
    data: { type: "slide-drop-zone", slideId: slide.id },
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 px-6 py-4">
      {/* Slide Content */}
      <div className="flex flex-col gap-6">
        {slide.rows.map((row) => (
          <DroppableRow
            key={row.id}
            row={row}
            slideId={slide.id}
            onUpdateBlock={(blockId, content) => onUpdateBlock(slide.id, blockId, content)}
            onDeleteRow={(rowId) => onDeleteRow(slide.id, rowId)}
            onAddColumn={(rowId, afterBlockId) => onAddColumn(slide.id, rowId, afterBlockId)}
            rowCount={slide.rows.length}
          />
        ))}
      </div>

      {/* Drop Zone for Layout */}
      {isLayoutDragging && (
        <div ref={setNodeRef}>
          <SlideDropZone slideId={slide.id} isOver={isOver} />
        </div>
      )}
    </div>
  );
};

