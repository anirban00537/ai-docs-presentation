import { BlockType, BlockContent, BLOCK_TYPES, getDefaultHeadingContent } from "@/types/presentation";

// Export everything from types
export * from "@/types/presentation";

// Individual block definitions (Only keeping the ones to stay)
import { createImageContent, normalizeImageContent } from "./image";
import { createCodeContent, normalizeCodeContent } from "./code";
import { createSpacerContent, normalizeSpacerContent } from "./spacer";
import { createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent } from "./number-card";
import { createSimpleNumberCardContent, normalizeSimpleNumberCardContent } from "./simple-number-card";
import { createSpineCardContent, normalizeSpineCardContent } from "./spine-card";
import { createModernPillCardContent, normalizeModernPillCardContent } from "./modern-pill-card";
import { createInvertedImpactContent, normalizeInvertedImpactContent } from "./inverted-impact-block";
import { createGlassBillboardContent, normalizeGlassBillboardContent } from "./glass-billboard-block";
import { createLayeredNumberContent, normalizeLayeredNumberContent } from "./layered-number-block";
import { createCornerCutContent, normalizeCornerCutContent } from "./corner-cut-block";

// Re-export factories and normalizers
export {
  createImageContent, normalizeImageContent,
  createCodeContent, normalizeCodeContent,
  createSpacerContent, normalizeSpacerContent,
  createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent,
  createSimpleNumberCardContent, normalizeSimpleNumberCardContent,
  createSpineCardContent, normalizeSpineCardContent,
  createModernPillCardContent, normalizeModernPillCardContent,
  createInvertedImpactContent, normalizeInvertedImpactContent,
  createGlassBillboardContent, normalizeGlassBillboardContent,
  createLayeredNumberContent, normalizeLayeredNumberContent,
  createCornerCutContent, normalizeCornerCutContent,
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
    case BLOCK_TYPES.IMAGE:
      return createImageContent();
    case BLOCK_TYPES.CODE:
      return createCodeContent();
    case BLOCK_TYPES.SPACER:
      return createSpacerContent();
    case BLOCK_TYPES.NUMBER_CARD:
      return createNumberCardContent();
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return createSimpleNumberCardContent();
    case BLOCK_TYPES.SPINE_CARD:
      return createSpineCardContent();
    case BLOCK_TYPES.MODERN_PILL_CARD:
      return createModernPillCardContent();
    case BLOCK_TYPES.INVERTED_IMPACT_BLOCK:
      return createInvertedImpactContent();
    case BLOCK_TYPES.GLASS_BILLBOARD_BLOCK:
      return createGlassBillboardContent();
    case BLOCK_TYPES.LAYERED_NUMBER_BLOCK:
      return createLayeredNumberContent();
    case BLOCK_TYPES.CORNER_CUT_BLOCK:
      return createCornerCutContent();
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
    case BLOCK_TYPES.NUMBER_CARD:
      return normalizeNumberCardContent(content);
    case BLOCK_TYPES.SIMPLE_NUMBER_CARD:
      return normalizeSimpleNumberCardContent(content);
    case BLOCK_TYPES.SPINE_CARD:
      return normalizeSpineCardContent(content);
    case BLOCK_TYPES.MODERN_PILL_CARD:
      return normalizeModernPillCardContent(content);
    case BLOCK_TYPES.INVERTED_IMPACT_BLOCK:
      return normalizeInvertedImpactContent(content);
    case BLOCK_TYPES.GLASS_BILLBOARD_BLOCK:
      return normalizeGlassBillboardContent(content);
    case BLOCK_TYPES.LAYERED_NUMBER_BLOCK:
      return normalizeLayeredNumberContent(content);
    case BLOCK_TYPES.CORNER_CUT_BLOCK:
      return normalizeCornerCutContent(content);
    default:
      if (isMarkdownFormat(content)) {
        return content;
      } else if (isLegacyProseMirrorFormat(content)) {
        return normalizeToMarkdown(content);
      }
      return getDefaultHeadingContent();
  }
};
