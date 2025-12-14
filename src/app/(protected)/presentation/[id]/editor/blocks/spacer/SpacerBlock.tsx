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

  return (
    <div
      className="w-full relative group min-h-[16px]"
      style={{ height }}
    >
        {/* Invisible by default, shows resizing handle hint on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/5 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700 rounded select-none pointer-events-none text-xs text-muted-foreground">
            Spacer ({height}px)
        </div>
      
        {/* Simple resize handle simulation (can be enhanced later) */}
        <input 
            type="range"
            min="16"
            max="400"
            value={height}
            onChange={(e) => onUpdate({ ...content, height: parseInt(e.target.value) })}
            className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 w-24 h-4 z-20 cursor-ns-resize" 
            title="Adjust height"
        />
    </div>
  );
};
