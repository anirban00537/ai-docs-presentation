import React, { memo } from "react";
import { useDroppable } from "@dnd-kit/core";

export const InsertDropZone = memo(function InsertDropZone({
  cardId,
  insertIndex,
  themePrimary,
  isActive,
}: {
  cardId: string;
  insertIndex: number;
  themePrimary: string;
  isActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-insert-${cardId}-${insertIndex}`,
    data: {
      type: "row-insert",
      cardId,
      insertIndex,
    },
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className="relative h-16 -my-6 flex items-center justify-center z-10"
      aria-label={`Drop zone at position ${insertIndex + 1}`}
    >
      {/* Always visible subtle indicator during drag */}
      <div
        className={`absolute inset-x-2 h-0.5 flex items-center transition-all duration-150 ${
          isOver ? "opacity-100 scale-y-100" : "opacity-30 scale-y-75"
        }`}
        style={{ backgroundColor: themePrimary }}
      >
        <div
          className={`absolute left-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
            isOver ? "w-2.5 h-2.5" : "w-1.5 h-1.5"
          }`}
          style={{ backgroundColor: themePrimary }}
        />
        <div
          className={`absolute right-0 top-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
            isOver ? "w-2.5 h-2.5" : "w-1.5 h-1.5"
          }`}
          style={{ backgroundColor: themePrimary }}
        />
      </div>
    </div>
  );
});
