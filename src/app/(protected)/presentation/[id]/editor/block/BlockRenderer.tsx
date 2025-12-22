import React, { memo, useMemo, useCallback } from "react";
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

export const BlockRenderer = memo(function BlockRenderer({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: BlockRendererProps) {
  // Memoize the normalized block to avoid recalculating on every render
  const normalized = useMemo(() => normalizeBlock(block), [block]);
  
  // Memoize the component resolution
  const Component = useMemo(
    () => resolveBlockComponent(normalized.type),
    [normalized.type]
  );

  // Memoize the no-op callback for readOnly mode
  const handleUpdate = useCallback(
    (content: BlockContent) => {
      if (!readOnly) {
        onUpdate(content);
      }
    },
    [onUpdate, readOnly]
  );

  return (
    <BlockErrorBoundary
      blockId={block.id}
      blockType={block.type}
    >
      <Component
        block={normalized}
        onUpdate={handleUpdate}
        theme={theme}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </BlockErrorBoundary>
  );
});
