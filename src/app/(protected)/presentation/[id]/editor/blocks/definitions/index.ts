// Common exports
export * from "./common";

// Block type exports
export * from "./simple-number-card";
export * from "./number-card";
export * from "./testimonial";
export * from "./cta";
export * from "./quote";
export * from "./timeline";
export * from "./team-card";
export * from "./pricing-card";
export * from "./image-gallery";
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

// Type unions
import type { ProseMirrorDocument } from "./common";
import type { NumberCardContent } from "./number-card";
import type { TestimonialContent } from "./testimonial";
import type { CtaContent } from "./cta";
import type { QuoteContent } from "./quote";
import type { TimelineContent } from "./timeline";
import type { TeamCardContent } from "./team-card";
import type { PricingCardContent } from "./pricing-card";
import type { ImageGalleryContent } from "./image-gallery";
import type { StatsCounterContent } from "./stats-counter";
import type { FeatureListContent } from "./feature-list";
import type { ComparisonTableContent } from "./comparison-table";
import type { FAQContent } from "./faq";
import type { LogoGridContent } from "./logo-grid";
import type { VideoContent } from "./video";
import type { CodeContent } from "./code";
import type { ProgressBarContent } from "./progress-bar";
import type { SocialProofContent } from "./social-proof";
import type { BadgeContent } from "./badge";
import type { SimpleNumberCardContent } from "./simple-number-card";
import type { BlockType } from "./common";

// Factory functions
import { getDefaultHeadingContent } from "./common";
import { createNumberCardContent } from "./number-card";
import { createTestimonialContent } from "./testimonial";
import { createCtaContent } from "./cta";
import { createQuoteContent } from "./quote";
import { createTimelineContent } from "./timeline";
import { createTeamCardContent } from "./team-card";
import { createPricingCardContent } from "./pricing-card";
import { createImageGalleryContent } from "./image-gallery";
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
import { BLOCK_TYPES } from "./common";

// Normalization functions
import { normalizeNumberCardContent } from "./number-card";
import { normalizeTestimonialContent } from "./testimonial";
import { normalizeCtaContent } from "./cta";
import { normalizeQuoteContent } from "./quote";
import { normalizeTimelineContent } from "./timeline";
import { normalizeTeamCardContent } from "./team-card";
import { normalizePricingCardContent } from "./pricing-card";
import { normalizeImageGalleryContent } from "./image-gallery";
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

export type BlockContent =
  | ProseMirrorDocument
  | NumberCardContent
  | TestimonialContent
  | CtaContent
  | QuoteContent
  | TimelineContent
  | TeamCardContent
  | PricingCardContent
  | ImageGalleryContent
  | StatsCounterContent
  | FeatureListContent
  | ComparisonTableContent
  | FAQContent
  | LogoGridContent
  | VideoContent
  | CodeContent
  | ProgressBarContent
  | SocialProofContent
  | BadgeContent
  | SimpleNumberCardContent;

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
    default:
      // Default to prose content
      const incomingDoc = content as ProseMirrorDocument | undefined;
      if (incomingDoc?.type === "doc" && Array.isArray(incomingDoc.content)) {
        return incomingDoc;
      }
      return getDefaultHeadingContent();
  }
};
