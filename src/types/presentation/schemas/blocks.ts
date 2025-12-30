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

export const SimpleNumberCardContentSchema = z.object({
  type: z.literal("simple-number-card"),
  number: z.number(),
  editorContent: ProseMirrorDocumentSchema,
});

export const LayeredNumberContentSchema = z.object({
  type: z.literal("layered-number-block"),
  number: z.number(),
  editorContent: ProseMirrorDocumentSchema,
});

export const CalloutContentSchema = z.object({
  type: z.literal("callout-block"),
  variant: z.enum(["note", "info", "warning", "error", "success", "question"]),
  editorContent: ProseMirrorDocumentSchema,
});

export const SolidBoxContentSchema = z.object({
  type: z.literal("solid-box-block"),
  editorContent: ProseMirrorDocumentSchema,
});
export type SolidBoxContent = z.infer<typeof SolidBoxContentSchema>;

export const SolidIconBoxContentSchema = z.object({
  type: z.literal("solid-icon-box-block"),
  icon: z.string().optional(),
  editorContent: ProseMirrorDocumentSchema,
});
export type SolidIconBoxContent = z.infer<typeof SolidIconBoxContentSchema>;

export const SidelineCardContentSchema = z.object({
  type: z.literal("sideline-card-block"),
  editorContent: ProseMirrorDocumentSchema,
});
export type SidelineCardContent = z.infer<typeof SidelineCardContentSchema>;

export const BlockContentSchema = z.union([
  ProseMirrorDocumentSchema,
  CodeContentSchema,
  ImageContentSchema,
  SpacerContentSchema,
  SimpleNumberCardContentSchema,
  LayeredNumberContentSchema,
  CalloutContentSchema,
  SolidBoxContentSchema,
  SolidIconBoxContentSchema,
  SidelineCardContentSchema,
]);


// Utilities
export const getDefaultHeadingContent = (): string => "# Start typing...";

export const withAlpha = (color: string, opacity: number): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};
