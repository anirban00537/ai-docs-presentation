import type { Row } from "@/store/slices/slidesSlice";
import { BLOCK_TYPES } from "./index";

/**
 * Detects the block type from a row
 * Returns the block type if all blocks have the same type, otherwise returns default
 */
export const detectRowBlockType = (
  row: Row,
  defaultType: string = BLOCK_TYPES.PROSEMIRROR
): string => {
  if (!row.blocks || row.blocks.length === 0) {
    return defaultType;
  }

  const firstBlockType = row.blocks[0]?.type || defaultType;
  const allSameType = row.blocks.every(
    (block) => (block.type || defaultType) === firstBlockType
  );

  return allSameType ? firstBlockType : defaultType;
};
