import { z } from "zod";

export * from "./blocks";
export * from "./core";
export * from "./theme";

import {
  BadgeContentSchema,
  CodeTerminalContentSchema,
  CodeContentSchema,
  ComparisonTableContentSchema,
  CtaContentSchema,
  FAQContentSchema,
  FeatureListContentSchema,
  GlassInsightContentSchema,
  ImageGalleryContentSchema,
  ImageContentSchema,
  LogoGridContentSchema,
  NumberCardContentSchema,
  PricingCardContentSchema,
  ProgressBarContentSchema,
  PulseMetricContentSchema,
  QuoteContentSchema,
  SimpleNumberCardContentSchema,
  SocialProofContentSchema,
  SpacerContentSchema,
  StatsCounterContentSchema,
  TeamCardContentSchema,
  TestimonialContentSchema,
  TimelineContentSchema,
  VideoContentSchema,
  BlockContentSchema,
  ProseMirrorDocumentSchema,
  BadgeItemSchema,
  ComparisonColumnSchema,
  ComparisonRowSchema,
  FAQItemSchema,
  FeatureItemSchema,
  GalleryImageSchema,
  LogoItemSchema,
  PricingFeatureSchema,
  ProgressItemSchema,
  SocialPlatformSchema,
  StatItemSchema,
  TimelineStepSchema,
} from "./blocks";

import {
  BlockSchema,
  RowSchema,
  SlideSchema,
  PresentationInfoSchema,
  BlockTypeSchema,
} from "./core";

import { ThemeSchema, CardDesignPatternSchema } from "./theme";

// Infer types
export type ProseMirrorDocument = z.infer<typeof ProseMirrorDocumentSchema>;

export type BadgeItem = z.infer<typeof BadgeItemSchema>;
export type BadgeContent = z.infer<typeof BadgeContentSchema>;

export type CodeTerminalContent = z.infer<typeof CodeTerminalContentSchema>;
export type CodeContent = z.infer<typeof CodeContentSchema>;

export type ComparisonColumn = z.infer<typeof ComparisonColumnSchema>;
export type ComparisonRow = z.infer<typeof ComparisonRowSchema>;
export type ComparisonTableContent = z.infer<typeof ComparisonTableContentSchema>;

export type CtaContent = z.infer<typeof CtaContentSchema>;

export type FAQItem = z.infer<typeof FAQItemSchema>;
export type FAQContent = z.infer<typeof FAQContentSchema>;

export type FeatureItem = z.infer<typeof FeatureItemSchema>;
export type FeatureListContent = z.infer<typeof FeatureListContentSchema>;

export type GlassInsightContent = z.infer<typeof GlassInsightContentSchema>;

export type GalleryImage = z.infer<typeof GalleryImageSchema>;
export type ImageGalleryContent = z.infer<typeof ImageGalleryContentSchema>;

export type ImageContent = z.infer<typeof ImageContentSchema>;

export type LogoItem = z.infer<typeof LogoItemSchema>;
export type LogoGridContent = z.infer<typeof LogoGridContentSchema>;

export type NumberCardContent = z.infer<typeof NumberCardContentSchema>;

export type PricingFeature = z.infer<typeof PricingFeatureSchema>;
export type PricingCardContent = z.infer<typeof PricingCardContentSchema>;

export type ProgressItem = z.infer<typeof ProgressItemSchema>;
export type ProgressBarContent = z.infer<typeof ProgressBarContentSchema>;

export type PulseMetricContent = z.infer<typeof PulseMetricContentSchema>;

export type QuoteContent = z.infer<typeof QuoteContentSchema>;

export type SimpleNumberCardContent = z.infer<typeof SimpleNumberCardContentSchema>;

export type SocialPlatform = z.infer<typeof SocialPlatformSchema>;
export type SocialProofContent = z.infer<typeof SocialProofContentSchema>;

export type SpacerContent = z.infer<typeof SpacerContentSchema>;

export type StatItem = z.infer<typeof StatItemSchema>;
export type StatsCounterContent = z.infer<typeof StatsCounterContentSchema>;

export type TeamCardContent = z.infer<typeof TeamCardContentSchema>;

export type TestimonialContent = z.infer<typeof TestimonialContentSchema>;

export type TimelineStep = z.infer<typeof TimelineStepSchema>;
export type TimelineContent = z.infer<typeof TimelineContentSchema>;

export type VideoContent = z.infer<typeof VideoContentSchema>;

export type LayoutTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string | any;
  getRows: () => Row[];
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
export type PresentationInfo = z.infer<typeof PresentationInfoSchema>;

export type Theme = z.infer<typeof ThemeSchema>;
export type CardDesignPattern = z.infer<typeof CardDesignPatternSchema>;

export { getDefaultHeadingContent, withAlpha } from "./blocks";
export { BLOCK_TYPES, MAX_BLOCKS_PER_ROW } from "./core";
