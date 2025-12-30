import { BlockType, BlockContent, BLOCK_TYPES, getDefaultHeadingContent } from "@/types/presentation";

// Export everything from types
export * from "@/types/presentation";

// Individual block definitions (Only keeping the ones to stay)
import { createImageContent, normalizeImageContent } from "./image";
import { createCodeContent, normalizeCodeContent } from "./code";
import { createSpacerContent, normalizeSpacerContent } from "./spacer";
import { createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent } from "./number-card";
import { createSimpleNumberCardContent, normalizeSimpleNumberCardContent } from "./simple-number-card";
import { createLayeredNumberContent, normalizeLayeredNumberContent } from "./layered-number-block";
import { createCalloutContent, normalizeCalloutContent } from "./callout-block";
import { createSolidBoxContent, normalizeSolidBoxContent } from "./solid-box-block";
import { createSolidIconBoxContent, normalizeSolidIconBoxContent } from "./solid-icon-box-block";
import { createSidelineCardContent, normalizeSidelineCardContent } from "./sideline-card-block";

// Re-export factories and normalizers
export {
  createImageContent, normalizeImageContent,
  createCodeContent, normalizeCodeContent,
  createSpacerContent, normalizeSpacerContent,
  createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent,
  createSimpleNumberCardContent, normalizeSimpleNumberCardContent,
  createLayeredNumberContent, normalizeLayeredNumberContent,
  createCalloutContent, normalizeCalloutContent,
  createSolidBoxContent, normalizeSolidBoxContent,
  createSolidIconBoxContent, normalizeSolidIconBoxContent,
  createSidelineCardContent, normalizeSidelineCardContent,
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
    default:
      if (isMarkdownFormat(content)) {
        return content;
      } else if (isLegacyProseMirrorFormat(content)) {
        return normalizeToMarkdown(content);
      }
      return getDefaultHeadingContent();
  }
};
