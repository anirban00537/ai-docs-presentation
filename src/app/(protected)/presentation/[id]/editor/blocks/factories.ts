import { nanoid } from "nanoid";
import type { Block, Row, Slide } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  MAX_BLOCKS_PER_ROW,
  type BlockType,
  createBlockContentForType,
} from "./definitions";

export const createBlockInstance = (
  type: BlockType | undefined = BLOCK_TYPES.PROSEMIRROR,
  content?: any
): Block => ({
  id: nanoid(),
  type,
  content: content ?? createBlockContentForType(type),
});

export const createRow = (blocks?: Block[]): Row => {
  const rowBlocks = blocks?.length ? blocks : [createBlockInstance()];
  // Initialize equal column widths as fractional units (fr) for CSS Grid
  const columnWidths = rowBlocks.map(() => 1);
  return {
    id: nanoid(),
    blocks: rowBlocks,
    columnWidths,
  };
};

export const createRowWithColumns = (
  columnCount: number,
  blockType?: BlockType,
  initialContent?: any
): Row => {
  const actualCount = Math.min(columnCount, MAX_BLOCKS_PER_ROW);
  const blocks: Block[] = [];
  for (let i = 0; i < actualCount; i++) {
    blocks.push(createBlockInstance(blockType, initialContent));
  }
  return createRow(blocks);
};

export const createSlide = (): Slide => ({
  id: nanoid(),
  rows: [createRow()],
});
