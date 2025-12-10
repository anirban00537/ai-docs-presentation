import React from "react";
import type { Block } from "@/store/slices/slidesSlice";
import type { Theme } from "@/store/slices/slidesSlice";
import { BLOCK_TYPES } from "./index";
import { ProseMirrorBlock } from "./ProseMirrorBlock";
import { NumberCardBlock } from "./NumberCardBlock";

interface BlockRendererProps {
  block: Block;
  onUpdate: (content: any) => void; // Content type varies by block type
  theme: Theme;
  placeholder?: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const blockType = block.type || BLOCK_TYPES.PROSEMIRROR;

  switch (blockType) {
    case BLOCK_TYPES.NUMBER_CARD:
      return (
        <NumberCardBlock block={block} onUpdate={onUpdate} theme={theme} />
      );
    case BLOCK_TYPES.PROSEMIRROR:
    default:
      return (
        <ProseMirrorBlock
          block={block}
          onUpdate={onUpdate}
          placeholder={placeholder}
        />
      );
  }
};
