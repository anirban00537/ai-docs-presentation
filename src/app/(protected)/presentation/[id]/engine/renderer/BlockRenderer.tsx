import React, { memo, useMemo, useCallback } from "react";
import type { Block, BlockContent, BlockType } from "@/types/presentation";
import { useEditorTheme } from "@/app/(protected)/presentation/[id]/engine/theme/EditorThemeProvider";
import { BlockErrorBoundary } from "./BlockErrorBoundary";
import { BLOCK_DEFINITIONS } from "@/app/(protected)/presentation/[id]/engine/registry/block-definitions";
import { BLOCK_TYPES } from "@/types/presentation";

interface BlockRendererProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const BlockRenderer = memo(function BlockRenderer({
  block,
  onUpdate,
  placeholder,
  readOnly = false,
}: BlockRendererProps) {
  const theme = useEditorTheme();
  
  const type = block.type || BLOCK_TYPES.PROSEMIRROR;
  const definition = BLOCK_DEFINITIONS[type as unknown as BlockType] || BLOCK_DEFINITIONS[BLOCK_TYPES.PROSEMIRROR];
  const Component = definition.component;

  // Memoize the normalized block to avoid recalculating on every render
  const normalized = useMemo(() => ({
    ...block,
    content: definition.normalizeContent(block.content),
  }), [block, definition]);

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
      <React.Suspense fallback={<div className="h-12 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg" />}>
        <Component
          block={normalized}
          onUpdate={handleUpdate}
          theme={theme}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      </React.Suspense>
    </BlockErrorBoundary>
  );
});
