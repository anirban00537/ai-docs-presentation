import type { Slide as ReduxSlide, Block, Row } from "@/types/presentation";
import { BLOCK_TYPES } from "@/app/(protected)/presentation/[id]/editor/blocks/definitions";

/**
 * Migration helper for block content. 
 * Now that we support both Markdown and original ProseMirror JSON, 
 * we mostly preserve the content as-is.
 */
function migrateBlockContent(block: Block): Block {
  // If it's a ProseMirror block, we now accept both string (markdown) and object (JSON)
  // No forced conversion is needed anymore.
  return block;
}

/**
 * Recursively migrate all blocks in a row
 */
function migrateRow(row: Row): Row {
  return {
    ...row,
    blocks: Array.isArray(row.blocks) ? row.blocks.map(migrateBlockContent) : [],
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
    accent: apiSlide.data?.accent,
  };
};

/**
 * Convert Redux slide format to API format
 * Note: Content is already in Markdown format at this point, so no conversion needed
 */
export const convertReduxSlideToApi = (reduxSlide: ReduxSlide): any => ({
  data: {
    rows: reduxSlide.rows,
    accent: reduxSlide.accent,
  },
});
