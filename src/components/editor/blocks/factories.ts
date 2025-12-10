import { nanoid } from "nanoid";
import type { Block, Row, Slide } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  MAX_BLOCKS_PER_ROW,
  type BlockType,
  createBlockContentForType,
} from "./definitions";

export const createBlockInstance = (
  type: BlockType | undefined = BLOCK_TYPES.PROSEMIRROR
): Block => ({
  id: nanoid(),
  type,
  content: createBlockContentForType(type),
});

export const createRow = (blocks?: Block[]): Row => ({
  id: nanoid(),
  blocks: blocks?.length ? blocks : [createBlockInstance()],
});

export const createRowWithColumns = (
  columnCount: number,
  blockType?: BlockType
): Row => {
  const actualCount = Math.min(columnCount, MAX_BLOCKS_PER_ROW);
  const blocks: Block[] = [];
  for (let i = 0; i < actualCount; i++) {
    blocks.push(createBlockInstance(blockType));
  }
  return createRow(blocks);
};

export const createSlide = (): Slide => ({
  id: nanoid(),
  rows: [createRow()],
});

