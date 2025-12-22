import React from "react";
import type { Block, Theme } from "@/types/presentation";
import { normalizeBlock, resolveBlockComponent } from "../blocks/registry";

interface BlockRendererProps {
  block: Block;
  onUpdate: (content: any) => void; // Content type varies by block type
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
    <Component
      block={normalized}
      onUpdate={readOnly ? () => {} : onUpdate}
      theme={theme}
      placeholder={placeholder}
      readOnly={readOnly} // We need to update registry.tsx to accept this prop type
    />
  );
};

