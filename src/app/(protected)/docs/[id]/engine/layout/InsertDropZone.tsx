import React, { memo } from "react";
import { useDroppable } from "@dnd-kit/core";

export const InsertDropZone = memo(function InsertDropZone({
  slideId,
  insertIndex,
  themePrimary,
  isActive,
}: {
  slideId: string;
  insertIndex: number;
  themePrimary: string;
  isActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-insert-${slideId}-${insertIndex}`,
    data: {
      type: "row-insert",
      slideId,
      insertIndex,
    },
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className="relative h-6 flex items-center justify-center"
      aria-label={`Drop zone at position ${insertIndex + 1}`}
    >
      {isOver && (
        <div
          className="absolute inset-x-4 h-0.5 flex items-center"
          style={{ backgroundColor: themePrimary }}
        >
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themePrimary }}
          />
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themePrimary }}
          />
        </div>
      )}
    </div>
  );
});
