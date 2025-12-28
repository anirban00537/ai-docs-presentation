import { BlockType, BlockContent, BLOCK_TYPES, getDefaultHeadingContent } from "@/types/presentation";

// Export everything from types
export * from "@/types/presentation";

// Individual block definitions (Only keeping the ones to stay)
import { createImageContent, normalizeImageContent } from "./image";
import { createCodeContent, normalizeCodeContent } from "./code";
import { createSpacerContent, normalizeSpacerContent } from "./spacer";
import { createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent } from "./number-card";
import { createSimpleNumberCardContent, normalizeSimpleNumberCardContent } from "./simple-number-card";

// Re-export factories and normalizers
export {
  createImageContent, normalizeImageContent,
  createCodeContent, normalizeCodeContent,
  createSpacerContent, normalizeSpacerContent,
  createNumberCardContent, normalizeNumberCardContent, getDefaultNumberCardEditorContent,
  createSimpleNumberCardContent, normalizeSimpleNumberCardContent,
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
    default:
      if (isMarkdownFormat(content)) {
        return content;
      } else if (isLegacyProseMirrorFormat(content)) {
        return normalizeToMarkdown(content);
      }
      return getDefaultHeadingContent();
  }
};
