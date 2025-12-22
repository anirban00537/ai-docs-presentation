import { BlockType, BlockContent, BLOCK_TYPES, getDefaultHeadingContent } from "@/types/presentation";

// Export everything from types
export * from "@/types/presentation";

// Individual block definitions
import { createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent } from "./number-card";
import { createTestimonialContent, normalizeTestimonialContent } from "./testimonial";
import { createCtaContent, normalizeCtaContent } from "./cta";
import { createQuoteContent, normalizeQuoteContent } from "./quote";
import { createTimelineContent, normalizeTimelineContent } from "./timeline";
import { createTeamCardContent, normalizeTeamCardContent } from "./team-card";
import { createPricingCardContent, normalizePricingCardContent } from "./pricing-card";
import { createImageGalleryContent, normalizeImageGalleryContent } from "./image-gallery";
import { createImageContent, normalizeImageContent } from "./image";
import { createStatsCounterContent, normalizeStatsCounterContent } from "./stats-counter";
import { createFeatureListContent, normalizeFeatureListContent } from "./feature-list";
import { createComparisonTableContent, normalizeComparisonTableContent } from "./comparison-table";
import { createFAQContent, normalizeFAQContent } from "./faq";
import { createLogoGridContent, normalizeLogoGridContent } from "./logo-grid";
import { createVideoContent, normalizeVideoContent } from "./video";
import { createCodeContent, normalizeCodeContent } from "./code";
import { createProgressBarContent, normalizeProgressBarContent } from "./progress-bar";
import { createSocialProofContent, normalizeSocialProofContent } from "./social-proof";
import { createBadgeContent, normalizeBadgeContent } from "./badge";
import { createSimpleNumberCardContent, normalizeSimpleNumberCardContent } from "./simple-number-card";
import { createCodeTerminalContent, normalizeCodeTerminalContent } from "./code-terminal";
import { createPulseMetricContent, normalizePulseMetricContent } from "./pulse-metric";
import { createGlassInsightContent, normalizeGlassInsightContent } from "./glass-insight";
import { createSpacerContent, normalizeSpacerContent } from "./spacer";

// Re-export factories and normalizers
export {
  createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent,
  createTestimonialContent, normalizeTestimonialContent,
  createCtaContent, normalizeCtaContent,
  createQuoteContent, normalizeQuoteContent,
  createTimelineContent, normalizeTimelineContent,
  createTeamCardContent, normalizeTeamCardContent,
  createPricingCardContent, normalizePricingCardContent,
  createImageGalleryContent, normalizeImageGalleryContent,
  createImageContent, normalizeImageContent,
  createStatsCounterContent, normalizeStatsCounterContent,
  createFeatureListContent, normalizeFeatureListContent,
  createComparisonTableContent, normalizeComparisonTableContent,
  createFAQContent, normalizeFAQContent,
  createLogoGridContent, normalizeLogoGridContent,
  createVideoContent, normalizeVideoContent,
  createCodeContent, normalizeCodeContent,
  createProgressBarContent, normalizeProgressBarContent,
  createSocialProofContent, normalizeSocialProofContent,
  createBadgeContent, normalizeBadgeContent,
  createSimpleNumberCardContent, normalizeSimpleNumberCardContent,
  createCodeTerminalContent, normalizeCodeTerminalContent,
  createPulseMetricContent, normalizePulseMetricContent,
  createGlassInsightContent, normalizeGlassInsightContent,
  createSpacerContent, normalizeSpacerContent,
};

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
    case BLOCK_TYPES.SPACER:
      return createSpacerContent();
    case BLOCK_TYPES.PROSEMIRROR:
    default:
      return getDefaultHeadingContent();
  }
};

export const normalizeBlockContent = (
  type: BlockType | undefined,
  content: unknown
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
    case BLOCK_TYPES.SPACER:
      return normalizeSpacerContent(content);
    default:
      if (isMarkdownFormat(content)) {
        return content;
      } else if (isLegacyProseMirrorFormat(content)) {
        return normalizeToMarkdown(content);
      }
      return getDefaultHeadingContent();
  }
};
