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
import { SimpleNumberCardBlock } from "./simple-number-card/SimpleNumberCardBlock";
import { LayeredNumberBlock } from "./layered-number-block/LayeredNumberBlock";
import { CalloutBlock } from "./callout-block/CalloutBlock";
import { SolidBoxBlock } from "./solid-box-block/SolidBoxBlock";
import { SolidIconBoxBlock } from "./solid-icon-box-block/SolidIconBoxBlock";
import { SidelineCardBlock } from "./sideline-card-block/SidelineCardBlock";
import { ButtonBlock } from "./button-block/ButtonBlock";
import { LeafBlock } from "./leaf-block/LeafBlock";


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
  [BLOCK_TYPES.SIMPLE_NUMBER_CARD]: {
    type: BLOCK_TYPES.SIMPLE_NUMBER_CARD,
    component: SimpleNumberCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.SIMPLE_NUMBER_CARD, content),
  },
  [BLOCK_TYPES.LAYERED_NUMBER_BLOCK]: {
    type: BLOCK_TYPES.LAYERED_NUMBER_BLOCK,
    component: LayeredNumberBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.LAYERED_NUMBER_BLOCK, content),
  },
  [BLOCK_TYPES.CALLOUT_BLOCK]: {
    type: BLOCK_TYPES.CALLOUT_BLOCK,
    component: CalloutBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.CALLOUT_BLOCK, content),
  },
  [BLOCK_TYPES.SOLID_BOX_BLOCK]: {
    type: BLOCK_TYPES.SOLID_BOX_BLOCK,
    component: SolidBoxBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.SOLID_BOX_BLOCK, content),
  },
  [BLOCK_TYPES.SOLID_ICON_BOX_BLOCK]: {
    type: BLOCK_TYPES.SOLID_ICON_BOX_BLOCK,
    component: SolidIconBoxBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.SOLID_ICON_BOX_BLOCK, content),
  },
  [BLOCK_TYPES.SIDELINE_CARD_BLOCK]: {
    type: BLOCK_TYPES.SIDELINE_CARD_BLOCK,
    component: SidelineCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.SIDELINE_CARD_BLOCK, content),
  },
  [BLOCK_TYPES.BUTTON_BLOCK]: {
    type: BLOCK_TYPES.BUTTON_BLOCK,
    component: ButtonBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.BUTTON_BLOCK, content),
  },
  [BLOCK_TYPES.LEAF_BLOCK]: {
    type: BLOCK_TYPES.LEAF_BLOCK,
    component: LeafBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.LEAF_BLOCK, content),
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
