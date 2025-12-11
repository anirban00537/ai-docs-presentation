// Common exports
export * from "./common";

// Block type exports
export * from "./number-card";
export * from "./testimonial";
export * from "./cta";
export * from "./quote";
export * from "./divider";
export * from "./timeline";
export * from "./team-card";
export * from "./pricing-card";
export * from "./image-gallery";

// Type unions
import type { ProseMirrorDocument } from "./common";
import type { NumberCardContent } from "./number-card";
import type { TestimonialContent } from "./testimonial";
import type { CtaContent } from "./cta";
import type { QuoteContent } from "./quote";
import type { DividerContent } from "./divider";
import type { TimelineContent } from "./timeline";
import type { TeamCardContent } from "./team-card";
import type { PricingCardContent } from "./pricing-card";
import type { ImageGalleryContent } from "./image-gallery";
import type { BlockType } from "./common";

// Factory functions
import { getDefaultHeadingContent } from "./common";
import { createNumberCardContent } from "./number-card";
import { createTestimonialContent } from "./testimonial";
import { createCtaContent } from "./cta";
import { createQuoteContent } from "./quote";
import { createDividerContent } from "./divider";
import { createTimelineContent } from "./timeline";
import { createTeamCardContent } from "./team-card";
import { createPricingCardContent } from "./pricing-card";
import { createImageGalleryContent } from "./image-gallery";
import { BLOCK_TYPES } from "./common";

// Normalization functions
import { normalizeNumberCardContent } from "./number-card";
import { normalizeTestimonialContent } from "./testimonial";
import { normalizeCtaContent } from "./cta";
import { normalizeQuoteContent } from "./quote";
import { normalizeDividerContent } from "./divider";
import { normalizeTimelineContent } from "./timeline";
import { normalizeTeamCardContent } from "./team-card";
import { normalizePricingCardContent } from "./pricing-card";
import { normalizeImageGalleryContent } from "./image-gallery";

export type BlockContent =
  | ProseMirrorDocument
  | NumberCardContent
  | TestimonialContent
  | CtaContent
  | QuoteContent
  | DividerContent
  | TimelineContent
  | TeamCardContent
  | PricingCardContent
  | ImageGalleryContent;

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
    case BLOCK_TYPES.DIVIDER:
      return createDividerContent();
    case BLOCK_TYPES.TIMELINE:
      return createTimelineContent();
    case BLOCK_TYPES.TEAM_CARD:
      return createTeamCardContent();
    case BLOCK_TYPES.PRICING_CARD:
      return createPricingCardContent();
    case BLOCK_TYPES.IMAGE_GALLERY:
      return createImageGalleryContent();
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
    case BLOCK_TYPES.DIVIDER:
      return normalizeDividerContent(content);
    case BLOCK_TYPES.TIMELINE:
      return normalizeTimelineContent(content);
    case BLOCK_TYPES.TEAM_CARD:
      return normalizeTeamCardContent(content);
    case BLOCK_TYPES.PRICING_CARD:
      return normalizePricingCardContent(content);
    case BLOCK_TYPES.IMAGE_GALLERY:
      return normalizeImageGalleryContent(content);
    default:
      // Default to prose content
      const incomingDoc = content as ProseMirrorDocument | undefined;
      if (incomingDoc?.type === "doc" && Array.isArray(incomingDoc.content)) {
        return incomingDoc;
      }
      return getDefaultHeadingContent();
  }
};

