import React from "react";

interface SlideDropZoneProps {
  slideId: string;
  isOver: boolean;
}

export const SlideDropZone: React.FC<SlideDropZoneProps> = ({
  slideId,
  isOver,
}) => {
  return (
    <div
      className={`w-full h-16 mt-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center ${
        isOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 bg-gray-50/50"
      }`}
    >
      <span className={`text-sm font-medium ${isOver ? "text-blue-600" : "text-gray-400"}`}>
        {isOver ? "Drop to add row" : "Drag layout here"}
      </span>
    </div>
  );
};

