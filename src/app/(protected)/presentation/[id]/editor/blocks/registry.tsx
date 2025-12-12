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
import { CtaBlock } from "./cta/CtaBlock";
import { QuoteBlock } from "./quote/QuoteBlock";
import { TimelineBlock } from "./timeline/TimelineBlock";
import { TeamCardBlock } from "./team/TeamCardBlock";
import { PricingCardBlock } from "./pricing/PricingCardBlock";
import { ImageGalleryBlock } from "./gallery/ImageGalleryBlock";
import { StatsCounterBlock } from "./stats-counter/StatsCounterBlock";
import { FeatureListBlock } from "./feature-list/FeatureListBlock";
import { ComparisonTableBlock } from "./comparison-table/ComparisonTableBlock";
import { FAQBlock } from "./faq/FAQBlock";
import { LogoGridBlock } from "./logo-grid/LogoGridBlock";
import { VideoBlock } from "./video/VideoBlock";
import { CodeBlock } from "./code/CodeBlock";
import { ProgressBarBlock } from "./progress-bar/ProgressBarBlock";
import { SocialProofBlock } from "./social-proof/SocialProofBlock";
import { BadgeBlock } from "./badge/BadgeBlock";

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
  [BLOCK_TYPES.CTA]: {
    type: BLOCK_TYPES.CTA,
    component: CtaBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.CTA, content),
  },
  [BLOCK_TYPES.QUOTE]: {
    type: BLOCK_TYPES.QUOTE,
    component: QuoteBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.QUOTE, content),
  },
  [BLOCK_TYPES.TIMELINE]: {
    type: BLOCK_TYPES.TIMELINE,
    component: TimelineBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.TIMELINE, content),
  },
  [BLOCK_TYPES.TEAM_CARD]: {
    type: BLOCK_TYPES.TEAM_CARD,
    component: TeamCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.TEAM_CARD, content),
  },
  [BLOCK_TYPES.PRICING_CARD]: {
    type: BLOCK_TYPES.PRICING_CARD,
    component: PricingCardBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.PRICING_CARD, content),
  },
  [BLOCK_TYPES.IMAGE_GALLERY]: {
    type: BLOCK_TYPES.IMAGE_GALLERY,
    component: ImageGalleryBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.IMAGE_GALLERY, content),
  },
  [BLOCK_TYPES.STATS_COUNTER]: {
    type: BLOCK_TYPES.STATS_COUNTER,
    component: StatsCounterBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.STATS_COUNTER, content),
  },
  [BLOCK_TYPES.FEATURE_LIST]: {
    type: BLOCK_TYPES.FEATURE_LIST,
    component: FeatureListBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.FEATURE_LIST, content),
  },
  [BLOCK_TYPES.COMPARISON_TABLE]: {
    type: BLOCK_TYPES.COMPARISON_TABLE,
    component: ComparisonTableBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.COMPARISON_TABLE, content),
  },
  [BLOCK_TYPES.FAQ]: {
    type: BLOCK_TYPES.FAQ,
    component: FAQBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.FAQ, content),
  },
  [BLOCK_TYPES.LOGO_GRID]: {
    type: BLOCK_TYPES.LOGO_GRID,
    component: LogoGridBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.LOGO_GRID, content),
  },
  [BLOCK_TYPES.VIDEO]: {
    type: BLOCK_TYPES.VIDEO,
    component: VideoBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.VIDEO, content),
  },
  [BLOCK_TYPES.CODE]: {
    type: BLOCK_TYPES.CODE,
    component: CodeBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.CODE, content),
  },
  [BLOCK_TYPES.PROGRESS_BAR]: {
    type: BLOCK_TYPES.PROGRESS_BAR,
    component: ProgressBarBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.PROGRESS_BAR, content),
  },
  [BLOCK_TYPES.SOCIAL_PROOF]: {
    type: BLOCK_TYPES.SOCIAL_PROOF,
    component: SocialProofBlock,
    normalize: (content) =>
      normalizeBlockContent(BLOCK_TYPES.SOCIAL_PROOF, content),
  },
  [BLOCK_TYPES.BADGE]: {
    type: BLOCK_TYPES.BADGE,
    component: BadgeBlock,
    normalize: (content) => normalizeBlockContent(BLOCK_TYPES.BADGE, content),
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
