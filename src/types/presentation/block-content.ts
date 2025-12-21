import { ProseMirrorDocument } from "./utils";

export interface BadgeItem {
  icon?: string;
  title: ProseMirrorDocument;
  description?: ProseMirrorDocument;
  issuer?: ProseMirrorDocument;
  date?: string;
}

export interface BadgeContent {
  type: "badge";
  badges: BadgeItem[];
  layout: "grid" | "list";
}

export interface CodeTerminalContent {
  type: "code-terminal";
  command: string;
  output: string;
}

export interface CodeContent {
  type: "code";
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  theme?: "light" | "dark";
}

export interface ComparisonColumn {
  name: ProseMirrorDocument;
  price?: ProseMirrorDocument;
}

export interface ComparisonRow {
  feature: ProseMirrorDocument;
  values: (boolean | string | ProseMirrorDocument)[];
}

export interface ComparisonTableContent {
  type: "comparison-table";
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

export interface CtaContent {
  type: "cta";
  heading: ProseMirrorDocument;
  body: ProseMirrorDocument;
  buttonLabel: string;
  buttonLink?: string;
}

export interface FAQItem {
  question: ProseMirrorDocument;
  answer: ProseMirrorDocument;
  expanded?: boolean;
}

export interface FAQContent {
  type: "faq";
  items: FAQItem[];
  style: "accordion" | "list";
}

export interface FeatureItem {
  icon: string;
  title: ProseMirrorDocument;
  description: ProseMirrorDocument;
}

export interface FeatureListContent {
  type: "feature-list";
  features: FeatureItem[];
  layout: "grid" | "list";
  columns?: 2 | 3 | 4;
}

export interface GlassInsightContent {
  type: "glass-insight";
  icon: string;
  editorContent: ProseMirrorDocument;
}

export interface GalleryImage {
  id: string;
  url: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface ImageGalleryContent {
  type: "image-gallery";
  images: GalleryImage[];
  layout: "grid" | "masonry";
  columns: 2 | 3 | 4;
}

export interface ImageContent {
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
  attribution?: {
    name: string;
    link: string;
  };
  objectFit?: "cover" | "contain" | "fill";
}

export interface LogoItem {
  image?: string;
  name: ProseMirrorDocument;
  link?: string;
}

export interface LogoGridContent {
  type: "logo-grid";
  logos: LogoItem[];
  columns: 3 | 4 | 5 | 6;
  grayscale?: boolean;
}

export interface NumberCardContent {
  type: "number-card";
  icon?: string;
  number?: number;
  size?: "small" | "medium" | "large";
  editorContent: ProseMirrorDocument;
}

export interface PricingFeature {
  text: ProseMirrorDocument;
  included: boolean;
}

export interface PricingCardContent {
  type: "pricing-card";
  planName: ProseMirrorDocument;
  price: ProseMirrorDocument;
  features: PricingFeature[];
  buttonLabel: string;
}

export interface ProgressItem {
  label: ProseMirrorDocument;
  value: number;
  color?: string;
}

export interface ProgressBarContent {
  type: "progress-bar";
  items: ProgressItem[];
  showPercentage?: boolean;
  animated?: boolean;
}

export interface PulseMetricContent {
  type: "pulse-metric";
  value: string;
  label: string;
  trend: "up" | "down" | "neutral";
  sparklineType?: "smooth" | "step" | "linear" | "bars";
}

export interface QuoteContent {
  type: "quote";
  quote: ProseMirrorDocument;
  author: ProseMirrorDocument;
  style?: "centered" | "minimal" | "left-aligned";
}

export interface SimpleNumberCardContent {
  type: "simple-number-card";
  number: number;
  editorContent: ProseMirrorDocument;
}

export interface SocialPlatform {
  platform: "twitter" | "linkedin" | "facebook" | "instagram" | "youtube";
  followers: string;
  link?: string;
}

export interface SocialProofContent {
  type: "social-proof";
  platforms: SocialPlatform[];
  showRatings?: boolean;
  rating?: number;
  reviewCount?: string;
}

export interface SpacerContent {
  type: "spacer";
  height: number;
}

export interface StatItem {
  value: number;
  label: ProseMirrorDocument;
  icon?: string;
  prefix?: string;
  suffix?: string;
  color?: string;
}

export interface StatsCounterContent {
  type: "stats-counter";
  stats: StatItem[];
  layout: "horizontal" | "vertical" | "grid";
  columns?: 2 | 3 | 4;
}

export interface TeamCardContent {
  type: "team-card";
  name: ProseMirrorDocument;
  role: ProseMirrorDocument;
  description?: ProseMirrorDocument;
  avatar?: string;
  socials?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface TestimonialContent {
  type: "testimonial";
  quote: ProseMirrorDocument;
  name: ProseMirrorDocument;
  role: ProseMirrorDocument;
  avatar?: string;
}

export interface TimelineStep {
  title: ProseMirrorDocument;
  description: ProseMirrorDocument;
  icon?: string;
}

export interface TimelineContent {
  type: "timeline";
  title?: ProseMirrorDocument;
  steps: TimelineStep[];
}

export interface VideoContent {
  type: "video";
  source: "youtube" | "vimeo" | "custom";
  url: string;
  thumbnail?: string;
  autoplay?: boolean;
  loop?: boolean;
  title?: ProseMirrorDocument;
}

export type BlockContent =
  | ProseMirrorDocument
  | BadgeContent
  | CodeTerminalContent
  | CodeContent
  | ComparisonTableContent
  | CtaContent
  | FAQContent
  | FeatureListContent
  | GlassInsightContent
  | ImageGalleryContent
  | ImageContent
  | LogoGridContent
  | NumberCardContent
  | PricingCardContent
  | ProgressBarContent
  | PulseMetricContent
  | QuoteContent
  | SimpleNumberCardContent
  | SocialProofContent
  | SpacerContent
  | StatsCounterContent
  | TeamCardContent
  | TestimonialContent
  | TimelineContent
  | VideoContent;
