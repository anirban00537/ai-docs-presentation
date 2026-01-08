import {
  addBlockToRow,
  addRowAtTop,
  addRowWithColumns,
  addRowWithColumnsAtIndex,
  addSlide,
  deleteRow,
  deleteSlide,
  moveBlock,
  moveBlockToNewRow,
  reorderBlocksInRow,
  reorderSlides,
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
    insertIndex?: number;
    blockType?: string;
    initialContent?: any;
  }) => void;
  addRowAtTop: (params: { slideId: string; columnCount?: number }) => void;
  addRowWithColumns: (params: {
    slideId: string;
    columnCount: number;
    blockType?: string;
  }) => void;
  addRowWithColumnsAtIndex: (params: {
    slideId: string;
    columnCount: number;
    insertIndex: number;
    blockType?: string;
    initialContent?: any;
  }) => void;
  deleteRow: (params: { slideId: string; rowId: string }) => void;
  moveBlock: (params: {
    slideId: string;
    sourceRowId: string;
    targetRowId: string;
    blockId: string;
    targetBlockId?: string;
  }) => void;
  moveBlockToNewRow: (params: {
    slideId: string;
    sourceRowId: string;
    blockId: string;
    insertIndex: number;
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
  // Slide level operations
  addSlide: (params: { afterSlideId?: string }) => void;
  deleteSlide: (params: { slideId: string }) => void;
  reorderSlides: (params: { slideId: string; newIndex: number }) => void;
}

export const createEditorCommandBus = (
  dispatch: Dispatch
): EditorCommandBus => ({
  updateBlock: ({ slideId, blockId, content }) =>
    dispatch(updateBlockContent({ slideId, blockId, content })),
  addBlockAfter: ({ slideId, rowId, afterBlockId, insertIndex, blockType, initialContent }) =>
    dispatch(addBlockToRow({ slideId, rowId, afterBlockId, insertIndex, blockType, initialContent })),
  addRowAtTop: ({ slideId, columnCount = 1 }) =>
    dispatch(addRowAtTop({ slideId, columnCount })),
  addRowWithColumns: ({ slideId, columnCount, blockType }) =>
    dispatch(addRowWithColumns({ slideId, columnCount, blockType })),
  addRowWithColumnsAtIndex: ({
    slideId,
    columnCount,
    insertIndex,
    blockType,
    initialContent,
  }) =>
    dispatch(
      addRowWithColumnsAtIndex({ slideId, columnCount, insertIndex, blockType, initialContent })
    ),
  deleteRow: ({ slideId, rowId }) => dispatch(deleteRow({ slideId, rowId })),
  moveBlock: ({ slideId, sourceRowId, targetRowId, blockId, targetBlockId }) =>
    dispatch(
      moveBlock({ slideId, sourceRowId, targetRowId, blockId, targetBlockId })
    ),
  moveBlockToNewRow: ({ slideId, sourceRowId, blockId, insertIndex }) =>
    dispatch(moveBlockToNewRow({ slideId, sourceRowId, blockId, insertIndex })),
  reorderBlocksInRow: ({ slideId, rowId, oldIndex, newIndex }) =>
    dispatch(reorderBlocksInRow({ slideId, rowId, oldIndex, newIndex })),
  updateColumnWidths: ({ slideId, rowId, columnWidths }) =>
    dispatch(updateColumnWidths({ slideId, rowId, columnWidths })),
  addSlide: ({ afterSlideId }) => dispatch(addSlide({ afterSlideId })),
  deleteSlide: ({ slideId }) => dispatch(deleteSlide(slideId)),
  reorderSlides: ({ slideId, newIndex }) => dispatch(reorderSlides({ slideId, newIndex })),
});
