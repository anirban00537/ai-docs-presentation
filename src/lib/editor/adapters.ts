import type { Slide as ReduxSlide, Block, Row } from "@/types/presentation";
import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
  isMarkdownFormat,
} from "@/lib/markdown/prosemirror-converter";
import { BLOCK_TYPES } from "@/app/(protected)/presentation/[id]/editor/block/blocks/definitions";

/**
 * Migrate a single block's content from legacy JSON to Markdown if needed
 */
function migrateBlockContent(block: Block): Block {
  // Check if this is a prosemirror block (default type or explicitly prosemirror)
  const isProseMirrorBlock =
    !block.type || block.type === BLOCK_TYPES.PROSEMIRROR;

  if (isProseMirrorBlock && block.content) {
    // If content is already Markdown, keep it
    if (isMarkdownFormat(block.content)) {
      return block;
    }

    // If content is legacy JSON format, convert to Markdown
    if (isLegacyProseMirrorFormat(block.content)) {
      return {
        ...block,
        content: normalizeToMarkdown(block.content),
      };
    }
  }

  return block;
}

/**
 * Recursively migrate all blocks in a row
 */
function migrateRow(row: Row): Row {
  return {
    ...row,
    blocks: row.blocks.map(migrateBlockContent),
  };
}

/**
 * Convert API slide format to Redux format, migrating legacy ProseMirror JSON to Markdown
 */
export const convertApiSlideToRedux = (apiSlide: any): ReduxSlide => {
  const rows = (apiSlide.data?.rows || []).map(migrateRow);
  return {
    id: apiSlide.id,
    rows,
  };
};

/**
 * Convert Redux slide format to API format
 * Note: Content is already in Markdown format at this point, so no conversion needed
 */
export const convertReduxSlideToApi = (reduxSlide: ReduxSlide): any => ({
  data: {
    rows: reduxSlide.rows,
  },
});
