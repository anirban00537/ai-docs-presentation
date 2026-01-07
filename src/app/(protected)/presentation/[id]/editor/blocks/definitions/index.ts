import { BlockType, BlockContent, BLOCK_TYPES, getDefaultHeadingContent } from "@/types/presentation";

// Export everything from types
export * from "@/types/presentation";

// Individual block definitions (Only keeping the ones to stay)
import { createImageContent, normalizeImageContent } from "./image";
import { createCodeContent, normalizeCodeContent } from "./code";
import { createSpacerContent, normalizeSpacerContent } from "./spacer";
import { createSimpleNumberCardContent, normalizeSimpleNumberCardContent } from "./simple-number-card";
import { createLayeredNumberContent, normalizeLayeredNumberContent } from "./layered-number-block";
import { createCalloutContent, normalizeCalloutContent } from "./callout-block";
import { createSolidBoxContent, normalizeSolidBoxContent } from "./solid-box-block";
import { createSolidIconBoxContent, normalizeSolidIconBoxContent } from "./solid-icon-box-block";
import { createSidelineCardContent, normalizeSidelineCardContent } from "./sideline-card-block";

import { createButtonBlockContent, normalizeButtonBlockContent } from "./button-block";
import { createLeafBlockContent, normalizeLeafBlockContent } from "./leaf-block";
import { createTimelineBentoContent, normalizeTimelineBentoContent } from "./timeline-bento-block";
import { createStackedTimelineContent, normalizeStackedTimelineContent } from "./stacked-timeline-block";
import { createConnectedStepsContent, normalizeConnectedStepsContent } from "./connected-steps-block";
import { createCircleStatsContent, normalizeCircleStatsContent } from "./circle-stats-block";


// Re-export factories and normalizers
export {
  createImageContent, normalizeImageContent,
  createCodeContent, normalizeCodeContent,
  createSpacerContent, normalizeSpacerContent,
  createSimpleNumberCardContent, normalizeSimpleNumberCardContent,
  createLayeredNumberContent, normalizeLayeredNumberContent,
  createCalloutContent, normalizeCalloutContent,
  createSolidBoxContent, normalizeSolidBoxContent,
  createSolidIconBoxContent, normalizeSolidIconBoxContent,
  createSidelineCardContent, normalizeSidelineCardContent,
  createButtonBlockContent, normalizeButtonBlockContent,
  createLeafBlockContent, normalizeLeafBlockContent,
  createTimelineBentoContent, normalizeTimelineBentoContent,
  createStackedTimelineContent, normalizeStackedTimelineContent,
  createConnectedStepsContent, normalizeConnectedStepsContent,
  createCircleStatsContent, normalizeCircleStatsContent,
};



export const createBlockContentForType = (
  type: BlockType | undefined
): BlockContent => {
  switch (type) {
    case BLOCK_TYPES.IMAGE:
      return createImageContent();
    case BLOCK_TYPES.CODE:
      return createCodeContent();
    case BLOCK_TYPES.SPACER:
      return createSpacerContent();
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return createSimpleNumberCardContent();
    case BLOCK_TYPES.LAYERED_NUMBER_BLOCK:
      return createLayeredNumberContent();
    case BLOCK_TYPES.CALLOUT_BLOCK:
      return createCalloutContent();
    case BLOCK_TYPES.SOLID_BOX_BLOCK:
      return createSolidBoxContent();
    case BLOCK_TYPES.SOLID_ICON_BOX_BLOCK:
      return createSolidIconBoxContent();
    case BLOCK_TYPES.SIDELINE_CARD_BLOCK:
      return createSidelineCardContent();
    case BLOCK_TYPES.BUTTON_BLOCK:
      return createButtonBlockContent();
    case BLOCK_TYPES.LEAF_BLOCK:
      return createLeafBlockContent();
    case BLOCK_TYPES.TIMELINE_BENTO_BLOCK:
      return createTimelineBentoContent();
    case BLOCK_TYPES.STACKED_TIMELINE_BLOCK:
      return createStackedTimelineContent();
    case BLOCK_TYPES.CONNECTED_STEPS_BLOCK:
      return createConnectedStepsContent();
    case BLOCK_TYPES.CIRCLE_STATS_BLOCK:
      return createCircleStatsContent();

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
    case BLOCK_TYPES.IMAGE:
      return normalizeImageContent(content);
    case BLOCK_TYPES.CODE:
      return normalizeCodeContent(content);
    case BLOCK_TYPES.SPACER:
      return normalizeSpacerContent(content);
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return normalizeSimpleNumberCardContent(content);
    case BLOCK_TYPES.LAYERED_NUMBER_BLOCK:
      return normalizeLayeredNumberContent(content);
    case BLOCK_TYPES.CALLOUT_BLOCK:
      return normalizeCalloutContent(content);
    case BLOCK_TYPES.SOLID_BOX_BLOCK:
      return normalizeSolidBoxContent(content);
    case BLOCK_TYPES.SOLID_ICON_BOX_BLOCK:
      return normalizeSolidIconBoxContent(content);
    case BLOCK_TYPES.SIDELINE_CARD_BLOCK:
      return normalizeSidelineCardContent(content);
    case BLOCK_TYPES.BUTTON_BLOCK:
      return normalizeButtonBlockContent(content);
    case BLOCK_TYPES.LEAF_BLOCK:
      return normalizeLeafBlockContent(content);
    case BLOCK_TYPES.TIMELINE_BENTO_BLOCK:
      return normalizeTimelineBentoContent(content);
    case BLOCK_TYPES.STACKED_TIMELINE_BLOCK:
      return normalizeStackedTimelineContent(content);
    case BLOCK_TYPES.CONNECTED_STEPS_BLOCK:
      return normalizeConnectedStepsContent(content);
    case BLOCK_TYPES.CIRCLE_STATS_BLOCK:
      return normalizeCircleStatsContent(content);

    default:
      if (typeof content === "string") {
        return content;
      } else if (content && typeof content === "object" && (content as any).type === "doc") {
        return content as unknown as BlockContent;
      }
      return getDefaultHeadingContent();
  }
};
