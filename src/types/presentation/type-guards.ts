/**
 * Type guards for discriminated union block content types
 * These provide type-safe runtime checks for block content
 */

import type {
  BlockContent,
  BadgeContent,
  CodeTerminalContent,
  CodeContent,
  ComparisonTableContent,
  CtaContent,
  FAQContent,
  FeatureListContent,
  GlassInsightContent,
  ImageGalleryContent,
  ImageContent,
  LogoGridContent,
  NumberCardContent,
  PricingCardContent,
  ProgressBarContent,
  PulseMetricContent,
  QuoteContent,
  SimpleNumberCardContent,
  SocialProofContent,
  SpacerContent,
  StatsCounterContent,
  TeamCardContent,
  TestimonialContent,
  TimelineContent,
  VideoContent,
  ProseMirrorDocument,
} from "./schemas";

// Type guard for string content (ProseMirror markdown)
export const isProseMirrorDocument = (
  content: BlockContent
): content is ProseMirrorDocument => {
  return typeof content === "string";
};

// Type guard helper for checking object content type discriminator
const hasType = (
  content: BlockContent,
  type: string
): boolean => {
  return (
    typeof content === "object" &&
    content !== null &&
    "type" in content &&
    content.type === type
  );
};

// Individual type guards for each block content type
export const isBadgeContent = (
  content: BlockContent
): content is BadgeContent => hasType(content, "badge");

export const isCodeTerminalContent = (
  content: BlockContent
): content is CodeTerminalContent => hasType(content, "code-terminal");

export const isCodeContent = (content: BlockContent): content is CodeContent =>
  hasType(content, "code");

export const isComparisonTableContent = (
  content: BlockContent
): content is ComparisonTableContent => hasType(content, "comparison-table");

export const isCtaContent = (content: BlockContent): content is CtaContent =>
  hasType(content, "cta");

export const isFAQContent = (content: BlockContent): content is FAQContent =>
  hasType(content, "faq");

export const isFeatureListContent = (
  content: BlockContent
): content is FeatureListContent => hasType(content, "feature-list");

export const isGlassInsightContent = (
  content: BlockContent
): content is GlassInsightContent => hasType(content, "glass-insight");

export const isImageGalleryContent = (
  content: BlockContent
): content is ImageGalleryContent => hasType(content, "image-gallery");

export const isImageContent = (
  content: BlockContent
): content is ImageContent => hasType(content, "image");

export const isLogoGridContent = (
  content: BlockContent
): content is LogoGridContent => hasType(content, "logo-grid");

export const isNumberCardContent = (
  content: BlockContent
): content is NumberCardContent => hasType(content, "number-card");

export const isPricingCardContent = (
  content: BlockContent
): content is PricingCardContent => hasType(content, "pricing-card");

export const isProgressBarContent = (
  content: BlockContent
): content is ProgressBarContent => hasType(content, "progress-bar");

export const isPulseMetricContent = (
  content: BlockContent
): content is PulseMetricContent => hasType(content, "pulse-metric");

export const isQuoteContent = (
  content: BlockContent
): content is QuoteContent => hasType(content, "quote");

export const isSimpleNumberCardContent = (
  content: BlockContent
): content is SimpleNumberCardContent => hasType(content, "simple-number-card");

export const isSocialProofContent = (
  content: BlockContent
): content is SocialProofContent => hasType(content, "social-proof");

export const isSpacerContent = (
  content: BlockContent
): content is SpacerContent => hasType(content, "spacer");

export const isStatsCounterContent = (
  content: BlockContent
): content is StatsCounterContent => hasType(content, "stats-counter");

export const isTeamCardContent = (
  content: BlockContent
): content is TeamCardContent => hasType(content, "team-card");

export const isTestimonialContent = (
  content: BlockContent
): content is TestimonialContent => hasType(content, "testimonial");

export const isTimelineContent = (
  content: BlockContent
): content is TimelineContent => hasType(content, "timeline");

export const isVideoContent = (
  content: BlockContent
): content is VideoContent => hasType(content, "video");

/**
 * Get the block content type discriminator
 * Returns the type string for objects or 'prosemirror' for string content
 */
export const getBlockContentType = (
  content: BlockContent
): string => {
  if (typeof content === "string") {
    return "prosemirror";
  }
  if (
    typeof content === "object" &&
    content !== null &&
    "type" in content &&
    typeof content.type === "string"
  ) {
    return content.type;
  }
  return "unknown";
};
