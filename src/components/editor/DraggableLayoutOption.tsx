import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface DraggableLayoutOptionProps {
  id: string;
  columnCount: number;
  icon: React.ReactNode;
  label: string;
  blockType?: string; // Optional: specify block type (e.g., "number-card")
}

export const DraggableLayoutOption: React.FC<DraggableLayoutOptionProps> = ({
  id,
  columnCount,
  icon,
  label,
  blockType,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data: { type: "layout-option", columnCount, blockType },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all border-2 ${
        isDragging
          ? "border-blue-400 bg-blue-50 shadow-lg scale-105"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
      }`}
    >
      <div className="text-gray-600">{icon}</div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
};
