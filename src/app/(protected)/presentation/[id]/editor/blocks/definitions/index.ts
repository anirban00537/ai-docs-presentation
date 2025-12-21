// Common exports
export * from "@/types/presentation";
import { BlockType, BlockContent } from "@/types/presentation";

// Block type exports
export * from "./simple-number-card";
export * from "./code-terminal";
export * from "./pulse-metric";
export * from "./glass-insight";
export * from "./spacer";
export * from "./number-card";
export * from "./testimonial";
export * from "./cta";
export * from "./quote";
export * from "./timeline";
export * from "./team-card";
export * from "./pricing-card";
export * from "./image-gallery";
export * from "./image";
export * from "./stats-counter";
export * from "./feature-list";
export * from "./comparison-table";
export * from "./faq";
export * from "./logo-grid";
export * from "./video";
export * from "./code";
export * from "./progress-bar";
export * from "./social-proof";
export * from "./badge";

// Factory functions
import { getDefaultHeadingContent } from "@/types/presentation";
import { createNumberCardContent } from "./number-card";
import { createTestimonialContent } from "./testimonial";
import { createCtaContent } from "./cta";
import { createQuoteContent } from "./quote";
import { createTimelineContent } from "./timeline";
import { createTeamCardContent } from "./team-card";
import { createPricingCardContent } from "./pricing-card";
import { createImageGalleryContent } from "./image-gallery";
import { createImageContent } from "./image";
import { createStatsCounterContent } from "./stats-counter";
import { createFeatureListContent } from "./feature-list";
import { createComparisonTableContent } from "./comparison-table";
import { createFAQContent } from "./faq";
import { createLogoGridContent } from "./logo-grid";
import { createVideoContent } from "./video";
import { createCodeContent } from "./code";
import { createProgressBarContent } from "./progress-bar";
import { createSocialProofContent } from "./social-proof";
import { createBadgeContent } from "./badge";
import { createSimpleNumberCardContent } from "./simple-number-card";
import { createCodeTerminalContent } from "./code-terminal";
import { createPulseMetricContent } from "./pulse-metric";
import { createGlassInsightContent } from "./glass-insight";
import { BLOCK_TYPES } from "@/types/presentation";

// Normalization functions
import { normalizeNumberCardContent } from "./number-card";
import { normalizeTestimonialContent } from "./testimonial";
import { normalizeCtaContent } from "./cta";
import { normalizeQuoteContent } from "./quote";
import { normalizeTimelineContent } from "./timeline";
import { normalizeTeamCardContent } from "./team-card";
import { normalizePricingCardContent } from "./pricing-card";
import { normalizeImageGalleryContent } from "./image-gallery";
import { normalizeImageContent } from "./image";
import { normalizeStatsCounterContent } from "./stats-counter";
import { normalizeFeatureListContent } from "./feature-list";
import { normalizeComparisonTableContent } from "./comparison-table";
import { normalizeFAQContent } from "./faq";
import { normalizeLogoGridContent } from "./logo-grid";
import { normalizeVideoContent } from "./video";
import { normalizeCodeContent } from "./code";
import { normalizeProgressBarContent } from "./progress-bar";
import { normalizeSocialProofContent } from "./social-proof";
import { normalizeBadgeContent } from "./badge";
import { normalizeSimpleNumberCardContent } from "./simple-number-card";
import { normalizeCodeTerminalContent } from "./code-terminal";
import { normalizePulseMetricContent } from "./pulse-metric";
import { normalizeGlassInsightContent } from "./glass-insight";


import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
  isMarkdownFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createBlockContentForType = (
  type: BlockType | undefined
): BlockContent => {
  switch (type) {
    case BLOCK_TYPES.NUMBER_CARD:
      return createNumberCardContent();
    case BLOCK_TYPES.TESTIMONIAL:
      return createTestimonialContent();
    case BLOCK_TYPES.CTA:
      return createCtaContent();
    case BLOCK_TYPES.QUOTE:
      return createQuoteContent();
    case BLOCK_TYPES.TIMELINE:
      return createTimelineContent();
    case BLOCK_TYPES.TEAM_CARD:
      return createTeamCardContent();
    case BLOCK_TYPES.PRICING_CARD:
      return createPricingCardContent();
    case BLOCK_TYPES.IMAGE_GALLERY:
      return createImageGalleryContent();
    case BLOCK_TYPES.IMAGE:
      return createImageContent();
    case BLOCK_TYPES.STATS_COUNTER:
      return createStatsCounterContent();
    case BLOCK_TYPES.FEATURE_LIST:
      return createFeatureListContent();
    case BLOCK_TYPES.COMPARISON_TABLE:
      return createComparisonTableContent();
    case BLOCK_TYPES.FAQ:
      return createFAQContent();
    case BLOCK_TYPES.LOGO_GRID:
      return createLogoGridContent();
    case BLOCK_TYPES.VIDEO:
      return createVideoContent();
    case BLOCK_TYPES.CODE:
      return createCodeContent();
    case BLOCK_TYPES.PROGRESS_BAR:
      return createProgressBarContent();
    case BLOCK_TYPES.SOCIAL_PROOF:
      return createSocialProofContent();
    case BLOCK_TYPES.BADGE:
      return createBadgeContent();
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return createSimpleNumberCardContent();
    case BLOCK_TYPES.CODE_TERMINAL:
      return createCodeTerminalContent();
    case BLOCK_TYPES.PULSE_METRIC:
      return createPulseMetricContent();
    case BLOCK_TYPES.GLASS_INSIGHT:
      return createGlassInsightContent();
    case BLOCK_TYPES.PROSEMIRROR:
    default:
      return getDefaultHeadingContent();
  }
};

export const normalizeBlockContent = (
  type: BlockType | undefined,
  content: any
): BlockContent => {
  switch (type) {
    case BLOCK_TYPES.NUMBER_CARD:
      return normalizeNumberCardContent(content);
    case BLOCK_TYPES.TESTIMONIAL:
      return normalizeTestimonialContent(content);
    case BLOCK_TYPES.CTA:
      return normalizeCtaContent(content);
    case BLOCK_TYPES.QUOTE:
      return normalizeQuoteContent(content);
    case BLOCK_TYPES.TIMELINE:
      return normalizeTimelineContent(content);
    case BLOCK_TYPES.TEAM_CARD:
      return normalizeTeamCardContent(content);
    case BLOCK_TYPES.PRICING_CARD:
      return normalizePricingCardContent(content);
    case BLOCK_TYPES.IMAGE_GALLERY:
      return normalizeImageGalleryContent(content);
    case BLOCK_TYPES.IMAGE:
      return normalizeImageContent(content);
    case BLOCK_TYPES.STATS_COUNTER:
      return normalizeStatsCounterContent(content);
    case BLOCK_TYPES.FEATURE_LIST:
      return normalizeFeatureListContent(content);
    case BLOCK_TYPES.COMPARISON_TABLE:
      return normalizeComparisonTableContent(content);
    case BLOCK_TYPES.FAQ:
      return normalizeFAQContent(content);
    case BLOCK_TYPES.LOGO_GRID:
      return normalizeLogoGridContent(content);
    case BLOCK_TYPES.VIDEO:
      return normalizeVideoContent(content);
    case BLOCK_TYPES.CODE:
      return normalizeCodeContent(content);
    case BLOCK_TYPES.PROGRESS_BAR:
      return normalizeProgressBarContent(content);
    case BLOCK_TYPES.SOCIAL_PROOF:
      return normalizeSocialProofContent(content);
    case BLOCK_TYPES.BADGE:
      return normalizeBadgeContent(content);
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return normalizeSimpleNumberCardContent(content);
    case BLOCK_TYPES.CODE_TERMINAL:
      return normalizeCodeTerminalContent(content);
    case BLOCK_TYPES.PULSE_METRIC:
      return normalizePulseMetricContent(content);
    case BLOCK_TYPES.GLASS_INSIGHT:
      return normalizeGlassInsightContent(content);
    default:
      // Default to prose content (prosemirror blocks)
      // Handle both Markdown string (new format) and legacy JSON object
      if (isMarkdownFormat(content)) {
        // Already in Markdown format
        return content;
      } else if (isLegacyProseMirrorFormat(content)) {
        // Legacy JSON format - convert to Markdown
        return normalizeToMarkdown(content);
      }
      // Invalid or empty content - return default
      return getDefaultHeadingContent();
  }
};
