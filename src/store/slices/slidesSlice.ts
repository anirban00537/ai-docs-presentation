import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import { nanoid } from "nanoid";

// --- Types ---
export interface Block {
  id: string;
  content: any;
}

export interface Row {
  id: string;
  blocks: Block[];
}

export interface Slide {
  id: string;
  rows: Row[];
}

export interface SlidesState {
  slides: Slide[];
  activeSlideId: string | null;
}

// --- Helpers ---
// ProseMirror document format for heading
const createDefaultContent = () => {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "" }],
      },
    ],
  };
};

// ProseMirror document format for paragraph
const createParagraphContent = () => {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [],
      },
    ],
  };
};

export const createBlock = (): Block => ({
  id: nanoid(),
  content: createDefaultContent(),
});

// Block with paragraph content (for columns)
export const createParagraphBlock = (): Block => ({
  id: nanoid(),
  content: createParagraphContent(),
});

export const createRow = (blocks?: Block[]): Row => ({
  id: nanoid(),
  blocks: blocks || [createBlock()],
});

export const createSlide = (): Slide => ({
  id: nanoid(),
  rows: [createRow()],
});

// --- Initial State ---
const initialSlide = createSlide();
const initialState: SlidesState = {
  slides: [initialSlide],
  activeSlideId: initialSlide.id,
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
        const index = state.slides.findIndex(s => s.id === action.payload.afterSlideId);
        state.slides.splice(index + 1, 0, newSlide);
      } else {
        state.slides.push(newSlide);
      }
      state.activeSlideId = newSlide.id;
    },
    deleteSlide: (state, action: PayloadAction<string>) => {
      if (state.slides.length <= 1) return;
      const index = state.slides.findIndex(s => s.id === action.payload);
      state.slides = state.slides.filter(s => s.id !== action.payload);
      if (state.activeSlideId === action.payload) {
        state.activeSlideId = state.slides[Math.max(0, index - 1)]?.id || null;
      }
    },
    duplicateSlide: (state, action: PayloadAction<string>) => {
      const slide = state.slides.find(s => s.id === action.payload);
      if (!slide) return;
      const duplicated: Slide = JSON.parse(JSON.stringify(slide));
      duplicated.id = nanoid();
      duplicated.rows.forEach(row => {
        row.id = nanoid();
        row.blocks.forEach(block => {
          block.id = nanoid();
        });
      });
      const index = state.slides.findIndex(s => s.id === action.payload);
      state.slides.splice(index + 1, 0, duplicated);
      state.activeSlideId = duplicated.id;
    },
    reorderSlides: (state, action: PayloadAction<{ slideId: string; newIndex: number }>) => {
      const { slideId, newIndex } = action.payload;
      const oldIndex = state.slides.findIndex(s => s.id === slideId);
      if (oldIndex === -1) return;
      const [removed] = state.slides.splice(oldIndex, 1);
      state.slides.splice(newIndex, 0, removed);
    },
    setSlides: (state, action: PayloadAction<Slide[]>) => {
      state.slides = action.payload;
      if (!state.slides.find(s => s.id === state.activeSlideId)) {
        state.activeSlideId = state.slides[0]?.id || null;
      }
    },

    // Row actions (within active slide)
    updateBlockContent: (
      state,
      action: PayloadAction<{ slideId: string; blockId: string; content: any }>
    ) => {
      const { slideId, blockId, content } = action.payload;
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return;
      for (const row of slide.rows) {
        const block = row.blocks.find(b => b.id === blockId);
        if (block) {
          block.content = content;
          break;
        }
      }
    },
    addBlockToRow: (
      state,
      action: PayloadAction<{ slideId: string; rowId: string; afterBlockId: string }>
    ) => {
      const { slideId, rowId, afterBlockId } = action.payload;
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return;
      const row = slide.rows.find(r => r.id === rowId);
      if (!row) return;
      const index = row.blocks.findIndex(b => b.id === afterBlockId);
      row.blocks.splice(index + 1, 0, createBlock());
    },
    addRowToSlide: (
      state,
      action: PayloadAction<{ slideId: string; afterRowId: string }>
    ) => {
      const { slideId, afterRowId } = action.payload;
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return;
      const index = slide.rows.findIndex(r => r.id === afterRowId);
      slide.rows.splice(index + 1, 0, createRow());
    },
    deleteRow: (
      state,
      action: PayloadAction<{ slideId: string; rowId: string }>
    ) => {
      const { slideId, rowId } = action.payload;
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide || slide.rows.length <= 1) return;
      slide.rows = slide.rows.filter(r => r.id !== rowId);
    },
    addRowWithColumns: (
      state,
      action: PayloadAction<{ slideId: string; columnCount: number }>
    ) => {
      const { slideId, columnCount } = action.payload;
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return;
      const blocks: Block[] = [];
      for (let i = 0; i < columnCount; i++) {
        blocks.push(createParagraphBlock());
      }
      slide.rows.push(createRow(blocks));
    },
    addRowAtTop: (
      state,
      action: PayloadAction<{ slideId: string; columnCount?: number }>
    ) => {
      const { slideId, columnCount = 1 } = action.payload;
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return;
      const blocks: Block[] = [];
      for (let i = 0; i < columnCount; i++) {
        blocks.push(createParagraphBlock());
      }
      slide.rows.unshift(createRow(blocks));
    },
    setSlideRows: (
      state,
      action: PayloadAction<{ slideId: string; rows: Row[] }>
    ) => {
      const slide = state.slides.find(s => s.id === action.payload.slideId);
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
      const { slideId, sourceRowId, targetRowId, blockId, targetBlockId } = action.payload;
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return;

      const sourceRow = slide.rows.find(r => r.id === sourceRowId);
      const targetRow = slide.rows.find(r => r.id === targetRowId);
      if (!sourceRow || !targetRow) return;

      const blockIndex = sourceRow.blocks.findIndex(b => b.id === blockId);
      if (blockIndex === -1) return;

      // Same row reordering
      if (sourceRowId === targetRowId && targetBlockId) {
        const targetIndex = sourceRow.blocks.findIndex(b => b.id === targetBlockId);
        if (targetIndex === -1 || blockIndex === targetIndex) return;
        
        // Remove from old position and insert at new position
        const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
        const newTargetIndex = targetIndex > blockIndex ? targetIndex : targetIndex;
        sourceRow.blocks.splice(newTargetIndex, 0, movedBlock);
        return;
      }

      // Different row - move block
      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);

      if (targetBlockId) {
        const targetIndex = targetRow.blocks.findIndex(b => b.id === targetBlockId);
        targetRow.blocks.splice(targetIndex, 0, movedBlock);
      } else {
        targetRow.blocks.push(movedBlock);
      }

      // Remove empty rows
      slide.rows = slide.rows.filter(r => r.blocks.length > 0);
      // Ensure at least one row
      if (slide.rows.length === 0) {
        slide.rows.push(createRow());
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
      const slide = state.slides.find(s => s.id === slideId);
      if (!slide) return;

      const row = slide.rows.find(r => r.id === rowId);
      if (!row) return;

      if (oldIndex < 0 || oldIndex >= row.blocks.length) return;
      if (newIndex < 0 || newIndex >= row.blocks.length) return;
      if (oldIndex === newIndex) return;

      const [movedBlock] = row.blocks.splice(oldIndex, 1);
      row.blocks.splice(newIndex, 0, movedBlock);
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
} = slidesSlice.actions;

// --- Selectors ---
export const selectSlidesState = (state: RootState) => state.slides;
export const selectSlides = (state: RootState) => state.slides.slides;
export const selectActiveSlideId = (state: RootState) => state.slides.activeSlideId;
export const selectActiveSlide = (state: RootState) =>
  state.slides.slides.find(s => s.id === state.slides.activeSlideId) || null;

export default slidesSlice.reducer;
