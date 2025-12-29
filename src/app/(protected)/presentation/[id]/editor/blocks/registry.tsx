import React from "react";
import type { Block, Theme, BlockContent } from "@/types/presentation";
import {
  BLOCK_TYPES,
  type BlockType,
  normalizeBlockContent,
} from "./definitions";
import { ProseMirrorBlock } from "./prosemirror/ProseMirrorBlock";
import { ImageBlock } from "./image/ImageBlock";
import { CodeBlock } from "./code/CodeBlock";
import { SpacerBlock } from "./spacer/SpacerBlock";
import { NumberCardBlock } from "./number-card/NumberCardBlock";
import { SimpleNumberCardBlock } from "./simple-number-card/SimpleNumberCardBlock";
import { SpineCardBlock } from "./spine-card/SpineCardBlock";
import { ModernPillCardBlock } from "./modern-pill-card/ModernPillCardBlock";
import { InvertedImpactBlock } from "./inverted-impact-block/InvertedImpactBlock";
import { GlassBillboardBlock } from "./glass-billboard-block/GlassBillboardBlock";
import { LayeredNumberBlock } from "./layered-number-block/LayeredNumberBlock";
import { CornerCutBlock } from "./corner-cut-block/CornerCutBlock";
import { CalloutBlock } from "./callout-block/CalloutBlock";

export interface BlockRendererProps {
  block: Block;
  onUpdate: (content: BlockContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export interface BlockRegistryEntry {
  type: BlockType;
  component: React.ComponentType<BlockRendererProps>;
  normalize: (content: unknown) => BlockContent;
}

export const DEFAULT_BLOCK_TYPE = BLOCK_TYPES.PROSEMIRROR;

export const BLOCK_REGISTRY: Record<BlockType, BlockRegistryEntry> = {
  [BLOCK_TYPES.PROSEMIRROR]: {
    type: BLOCK_TYPES.PROSEMIRROR,
    component: ProseMirrorBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.PROSEMIRROR, content),
  },
  [BLOCK_TYPES.IMAGE]: {
    type: BLOCK_TYPES.IMAGE,
    component: ImageBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.IMAGE, content),
  },
  [BLOCK_TYPES.CODE]: {
    type: BLOCK_TYPES.CODE,
    component: CodeBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.CODE, content),
  },
  [BLOCK_TYPES.SPACER]: {
    type: BLOCK_TYPES.SPACER,
    component: SpacerBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.SPACER, content),
  },
  [BLOCK_TYPES.NUMBER_CARD]: {
    type: BLOCK_TYPES.NUMBER_CARD,
    component: NumberCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.NUMBER_CARD, content),
  },
  [BLOCK_TYPES.SIMPLE_NUMBER_CARD]: {
    type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
    component: SimpleNumberCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.SIMPLE_NUMBER_CARD, content),
  },
  [BLOCK_TYPES.SPINE_CARD]: {
    type: BLOCK_TYPES.SPINE_CARD,
    component: SpineCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.SPINE_CARD, content),
  },
  [BLOCK_TYPES.MODERN_PILL_CARD]: {
    type: BLOCK_TYPES.MODERN_PILL_CARD,
    component: ModernPillCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.MODERN_PILL_CARD, content),
  },
  [BLOCK_TYPES.INVERTED_IMPACT_BLOCK]: {
    type: BLOCK_TYPES.INVERTED_IMPACT_BLOCK,
    component: InvertedImpactBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.INVERTED_IMPACT_BLOCK, content),
  },
  [BLOCK_TYPES.GLASS_BILLBOARD_BLOCK]: {
    type: BLOCK_TYPES.GLASS_BILLBOARD_BLOCK,
    component: GlassBillboardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.GLASS_BILLBOARD_BLOCK, content),
  },
  [BLOCK_TYPES.LAYERED_NUMBER_BLOCK]: {
    type: BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
    component: LayeredNumberBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.LAYERED_NUMBER_BLOCK, content),
  },
  [BLOCK_TYPES.CORNER_CUT_BLOCK]: {
    type: BLOCK_TYPES.CORNER_CUT_BLOCK,
    component: CornerCutBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.CORNER_CUT_BLOCK, content),
  },
  [BLOCK_TYPES.CALLOUT_BLOCK]: {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    component: CalloutBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.CALLOUT_BLOCK, content),
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
