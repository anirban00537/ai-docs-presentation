
import { Icon } from "@tabler/icons-react";

// --- Block Types ---
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

export type BlockType = (typeof BLOCK_TYPES)[keyof typeof BLOCK_TYPES];

export const MAX_BLOCKS_PER_ROW = 3;

// ProseMirrorDocument is a Markdown string
export type ProseMirrorDocument = string;

export const createParagraphContent = (text: string = ""): ProseMirrorDocument => {
  return text || "";
};

export const withAlpha = (color: string, opacity: number): string => {
  if (color.startsWith("#")) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  return color;
};

export const getDefaultHeadingContent = (): ProseMirrorDocument => "# ";

// --- Block Content Interfaces ---

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
  style?: "centered" | "minimal";
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

// --- Core Data Structures ---
export interface Block<T = BlockContent> {
  id: string;
  type?: BlockType;
  content: T;
}

export interface Row {
  id: string;
  blocks: Block[];
  columnWidths?: number[];
}

export interface Slide {
  id: string;
  rows: Row[];
}

export interface PresentationInfo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  version: number;
  parentId: string | null;
  forkedFrom: string | null;
  sharedWith: string[];
  ownerId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string | null;
}

// --- Theme Types ---
export type CardDesignPattern =
  | "none"
  | "gaussian"
  | "fractal"
  | "fluid"
  | "prism"
  | "beams"
  | "aurora"
  | "nebula"
  | "ether"
  | "lumina"
  | "horizon"
  | "pulse"
  | "vortex"
  | "echo"
  | "apex"
  | "arch";

export interface Theme {
  primary: string;
  secondaryColors?: string[];
  headingColor: string;
  bodyColor: string;
  cardBackground: string;
  pageBackground: string;
  fontFamily?: string;
  themeType?: "light" | "dark";

  // Card customization
  cardDesignPattern?: CardDesignPattern;
  cardDesignPatternOpacity?: number;
  borderColor?: string;
  cardBorderRadius?: string;
  cardBoxShadow?: string;
  cardBorderWidth?: string;
  cardBorderStyle?: string;
  cardBackdropBlur?: string;
  cardOpacity?: number;

  // Texture & Overlays
  cardNoiseOpacity?: number;
  cardVignetteOpacity?: number;
}

// --- Editor UI Types ---
export interface LayoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: string | Icon;
  getRows: () => Row[];
}
