import { z } from "zod";
import { BlockContentSchema } from "./blocks";

export const BLOCK_TYPES = {
  PROSEMIRROR: "prosemirror",
  IMAGE: "image",
  CODE: "code",
  SPACER: "spacer",
  SIMPLE_NUMBER_CARD: "simple-number-card",
  LAYERED_NUMBER_BLOCK: "layered-number-block",
  CALLOUT_BLOCK: "callout-block",
  SOLID_BOX_BLOCK: "solid-box-block",
  SOLID_ICON_BOX_BLOCK: "solid-icon-box-block",
  SIDELINE_CARD_BLOCK: "sideline-card-block",
  BUTTON_BLOCK: "button-block",
  LEAF_BLOCK: "leaf-block",
  TIMELINE_BENTO_BLOCK: "timeline-bento-block",
  STACKED_TIMELINE_BLOCK: "stacked-timeline-block",
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
