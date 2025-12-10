import React from "react";
import type { Block, Theme } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  type BlockType,
  normalizeBlockContent,
} from "./definitions";
import { ProseMirrorBlock } from "./prosemirror/ProseMirrorBlock";
import { NumberCardBlock } from "./number-card/NumberCardBlock";
import { TestimonialBlock } from "./testimonial/TestimonialBlock";

export interface BlockRendererProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme: Theme;
  placeholder?: string;
}

export interface BlockRegistryEntry {
  type: BlockType;
  component: React.ComponentType<BlockRendererProps>;
  normalize: (content: any) => any;
}

export const DEFAULT_BLOCK_TYPE = BLOCK_TYPES.PROSEMIRROR;

export const BLOCK_REGISTRY: Record<BlockType, BlockRegistryEntry> = {
  [BLOCK_TYPES.PROSEMIRROR]: {
    type: BLOCK_TYPES.PROSEMIRROR,
    component: ProseMirrorBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.PROSEMIRROR, content),
  },
  [BLOCK_TYPES.NUMBER_CARD]: {
    type: BLOCK_TYPES.NUMBER_CARD,
    component: NumberCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.NUMBER_CARD, content),
  },
  [BLOCK_TYPES.TESTIMONIAL]: {
    type: BLOCK_TYPES.TESTIMONIAL,
    component: TestimonialBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.TESTIMONIAL, content),
  },
};

export const resolveBlockComponent = (
  type?: string
): React.ComponentType<BlockRendererProps> =>
  BLOCK_REGISTRY[type as BlockType]?.component ||
  BLOCK_REGISTRY[DEFAULT_BLOCK_TYPE].component;

export const normalizeBlock = (block: Block): Block => {
  const type = (block.type as BlockType) || DEFAULT_BLOCK_TYPE;
  const entry = BLOCK_REGISTRY[type];
  return {
    ...block,
    type,
    content: entry ? entry.normalize(block.content) : block.content,
  };
};

export const getRegisteredBlockTypes = (): BlockType[] =>
  Object.keys(BLOCK_REGISTRY) as BlockType[];
