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
      className="relative h-20 -my-8 flex items-center justify-center z-20"
    >
      {/* Line with endpoints */}
      <div
        className={`absolute inset-x-6 flex items-center transition-all duration-150 ease-out`}
        style={{
          height: isOver ? "2px" : "2px",
          opacity: isOver ? 1 : 0.4,
        }}
      >
        {/* Main line */}
        <div
          className="flex-1 h-full rounded-full transition-all duration-150"
          style={{
            backgroundColor: themePrimary,
            boxShadow: isOver ? `0 0 8px ${themePrimary}50` : "none",
          }}
        />

        {/* Left dot */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-all duration-150"
          style={{
            width: isOver ? "8px" : "6px",
            height: isOver ? "8px" : "6px",
            backgroundColor: themePrimary,
            boxShadow: isOver ? `0 0 6px ${themePrimary}60` : "none",
          }}
        />

        {/* Right dot */}
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rounded-full transition-all duration-150"
          style={{
            width: isOver ? "8px" : "6px",
            height: isOver ? "8px" : "6px",
            backgroundColor: themePrimary,
            boxShadow: isOver ? `0 0 6px ${themePrimary}60` : "none",
          }}
        />
      </div>
    </div>
  );
});
