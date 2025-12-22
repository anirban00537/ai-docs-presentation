import { z } from "zod";
import { BlockContentSchema } from "./blocks";

export const BLOCK_TYPES = {
  PROSEMIRROR: "prosemirror",
  NUMBER_CARD: "number-card",
  TESTIMONIAL: "testimonial",
  CTA: "cta",
  QUOTE: "quote",
  TIMELINE: "timeline",
  TEAM_CARD: "team-card",
  PRICING_CARD: "pricing-card",
  IMAGE_GALLERY: "image-gallery",
  IMAGE: "image",
  STATS_COUNTER: "stats-counter",
  FEATURE_LIST: "feature-list",
  COMPARISON_TABLE: "comparison-table",
  FAQ: "faq",
  LOGO_GRID: "logo-grid",
  VIDEO: "video",
  CODE: "code",
  PROGRESS_BAR: "progress-bar",
  SOCIAL_PROOF: "social-proof",
  BADGE: "badge",
  SIMPLE_NUMBER_CARD: "simple-number-card",
  CODE_TERMINAL: "code-terminal",
  PULSE_METRIC: "pulse-metric",
  GLASS_INSIGHT: "glass-insight",
  SPACER: "spacer",
} as const;

export const MAX_BLOCKS_PER_ROW = 3;

export const BlockTypeSchema = z.nativeEnum(BLOCK_TYPES);

export const BlockSchema = z.object({
  id: z.string(),
  type: BlockTypeSchema.optional(),
  content: BlockContentSchema,
});

export const RowSchema = z.object({
  id: z.string(),
  blocks: z.array(BlockSchema),
  columnWidths: z.array(z.number()).optional(),
});

export const SlideAccentSchema = z.object({
  url: z.string().optional(),
  position: z.enum(["left", "right", "top", "bottom", "background"]),
  size: z.number().min(5).max(100), // width/height percentage, or opacity for background
});

export const SlideSchema = z.object({
  id: z.string(),
  rows: z.array(RowSchema),
  accent: SlideAccentSchema.optional(),
});

export const PresentationInfoSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  thumbnail: z.string().nullable(),
  isPublic: z.boolean(),
  isTemplate: z.boolean(),
  tags: z.array(z.string()),
  version: z.number(),
  parentId: z.string().nullable(),
  forkedFrom: z.string().nullable(),
  sharedWith: z.array(z.string()),
  ownerId: z.string(),
  deletedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastViewedAt: z.string().nullable(),
});
