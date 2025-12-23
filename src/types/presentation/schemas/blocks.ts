import { z } from "zod";

// --- Base Types ---

export const ProseMirrorDocumentSchema = z.string();

// --- Block Specific Item Schemas ---

export const BadgeItemSchema = z.object({
  icon: z.string().optional(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema.optional(),
  issuer: ProseMirrorDocumentSchema.optional(),
  date: z.string().optional(),
});

export const ComparisonColumnSchema = z.object({
  name: ProseMirrorDocumentSchema,
  price: ProseMirrorDocumentSchema.optional(),
});

export const ComparisonRowSchema = z.object({
  feature: ProseMirrorDocumentSchema,
  values: z.array(z.union([z.boolean(), z.string(), ProseMirrorDocumentSchema])),
});

export const FAQItemSchema = z.object({
  question: ProseMirrorDocumentSchema,
  answer: ProseMirrorDocumentSchema,
  expanded: z.boolean().optional(),
});

export const FeatureItemSchema = z.object({
  icon: z.string(),
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

export const GalleryImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  caption: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
});

export const LogoItemSchema = z.object({
  image: z.string().optional(),
  name: ProseMirrorDocumentSchema,
  link: z.string().url().optional(),
});

export const PricingFeatureSchema = z.object({
  text: ProseMirrorDocumentSchema,
  included: z.boolean(),
});

export const ProgressItemSchema = z.object({
  label: ProseMirrorDocumentSchema,
  value: z.number().min(0).max(100),
  color: z.string().optional(),
});

export const SocialPlatformSchema = z.object({
  platform: z.enum(["twitter", "linkedin", "facebook", "instagram", "youtube"]),
  followers: z.string(),
  link: z.string().url().optional(),
});

export const StatItemSchema = z.object({
  value: z.number(),
  label: ProseMirrorDocumentSchema,
  icon: z.string().optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  color: z.string().optional(),
});

export const TimelineStepSchema = z.object({
  title: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema,
});

// --- Block Content Schemas ---

export const BadgeContentSchema = z.object({
  type: z.literal("badge"),
  badges: z.array(BadgeItemSchema),
  layout: z.enum(["grid", "list"]),
});

export const CodeTerminalContentSchema = z.object({
  type: z.literal("code-terminal"),
  command: z.string(),
  output: z.string(),
});

export const CodeContentSchema = z.object({
  type: z.literal("code"),
  code: z.string(),
  language: z.string().optional(),
  showLineNumbers: z.boolean().optional(),
  theme: z.enum(["light", "dark"]).optional(),
});

export const ComparisonTableContentSchema = z.object({
  type: z.literal("comparison-table"),
  columns: z.array(ComparisonColumnSchema),
  rows: z.array(ComparisonRowSchema),
});

export const CtaContentSchema = z.object({
  type: z.literal("cta"),
  heading: ProseMirrorDocumentSchema,
  body: ProseMirrorDocumentSchema,
  buttonLabel: z.string(),
  buttonLink: z.string().optional(),
});

export const FAQContentSchema = z.object({
  type: z.literal("faq"),
  items: z.array(FAQItemSchema),
  style: z.enum(["accordion", "list"]),
});

export const FeatureListContentSchema = z.object({
  type: z.literal("feature-list"),
  features: z.array(FeatureItemSchema),
  layout: z.enum(["grid", "list"]),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

export const GlassInsightContentSchema = z.object({
  type: z.literal("glass-insight"),
  icon: z.string(),
  editorContent: ProseMirrorDocumentSchema,
});

export const ImageGalleryContentSchema = z.object({
  type: z.literal("image-gallery"),
  images: z.array(GalleryImageSchema),
  layout: z.enum(["grid", "masonry"]),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]),
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

export const LogoGridContentSchema = z.object({
  type: z.literal("logo-grid"),
  logos: z.array(LogoItemSchema),
  columns: z.union([z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  grayscale: z.boolean().optional(),
});

export const NumberCardContentSchema = z.object({
  type: z.literal("number-card"),
  icon: z.string().optional(),
  number: z.number().optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
  editorContent: ProseMirrorDocumentSchema,
});

export const PricingCardContentSchema = z.object({
  type: z.literal("pricing-card"),
  planName: ProseMirrorDocumentSchema,
  price: ProseMirrorDocumentSchema,
  features: z.array(PricingFeatureSchema),
  buttonLabel: z.string(),
});

export const ProgressBarContentSchema = z.object({
  type: z.literal("progress-bar"),
  items: z.array(ProgressItemSchema),
  showPercentage: z.boolean().optional(),
  animated: z.boolean().optional(),
});

export const PulseMetricContentSchema = z.object({
  type: z.literal("pulse-metric"),
  value: z.string(),
  label: z.string(),
  trend: z.enum(["up", "down", "neutral"]),
  sparklineType: z.enum(["smooth", "step", "linear", "bars"]).optional(),
});

export const QuoteContentSchema = z.object({
  type: z.literal("quote"),
  quote: ProseMirrorDocumentSchema,
  author: ProseMirrorDocumentSchema,
  style: z.enum(["centered", "minimal", "left-aligned"]).optional(),
});

export const SimpleNumberCardContentSchema = z.object({
  type: z.literal("simple-number-card"),
  number: z.number(),
  editorContent: ProseMirrorDocumentSchema,
});

export const SocialProofContentSchema = z.object({
  type: z.literal("social-proof"),
  platforms: z.array(SocialPlatformSchema),
  showRatings: z.boolean().optional(),
  rating: z.number().optional(),
  reviewCount: z.string().optional(),
});

export const SpacerContentSchema = z.object({
  type: z.literal("spacer"),
  height: z.number(),
});

export const StatsCounterContentSchema = z.object({
  type: z.literal("stats-counter"),
  stats: z.array(StatItemSchema),
  layout: z.enum(["horizontal", "vertical", "grid"]),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
});

export const TeamCardContentSchema = z.object({
  type: z.literal("team-card"),
  name: ProseMirrorDocumentSchema,
  role: ProseMirrorDocumentSchema,
  description: ProseMirrorDocumentSchema.optional(),
  avatar: z.string().optional(),
  socials: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
});

export const TestimonialContentSchema = z.object({
  type: z.literal("testimonial"),
  quote: ProseMirrorDocumentSchema,
  name: ProseMirrorDocumentSchema,
  role: ProseMirrorDocumentSchema,
  avatar: z.string().url().optional(),
});

export const TimelineContentSchema = z.object({
  type: z.literal("timeline"),
  title: ProseMirrorDocumentSchema.optional(),
  steps: z.array(TimelineStepSchema),
});

export const VideoContentSchema = z.object({
  type: z.literal("video"),
  source: z.enum(["youtube", "vimeo", "custom"]),
  url: z.string().url(),
  thumbnail: z.string().optional(),
  autoplay: z.boolean().optional(),
  loop: z.boolean().optional(),
  title: ProseMirrorDocumentSchema.optional(),
});

// --- Master Content Union ---

export const BlockContentSchema = z.union([
  ProseMirrorDocumentSchema,
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
