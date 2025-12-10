import React from "react";
import type { Block, Theme } from "@/lib/editor/types";
import { normalizeBlock, resolveBlockComponent } from "./registry";

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
  const normalized = normalizeBlock(block);
  const Component = resolveBlockComponent(normalized.type);
  return (
    <Component
      block={normalized}
      onUpdate={onUpdate}
      theme={theme}
      placeholder={placeholder}
    />
  );
};
