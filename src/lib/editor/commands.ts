import {
  addBlockToRow,
  addRowAtTop,
  addRowWithColumns,
  deleteRow,
  moveBlock,
  reorderBlocksInRow,
  updateBlockContent,
  updateColumnWidths,
} from "@/store/slices/slidesSlice";

type Dispatch = (action: any) => void;

export interface EditorCommandBus {
  updateBlock: (params: {
    slideId: string;
    blockId: string;
    content: any;
  }) => void;
  addBlockAfter: (params: {
    slideId: string;
    rowId: string;
    afterBlockId?: string;
    blockType?: string;
  }) => void;
  addRowAtTop: (params: { slideId: string; columnCount?: number }) => void;
  addRowWithColumns: (params: {
    slideId: string;
    columnCount: number;
    blockType?: string;
  }) => void;
  deleteRow: (params: { slideId: string; rowId: string }) => void;
  moveBlock: (params: {
    slideId: string;
    sourceRowId: string;
    targetRowId: string;
    blockId: string;
    targetBlockId?: string;
  }) => void;
  reorderBlocksInRow: (params: {
    slideId: string;
    rowId: string;
    oldIndex: number;
    newIndex: number;
  }) => void;
  updateColumnWidths: (params: {
    slideId: string;
    rowId: string;
    columnWidths: number[];
  }) => void;
}

export const createEditorCommandBus = (dispatch: Dispatch): EditorCommandBus => ({
  updateBlock: ({ slideId, blockId, content }) =>
    dispatch(updateBlockContent({ slideId, blockId, content })),
  addBlockAfter: ({ slideId, rowId, afterBlockId, blockType }) =>
    dispatch(addBlockToRow({ slideId, rowId, afterBlockId, blockType })),
  addRowAtTop: ({ slideId, columnCount = 1 }) =>
    dispatch(addRowAtTop({ slideId, columnCount })),
  addRowWithColumns: ({ slideId, columnCount, blockType }) =>
    dispatch(addRowWithColumns({ slideId, columnCount, blockType })),
  deleteRow: ({ slideId, rowId }) => dispatch(deleteRow({ slideId, rowId })),
  moveBlock: ({ slideId, sourceRowId, targetRowId, blockId, targetBlockId }) =>
    dispatch(moveBlock({ slideId, sourceRowId, targetRowId, blockId, targetBlockId })),
  reorderBlocksInRow: ({ slideId, rowId, oldIndex, newIndex }) =>
    dispatch(reorderBlocksInRow({ slideId, rowId, oldIndex, newIndex })),
  updateColumnWidths: ({ slideId, rowId, columnWidths }) =>
    dispatch(updateColumnWidths({ slideId, rowId, columnWidths })),
});

