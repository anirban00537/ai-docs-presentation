import React from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { type SpacerContent } from "../definitions/spacer";

interface SpacerBlockProps {
  block: Block;
  onUpdate: (content: SpacerContent) => void;
  theme: Theme;
}

export const SpacerBlock: React.FC<SpacerBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = block.content as SpacerContent;
  const { height } = content;
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      const startY = e.clientY;
      const startHeight = height;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientY - startY;
        const newHeight = Math.max(16, Math.min(600, startHeight + delta));
        onUpdate({ ...content, height: newHeight });
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [height, content, onUpdate]
  );

  return (
    <div
      className="w-full relative group transition-colors"
      style={{ 
          height,
          backgroundColor: isResizing ? "rgba(0,0,0,0.02)" : "transparent"
      }}
    >
      <div 
        className={`absolute inset-0 flex items-center justify-center border-2 border-dashed rounded transition-opacity ${
            isResizing ? "opacity-100 border-indigo-300" : "opacity-0 group-hover:opacity-100 border-gray-200"
        }`}
      >
        <span className="text-xs text-muted-foreground select-none pointer-events-none bg-white/50 px-2 py-1 rounded">
          {height}px
        </span>
      </div>

      <div
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize z-20 flex items-end justify-center group-hover:bg-black/5 transition-colors rounded-b"
        title="Drag to resize"
      >
        <div className="w-8 h-1 bg-gray-300 rounded mb-1.5 opacity-0 group-hover:opacity-100 dark:bg-gray-600" />
      </div>
    </div>
  );
};
