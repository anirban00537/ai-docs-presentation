import {
  addBlockToRow,
  addRow,
  repositionBlock,
  addRowAtTop,
  addRowWithColumns,
  addRowWithColumnsAtIndex,
  addCard,
  deleteRow,
  deleteCard,
  moveBlock,
  moveBlockToNewRow,
  reorderBlocksInRow,
  reorderCards,
  updateBlockContent,
  updateColumnWidths,
} from "@/store/slices/cardsSlice";

type Dispatch = (action: any) => void;

export interface EditorCommandBus {
  updateBlock: (params: {
    cardId: string;
    blockId: string;
    content: any;
  }) => void;
  addBlockAfter: (params: {
    cardId: string;
    rowId: string;
    afterBlockId?: string;
    insertIndex?: number;
    blockType?: string;
    initialContent?: any;
  }) => void;
  // Consolidated Row Actions
  addRow: (params: {
    cardId: string;
    insertAt: "top" | "bottom" | number;
    columnCount?: number;
    blockType?: string;
    initialContent?: any;
  }) => void;
  addRowAtTop: (params: { cardId: string; columnCount?: number }) => void;
  addRowWithColumns: (params: {
    cardId: string;
    columnCount: number;
    blockType?: string;
  }) => void;
  addRowWithColumnsAtIndex: (params: {
    cardId: string;
    columnCount: number;
    insertIndex: number;
    blockType?: string;
    initialContent?: any;
  }) => void;
  deleteRow: (params: { cardId: string; rowId: string }) => void;
  // Consolidated Movement Actions
  repositionBlock: (params: {
    cardId: string;
    sourceRowId: string;
    blockId: string;
    target: {
      rowId?: string;
      insertIndex?: number;
      createNewRow?: boolean;
      targetBlockId?: string;
    };
  }) => void;
  moveBlock: (params: {
    cardId: string;
    sourceRowId: string;
    targetRowId: string;
    blockId: string;
    targetBlockId?: string;
  }) => void;
  moveBlockToNewRow: (params: {
    cardId: string;
    sourceRowId: string;
    blockId: string;
    insertIndex: number;
  }) => void;
  reorderBlocksInRow: (params: {
    cardId: string;
    rowId: string;
    oldIndex: number;
    newIndex: number;
  }) => void;
  updateColumnWidths: (params: {
    cardId: string;
    rowId: string;
    columnWidths: number[];
  }) => void;
  // Card level operations
  addCard: (params: { afterCardId?: string }) => void;
  deleteCard: (params: { cardId: string }) => void;
  reorderCards: (params: { cardId: string; newIndex: number }) => void;
}

export const createEditorCommandBus = (
  dispatch: Dispatch
): EditorCommandBus => ({
  updateBlock: ({ cardId, blockId, content }) =>
    dispatch(updateBlockContent({ cardId, blockId, content })),
  addBlockAfter: ({ cardId, rowId, afterBlockId, insertIndex, blockType, initialContent }) =>
    dispatch(addBlockToRow({ cardId, rowId, afterBlockId, insertIndex, blockType, initialContent })),
  
  addRow: (params) => dispatch(addRow(params)),
  addRowAtTop: ({ cardId, columnCount = 1 }) =>
    dispatch(addRow({ cardId, insertAt: "top", columnCount })),
  addRowWithColumns: ({ cardId, columnCount, blockType }) =>
    dispatch(addRow({ cardId, insertAt: "bottom", columnCount, blockType })),
  addRowWithColumnsAtIndex: ({
    cardId,
    columnCount,
    insertIndex,
    blockType,
    initialContent,
  }) =>
    dispatch(
      addRow({ cardId, insertAt: insertIndex, columnCount, blockType, initialContent })
    ),
  deleteRow: ({ cardId, rowId }) => dispatch(deleteRow({ cardId, rowId })),

  repositionBlock: (params) => dispatch(repositionBlock(params)),
  moveBlock: ({ cardId, sourceRowId, targetRowId, blockId, targetBlockId }) =>
    dispatch(
      repositionBlock({ 
        cardId, 
        sourceRowId, 
        blockId, 
        target: { rowId: targetRowId, targetBlockId } 
      })
    ),
  moveBlockToNewRow: ({ cardId, sourceRowId, blockId, insertIndex }) =>
    dispatch(
      repositionBlock({ 
        cardId, 
        sourceRowId, 
        blockId, 
        target: { createNewRow: true, insertIndex } 
      })
    ),
  reorderBlocksInRow: ({ cardId, rowId, oldIndex, newIndex }) =>
    dispatch(reorderBlocksInRow({ cardId, rowId, oldIndex, newIndex })),
  updateColumnWidths: ({ cardId, rowId, columnWidths }) =>
    dispatch(updateColumnWidths({ cardId, rowId, columnWidths })),
  addCard: ({ afterCardId }) => dispatch(addCard({ afterCardId })),
  deleteCard: ({ cardId }) => dispatch(deleteCard(cardId)),
  reorderCards: ({ cardId, newIndex }) => dispatch(reorderCards({ cardId, newIndex })),
});
