import { SlidesState, Slide, Row, Block } from "@/store/slices/slidesSlice";
import { BlockType } from "@/types/presentation";

/**
 * Finds a slide by ID in the state
 */
export const findSlide = (state: SlidesState, slideId: string): Slide | undefined => {
  return state.slides.find((s) => s.id === slideId);
};

/**
 * Finds a row by ID in a slide
 */
export const findRow = (slide: Slide | undefined, rowId: string): Row | undefined => {
  return slide?.rows.find((r) => r.id === rowId);
};

/**
 * Finds a block by ID in a row
 */
export const findBlock = (row: Row | undefined, blockId: string): Block | undefined => {
  return row?.blocks.find((b) => b.id === blockId);
};

/**
 * Recalculates column widths for a row to be equal (1fr each)
 */
export const recalculateWidths = (row: Row) => {
  row.columnWidths = row.blocks.map(() => 1);
};

/**
 * Ensures a slide has at least one row
 */
export const ensureRowExists = (slide: Slide, createRowFn: () => Row) => {
  if (slide.rows.length === 0) {
    slide.rows.push(createRowFn());
  }
};
