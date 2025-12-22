import React from "react";
import type { Block, Theme, BlockContent } from "@/types/presentation";
import { normalizeBlock, resolveBlockComponent } from "../blocks/registry";
import { BlockErrorBoundary } from "./BlockErrorBoundary";

interface BlockRendererProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}) => {
  const normalized = normalizeBlock(block);
  const Component = resolveBlockComponent(normalized.type);
  
  return (
    <BlockErrorBoundary
      blockId={block.id}
      blockType={block.type}
    >
      <Component
        block={normalized}
        onUpdate={readOnly ? () => {} : onUpdate}
        theme={theme}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </BlockErrorBoundary>
  );
};
