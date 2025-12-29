import { z } from "zod";

// --- Base Types ---

export const ProseMirrorDocumentSchema = z.string();

// --- Block Content Schemas ---

export const CodeContentSchema = z.object({
  type: z.literal("code"),
  code: z.string(),
  language: z.string().optional(),
  showLineNumbers: z.boolean().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const ImageContentSchema = z.object({
  type: z.literal("image"),
  url: z.string().url(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  attribution: z.object({
    name: z.string(),
    link: z.string().url(),
  }).optional(),
  objectFit: z.enum(["cover", "contain", "fill"]).optional(),
});

export const SpacerContentSchema = z.object({
  type: z.literal("spacer"),
  height: z.number(),
});

export const NumberCardContentSchema = z.object({
  type: z.literal("number-card"),
  icon: z.string().optional(),
  number: z.number(),
  size: z.enum(["small", "medium", "large"]).optional(),
  editorContent: ProseMirrorDocumentSchema,
});

export const SimpleNumberCardContentSchema = z.object({
  type: z.literal("simple-number-card"),
  number: z.number(),
  editorContent: ProseMirrorDocumentSchema,
});

export const SpineCardContentSchema = z.object({
  type: z.literal("spine-card"),
  editorContent: ProseMirrorDocumentSchema,
});

export const ModernPillCardContentSchema = z.object({
  type: z.literal("modern-pill-card"),
  label: z.string().optional(),
  editorContent: ProseMirrorDocumentSchema,
});

export const InvertedImpactContentSchema = z.object({
  type: z.literal("inverted-impact-block"),
  editorContent: ProseMirrorDocumentSchema,
});

export const GlassBillboardContentSchema = z.object({
  type: z.literal("glass-billboard-block"),
  editorContent: ProseMirrorDocumentSchema,
});

export const LayeredNumberContentSchema = z.object({
  type: z.literal("layered-number-block"),
  number: z.number(),
  editorContent: ProseMirrorDocumentSchema,
});

export const CornerCutContentSchema = z.object({
  type: z.literal("corner-cut-block"),
  label: z.string().optional(),
  editorContent: ProseMirrorDocumentSchema,
});

export const CalloutContentSchema = z.object({
  type: z.literal("callout-block"),
  variant: z.enum(["note", "info", "warning", "error", "success", "question"]),
  editorContent: ProseMirrorDocumentSchema,
});

// --- Master Content Union ---

export const BlockContentSchema = z.union([
  ProseMirrorDocumentSchema,
  CodeContentSchema,
  ImageContentSchema,
  SpacerContentSchema,
  NumberCardContentSchema,
  SimpleNumberCardContentSchema,
  SpineCardContentSchema,
  ModernPillCardContentSchema,
  InvertedImpactContentSchema,
  GlassBillboardContentSchema,
  LayeredNumberContentSchema,
  CornerCutContentSchema,
  CalloutContentSchema,
]);


// Utilities
export const getDefaultHeadingContent = (): string => "# ";

export const withAlpha = (color: string, opacity: number): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};
