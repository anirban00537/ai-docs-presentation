import { z } from "zod";

export * from "./blocks";
export * from "./core";
export * from "./theme";

import {
  CodeContentSchema,
  ImageContentSchema,
  SpacerContentSchema,
  BlockContentSchema,
  ProseMirrorDocumentSchema,
  NumberCardContentSchema,
  SimpleNumberCardContentSchema,
  SpineCardContentSchema,
  ModernPillCardContentSchema,
  InvertedImpactContentSchema,
  GlassBillboardContentSchema,
  LayeredNumberContentSchema,
  CornerCutContentSchema,
} from "./blocks";

import {
  BlockSchema,
  RowSchema,
  SlideSchema,
  PresentationInfoSchema,
  BlockTypeSchema,
  SlideAccentSchema,
} from "./core";

import { ThemeSchema, CardDesignPatternSchema } from "./theme";

// Infer types
export type ProseMirrorDocument = z.infer<typeof ProseMirrorDocumentSchema>;

export type CodeContent = z.infer<typeof CodeContentSchema>;

export type ImageContent = z.infer<typeof ImageContentSchema>;

export type SpacerContent = z.infer<typeof SpacerContentSchema>;

export type NumberCardContent = z.infer<typeof NumberCardContentSchema>;

export type SimpleNumberCardContent = z.infer<typeof SimpleNumberCardContentSchema>;

export type SpineCardContent = z.infer<typeof SpineCardContentSchema>;

export type ModernPillCardContent = z.infer<typeof ModernPillCardContentSchema>;
export type InvertedImpactContent = z.infer<typeof InvertedImpactContentSchema>;
export type GlassBillboardContent = z.infer<typeof GlassBillboardContentSchema>;
export type LayeredNumberContent = z.infer<typeof LayeredNumberContentSchema>;
export type CornerCutContent = z.infer<typeof CornerCutContentSchema>;


export type LayoutTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string | any;
  getRows: () => Row[];
  /** Optional accent configuration for the slide */
  accent?: SlideAccent;
};

export type BlockContent = z.infer<typeof BlockContentSchema>;

export type BlockType = z.infer<typeof BlockTypeSchema>;
export type Block<T = BlockContent> = {
  id: string;
  type?: BlockType;
  content: T;
};

export type Row = z.infer<typeof RowSchema>;
export type Slide = z.infer<typeof SlideSchema>;
export type SlideAccent = z.infer<typeof SlideAccentSchema>;
export type PresentationInfo = z.infer<typeof PresentationInfoSchema>;

export type Theme = z.infer<typeof ThemeSchema>;
export type CardDesignPattern = z.infer<typeof CardDesignPatternSchema>;

export { getDefaultHeadingContent, withAlpha } from "./blocks";
export { BLOCK_TYPES, MAX_BLOCKS_PER_ROW } from "./core";
export * from "../type-guards";
