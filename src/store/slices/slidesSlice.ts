import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type {
  Block,
  PresentationInfo,
  Row,
  Slide,
  Theme,
} from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  MAX_BLOCKS_PER_ROW,
  createBlockContentForType,
  createNumberCardContent,
} from "@/components/editor/blocks/definitions";
import {
  createBlockInstance,
  createRow,
  createRowWithColumns,
  createSlide,
} from "@/components/editor/blocks/factories";

export interface SlidesState {
  slides: Slide[];
  activeSlideId: string | null;
  theme: Theme;
  presentation: PresentationInfo | null;
}

// --- Initial State ---
export const DEFAULT_THEME: Theme = {
  primary: "#2B0AFF",
  headingColor: "#000000",
  bodyColor: "#272525",
  cardBackground: "#FFFFFF",
  pageBackground: "#F9FAFB",
  fontFamily: "Space Grotesk",
};
const initialTheme: Theme = DEFAULT_THEME;

const initialState: SlidesState = {
  slides: [],
  activeSlideId: null,
  theme: initialTheme,
  presentation: null,
};

// --- Slice ---
const slidesSlice = createSlice({
  name: "slides",
  initialState,
  reducers: {
    // Slide actions
    setActiveSlide: (state, action: PayloadAction<string>) => {
      state.activeSlideId = action.payload;
    },
    addSlide: (state, action: PayloadAction<{ afterSlideId?: string }>) => {
      const newSlide = createSlide();
      if (action.payload.afterSlideId) {
        const index = state.slides.findIndex(
          (s) => s.id === action.payload.afterSlideId
        );
        state.slides.splice(index + 1, 0, newSlide);
      } else {
        state.slides.push(newSlide);
      }
      state.activeSlideId = newSlide.id;
    },
    deleteSlide: (state, action: PayloadAction<string>) => {
      if (state.slides.length <= 1) return;
      const index = state.slides.findIndex((s) => s.id === action.payload);
      state.slides = state.slides.filter((s) => s.id !== action.payload);
      if (state.activeSlideId === action.payload) {
        state.activeSlideId = state.slides[Math.max(0, index - 1)]?.id || null;
      }
    },
    duplicateSlide: (state, action: PayloadAction<string>) => {
      const slide = state.slides.find((s) => s.id === action.payload);
      if (!slide) return;
      const duplicated: Slide = JSON.parse(JSON.stringify(slide));
      duplicated.id = nanoid();
      duplicated.rows.forEach((row) => {
        row.id = nanoid();
        row.blocks.forEach((block) => {
          block.id = nanoid();
        });
      });
      const index = state.slides.findIndex((s) => s.id === action.payload);
      state.slides.splice(index + 1, 0, duplicated);
      state.activeSlideId = duplicated.id;
    },
    reorderSlides: (
      state,
      action: PayloadAction<{ slideId: string; newIndex: number }>
    ) => {
      const { slideId, newIndex } = action.payload;
      const oldIndex = state.slides.findIndex((s) => s.id === slideId);
      if (oldIndex === -1) return;
      const [removed] = state.slides.splice(oldIndex, 1);
      state.slides.splice(newIndex, 0, removed);
    },
    setSlides: (state, action: PayloadAction<Slide[]>) => {
      state.slides = action.payload;
      if (!state.slides.find((s) => s.id === state.activeSlideId)) {
        state.activeSlideId = state.slides[0]?.id || null;
      }
    },

    // Row actions (within active slide)
    updateBlockContent: (
      state,
      action: PayloadAction<{ slideId: string; blockId: string; content: any }>
    ) => {
      const { slideId, blockId, content } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      for (const row of slide.rows) {
        const block = row.blocks.find((b) => b.id === blockId);
        if (block) {
          block.content = content;
          break;
        }
      }
    },
    addBlockToRow: (
      state,
      action: PayloadAction<{
        slideId: string;
        rowId: string;
        afterBlockId?: string;
        blockType?: string;
      }>
    ) => {
      const { slideId, rowId, afterBlockId, blockType } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const row = slide.rows.find((r) => r.id === rowId);
      if (!row) return;

      // If row already has 3 blocks, create a new row at the bottom
      if (row.blocks.length >= MAX_BLOCKS_PER_ROW) {
        const newBlock = createBlockInstance(blockType as any);
        const newRow = createRow([newBlock]);
        const currentRowIndex = slide.rows.findIndex((r) => r.id === rowId);
        slide.rows.splice(currentRowIndex + 1, 0, newRow);
        return;
      }

      const newBlock = createBlockInstance(blockType as any);

      if (afterBlockId) {
        const index = row.blocks.findIndex((b) => b.id === afterBlockId);
        if (index !== -1) {
          row.blocks.splice(index + 1, 0, newBlock);
        } else {
          // If afterBlockId not found, append to end
          row.blocks.push(newBlock);
        }
      } else {
        // No afterBlockId specified, append to end
        row.blocks.push(newBlock);
      }
    },
    addRowToSlide: (
      state,
      action: PayloadAction<{ slideId: string; afterRowId: string }>
    ) => {
      const { slideId, afterRowId } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const index = slide.rows.findIndex((r) => r.id === afterRowId);
      slide.rows.splice(index + 1, 0, createRow());
    },
    deleteRow: (
      state,
      action: PayloadAction<{ slideId: string; rowId: string }>
    ) => {
      const { slideId, rowId } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide || slide.rows.length <= 1) return;
      slide.rows = slide.rows.filter((r) => r.id !== rowId);
    },
    addRowWithColumns: (
      state,
      action: PayloadAction<{
        slideId: string;
        columnCount: number;
        blockType?: string;
      }>
    ) => {
      const { slideId, columnCount, blockType } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const newRow = createRowWithColumns(columnCount, blockType as any);
      slide.rows.push(newRow);
    },
    addRowAtTop: (
      state,
      action: PayloadAction<{ slideId: string; columnCount?: number }>
    ) => {
      const { slideId, columnCount = 1 } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const newRow = createRowWithColumns(columnCount);
      slide.rows.unshift(newRow);
    },
    setSlideRows: (
      state,
      action: PayloadAction<{ slideId: string; rows: Row[] }>
    ) => {
      const slide = state.slides.find((s) => s.id === action.payload.slideId);
      if (slide) {
        slide.rows = action.payload.rows;
      }
    },
    moveBlock: (
      state,
      action: PayloadAction<{
        slideId: string;
        sourceRowId: string;
        targetRowId: string;
        blockId: string;
        targetBlockId?: string;
      }>
    ) => {
      const { slideId, sourceRowId, targetRowId, blockId, targetBlockId } =
        action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;

      const sourceRow = slide.rows.find((r) => r.id === sourceRowId);
      const targetRow = slide.rows.find((r) => r.id === targetRowId);
      if (!sourceRow || !targetRow) return;

      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      // Same row reordering
      if (sourceRowId === targetRowId && targetBlockId) {
        const targetIndex = sourceRow.blocks.findIndex(
          (b) => b.id === targetBlockId
        );
        if (targetIndex === -1 || blockIndex === targetIndex) return;

        // Remove from old position and insert at new position
        const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
        // Adjust targetIndex if we removed from before the target position
        const adjustedTargetIndex =
          blockIndex < targetIndex ? targetIndex - 1 : targetIndex;
        sourceRow.blocks.splice(adjustedTargetIndex, 0, movedBlock);
        return;
      }

      // Different row - move block
      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);

      // Ensure we have a valid block
      if (!movedBlock) return;

      if (targetBlockId) {
        const targetIndex = targetRow.blocks.findIndex(
          (b) => b.id === targetBlockId
        );
        if (targetIndex === -1) {
          // Target block not found, append to end
          targetRow.blocks.push(movedBlock);
        } else {
          // Insert before target block
          targetRow.blocks.splice(targetIndex, 0, movedBlock);
        }
      } else {
        targetRow.blocks.push(movedBlock);
      }

      // Remove empty rows
      slide.rows = slide.rows.filter((r) => r.blocks.length > 0);
      // Ensure at least one row
      if (slide.rows.length === 0) {
        slide.rows.push(createRow());
      }
    },
    setTheme: (state, action: PayloadAction<Partial<Theme>>) => {
      state.theme = { ...state.theme, ...action.payload };
    },
    resetTheme: (state) => {
      state.theme = initialTheme;
    },
    setPresentation: (state, action: PayloadAction<PresentationInfo>) => {
      state.presentation = action.payload;
    },
    updatePresentationTitle: (state, action: PayloadAction<string>) => {
      if (state.presentation) {
        state.presentation.title = action.payload;
      }
    },
    reorderBlocksInRow: (
      state,
      action: PayloadAction<{
        slideId: string;
        rowId: string;
        oldIndex: number;
        newIndex: number;
      }>
    ) => {
      const { slideId, rowId, oldIndex, newIndex } = action.payload;

      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;

      const row = slide.rows.find((r) => r.id === rowId);
      if (!row) return;
      if (oldIndex < 0 || oldIndex >= row.blocks.length) return;
      if (newIndex < 0 || newIndex >= row.blocks.length) return;
      if (oldIndex === newIndex) return;

      // Move block from oldIndex to newIndex (not swap)
      const blockToMove = row.blocks[oldIndex];
      if (!blockToMove || !blockToMove.id) return;

      const originalContent = blockToMove.content;

      const [movedBlock] = row.blocks.splice(oldIndex, 1);

      if (!movedBlock || movedBlock.id !== blockToMove.id) {
        row.blocks.splice(oldIndex, 0, blockToMove);
        return;
      }

      if (movedBlock.content !== originalContent) {
        movedBlock.content = originalContent;
      }

      if (!movedBlock.content) {
        const blockType = movedBlock.type || "prosemirror";
        movedBlock.content =
          blockType === BLOCK_TYPES.NUMBER_CARD
            ? createNumberCardContent()
            : createBlockContentForType(blockType as any);
      }

      let adjustedNewIndex: number;
      if (oldIndex < newIndex) {
        adjustedNewIndex = newIndex - 1;
      } else {
        adjustedNewIndex = newIndex;
      }

      const finalIndex = Math.max(
        0,
        Math.min(adjustedNewIndex, row.blocks.length)
      );

      row.blocks.splice(finalIndex, 0, movedBlock);
    },
  },
});

export const {
  setActiveSlide,
  addSlide,
  deleteSlide,
  duplicateSlide,
  reorderSlides,
  setSlides,
  updateBlockContent,
  addBlockToRow,
  addRowToSlide,
  deleteRow,
  addRowWithColumns,
  addRowAtTop,
  setSlideRows,
  moveBlock,
  reorderBlocksInRow,
  setTheme,
  resetTheme,
  setPresentation,
  updatePresentationTitle,
} = slidesSlice.actions;

export type { Block, Row, Slide, Theme, PresentationInfo };

// --- Selectors ---
export const selectSlidesState = (state: RootState) => state.slides;
export const selectSlides = (state: RootState) => state.slides.slides;
export const selectActiveSlideId = (state: RootState) =>
  state.slides.activeSlideId;
export const selectActiveSlide = (state: RootState) =>
  state.slides.slides.find((s) => s.id === state.slides.activeSlideId) || null;
export const selectTheme = (state: RootState) => state.slides.theme;
export const selectPresentation = (state: RootState) =>
  state.slides.presentation;

export default slidesSlice.reducer;
