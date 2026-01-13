import { CardsState, Card, Row, Block } from "@/store/slices/cardsSlice";
import { BlockType } from "@/types/docs";

/**
 * Finds a card by ID in the state
 */
export const findCard = (state: CardsState, cardId: string): Card | undefined => {
  return state.cards.find((c) => c.id === cardId);
};

/**
 * Finds a row by ID in a card
 */
export const findRow = (card: Card | undefined, rowId: string): Row | undefined => {
  return card?.rows.find((r) => r.id === rowId);
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
 * Ensures a card has at least one row
 */
export const ensureRowExists = (card: Card, createRowFn: () => Row) => {
  if (card.rows.length === 0) {
    card.rows.push(createRowFn());
  }
};
