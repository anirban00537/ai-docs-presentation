import { createSlice, nanoid, PayloadAction } from "@reduxjs/toolkit";
import undoable, { excludeAction, StateWithHistory } from "redux-undo";
import type { RootState } from "@/store";
import {
  Block,
  BlockType,
  BlockContent,
  PresentationInfo,
  Row,
  Slide,
  SlideAccent,
  Theme,
  BLOCK_TYPES,
  MAX_BLOCKS_PER_ROW,
} from "@/types/presentation";
import {
  createBlockContentForType,
} from "@/app/(protected)/presentation/[id]/editor/blocks/definitions";

import {
  createBlockInstance,
  createRow,
  createRowWithColumns,
  createSlide,
} from "@/app/(protected)/presentation/[id]/editor/blocks/factories";

export interface SlidesState {
  slides: Slide[];
  activeSlideId: string | null;
  theme: Theme;
  presentation: PresentationInfo | null;
}

// --- Initial State ---
export const DEFAULT_THEME: Theme = {
  primary: "#2B0AFF",
  secondaryColors: ["#FF4D00", "#00C2FF"],
  headingColor: "#000000",
  bodyColor: "#272525",
  cardBackground: "#FFFFFF",
  pageBackground: "#F9FAFB",
  fontFamily: "Space Grotesk",
  themeType: "light",
  cardDesignPattern: "none",
  borderColor: "#2B0AFF15",
  cardBorderRadius: "12px",
  cardBoxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  cardBorderWidth: "1px",
  cardBorderStyle: "solid",
  cardBackdropBlur: "0px",
  cardDesignPatternOpacity: 1,
  cardOpacity: 1,
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
        // Preserve column widths if they exist, otherwise initialize to equal fractional units
        if (!row.columnWidths && row.blocks.length > 0) {
          row.columnWidths = row.blocks.map(() => 1);
        }
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
    updateSlideId: (
      state,
      action: PayloadAction<{ oldId: string; newId: string }>
    ) => {
      const { oldId, newId } = action.payload;
      const slideIndex = state.slides.findIndex((s) => s.id === oldId);
      if (slideIndex !== -1) {
        state.slides[slideIndex].id = newId;
        // Update activeSlideId if it was the old ID
        if (state.activeSlideId === oldId) {
          state.activeSlideId = newId;
        }
      }
    },
    replaceSlideWithServerData: (
      state,
      action: PayloadAction<{ clientId: string; serverSlide: Slide }>
    ) => {
      const { clientId, serverSlide } = action.payload;
      const slideIndex = state.slides.findIndex((s) => s.id === clientId);
      if (slideIndex !== -1) {
        // Replace the client-side slide with server-side slide
        state.slides[slideIndex] = serverSlide;
        // Update activeSlideId if it was the client ID
        if (state.activeSlideId === clientId) {
          state.activeSlideId = serverSlide.id;
        }
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
        insertIndex?: number;
        blockType?: string;
        initialContent?: any;
      }>
    ) => {
      const {
        slideId,
        rowId,
        afterBlockId,
        insertIndex,
        blockType,
        initialContent,
      } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const row = slide.rows.find((r) => r.id === rowId);
      if (!row) return;

      // If row already has 3 blocks, create a new row below it with the same block type
      if (row.blocks.length >= MAX_BLOCKS_PER_ROW) {
        const newBlock = createBlockInstance(blockType as any, initialContent);
        const newRow = createRow([newBlock]);
        const rowIndex = slide.rows.findIndex((r) => r.id === rowId);
        slide.rows.splice(rowIndex + 1, 0, newRow);
        return;
      }

      const newBlock = createBlockInstance(blockType as any, initialContent);

      if (typeof insertIndex === "number") {
        // Explicit index insertion
        const targetIndex = Math.max(
          0,
          Math.min(insertIndex, row.blocks.length)
        );
        row.blocks.splice(targetIndex, 0, newBlock);
      } else if (afterBlockId) {
        const index = row.blocks.findIndex((b) => b.id === afterBlockId);
        if (index !== -1) {
          row.blocks.splice(index + 1, 0, newBlock);
        } else {
          // If afterBlockId not found, append to end
          row.blocks.push(newBlock);
        }
      } else {
        // No positioning specified, append to end
        row.blocks.push(newBlock);
      }

      // Recalculate column widths to be equal (fractional units for CSS Grid)
      row.columnWidths = row.blocks.map(() => 1);
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
    addRowWithColumnsAtIndex: (
      state,
      action: PayloadAction<{
        slideId: string;
        columnCount: number;
        insertIndex: number;
        blockType?: string;
        initialContent?: any;
      }>
    ) => {
      const { slideId, columnCount, insertIndex, blockType, initialContent } =
        action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const newRow = createRowWithColumns(
        columnCount,
        blockType as any,
        initialContent
      );
      const targetIndex = Math.max(0, Math.min(insertIndex, slide.rows.length));
      slide.rows.splice(targetIndex, 0, newRow);
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
    replaceSlideWithLayout: (
      state,
      action: PayloadAction<{ slideId: string; rows: Row[]; accent?: SlideAccent }>
    ) => {
      const slide = state.slides.find((s) => s.id === action.payload.slideId);
      if (slide) {
        slide.rows = action.payload.rows;
        // Apply accent if provided by template
        if (action.payload.accent) {
          slide.accent = action.payload.accent;
        }
        state.activeSlideId = slide.id;
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

        const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
        const adjustedTargetIndex =
          blockIndex < targetIndex ? targetIndex - 1 : targetIndex;
        sourceRow.blocks.splice(adjustedTargetIndex, 0, movedBlock);

        if (sourceRow.columnWidths && sourceRow.columnWidths.length > 0) {
          const [movedWidth] = sourceRow.columnWidths.splice(blockIndex, 1);
          sourceRow.columnWidths.splice(adjustedTargetIndex, 0, movedWidth);
        }
        return;
      }

      // Different row move
      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
      if (!movedBlock) return;

      if (targetBlockId) {
        const targetIndex = targetRow.blocks.findIndex(
          (b) => b.id === targetBlockId
        );
        if (targetIndex === -1) {
          targetRow.blocks.push(movedBlock);
        } else {
          targetRow.blocks.splice(targetIndex, 0, movedBlock);
        }
      } else {
        targetRow.blocks.push(movedBlock);
      }

      // Recalculate widths
      sourceRow.columnWidths = sourceRow.blocks.map(() => 1);
      targetRow.columnWidths = targetRow.blocks.map(() => 1);

      // Clean up empty rows
      slide.rows = slide.rows.filter((r) => r.blocks.length > 0);
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
      if (newIndex < 0 || newIndex > row.blocks.length) return;
      if (oldIndex === newIndex) return;

      const blockToMove = row.blocks[oldIndex];
      const [movedBlock] = row.blocks.splice(oldIndex, 1);
      
      let movedWidth: number | undefined;
      if (row.columnWidths && row.columnWidths.length > oldIndex) {
        movedWidth = row.columnWidths.splice(oldIndex, 1)[0];
      }

      let adjustedNewIndex = oldIndex < newIndex ? newIndex - 1 : newIndex;
      const finalIndex = Math.max(0, Math.min(adjustedNewIndex, row.blocks.length));

      row.blocks.splice(finalIndex, 0, movedBlock);

      if (row.columnWidths) {
        const widthToInsert = movedWidth !== undefined ? movedWidth : 1;
        row.columnWidths.splice(finalIndex, 0, widthToInsert);
      } else {
        row.columnWidths = row.blocks.map(() => 1);
      }
    },
    updateColumnWidths: (
      state,
      action: PayloadAction<{
        slideId: string;
        rowId: string;
        columnWidths: number[];
      }>
    ) => {
      const { slideId, rowId, columnWidths } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const row = slide.rows.find((r) => r.id === rowId);
      if (!row) return;
      row.columnWidths = columnWidths;
    },

    // Block actions
    duplicateBlock: (
      state,
      action: PayloadAction<{
        slideId: string;
        rowId: string;
        blockId: string;
      }>
    ) => {
      const { slideId, rowId, blockId } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const row = slide.rows.find((r) => r.id === rowId);
      if (!row) return;
      const blockIndex = row.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      const originalBlock = row.blocks[blockIndex];
      const duplicatedBlock: Block = JSON.parse(JSON.stringify(originalBlock));
      duplicatedBlock.id = nanoid();

      row.blocks.splice(blockIndex + 1, 0, duplicatedBlock);
      row.columnWidths = row.blocks.map(() => 1);
    },

    deleteBlock: (
      state,
      action: PayloadAction<{
        slideId: string;
        rowId: string;
        blockId: string;
      }>
    ) => {
      const { slideId, rowId, blockId } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const row = slide.rows.find((r) => r.id === rowId);
      if (!row) return;

      row.blocks = row.blocks.filter((b) => b.id !== blockId);

      if (row.blocks.length > 0) {
        row.columnWidths = row.blocks.map(() => 1);
      }

      slide.rows = slide.rows.filter((r) => r.blocks.length > 0);
      if (slide.rows.length === 0) {
        slide.rows.push(createRow());
      }
    },

    transformBlock: (
      state,
      action: PayloadAction<{
        slideId: string;
        rowId: string;
        blockId: string;
        newType: BlockType;
      }>
    ) => {
      const { slideId, rowId, blockId, newType } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      const row = slide.rows.find((r) => r.id === rowId);
      if (!row) return;
      const block = row.blocks.find((b) => b.id === blockId);
      if (!block) return;

      block.type = newType;
      block.content = createBlockContentForType(newType as any);
    },
    moveBlockToNewRow: (
      state,
      action: PayloadAction<{
        slideId: string;
        sourceRowId: string;
        blockId: string;
        insertIndex: number;
      }>
    ) => {
      const { slideId, sourceRowId, blockId, insertIndex } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;

      const sourceRowIndex = slide.rows.findIndex((r) => r.id === sourceRowId);
      if (sourceRowIndex === -1) return;

      const sourceRow = slide.rows[sourceRowIndex];
      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
      if (!movedBlock) return;

      if (sourceRow.blocks.length > 0) {
        sourceRow.columnWidths = sourceRow.blocks.map(() => 1);
      }

      let targetIndex = Math.max(0, Math.min(insertIndex, slide.rows.length));

      if (sourceRow.blocks.length === 0) {
        slide.rows.splice(sourceRowIndex, 1);
        if (sourceRowIndex < targetIndex) {
          targetIndex = Math.max(0, targetIndex - 1);
        }
      }

      const newRow = createRow([movedBlock]);
      slide.rows.splice(targetIndex, 0, newRow);

      if (slide.rows.length === 0) {
        slide.rows.push(createRow());
      }
    },
    // Slide Accent actions
    toggleSlideAccent: (state, action: PayloadAction<{ slideId: string }>) => {
      const slide = state.slides.find((s) => s.id === action.payload.slideId);
      if (!slide) return;

      if (slide.accent) {
        delete slide.accent;
      } else {
        slide.accent = {
          position: "left",
          size: 40,
          url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop",
        };
      }
    },
    updateSlideAccent: (
      state,
      action: PayloadAction<{
        slideId: string;
        update: {
          url?: string;
          position?: "left" | "right" | "top" | "bottom" | "background";
        };
      }>
    ) => {
      const slide = state.slides.find((s) => s.id === action.payload.slideId);
      if (!slide || !slide.accent) return;

      slide.accent = { ...slide.accent, ...action.payload.update };
    },
    setSlideAccentSize: (
      state,
      action: PayloadAction<{ slideId: string; size: number }>
    ) => {
      const slide = state.slides.find((s) => s.id === action.payload.slideId);
      if (!slide || !slide.accent) return;

      slide.accent.size = Math.max(5, Math.min(100, action.payload.size));
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
  updateSlideId,
  replaceSlideWithServerData,
  updateBlockContent,
  addBlockToRow,
  addRowToSlide,
  deleteRow,
  addRowWithColumns,
  addRowWithColumnsAtIndex,
  addRowAtTop,
  setSlideRows,
  replaceSlideWithLayout,
  moveBlock,
  moveBlockToNewRow,
  reorderBlocksInRow,
  updateColumnWidths,
  duplicateBlock,
  deleteBlock,
  transformBlock,
  setTheme,
  resetTheme,
  setPresentation,
  updatePresentationTitle,
  toggleSlideAccent,
  updateSlideAccent,
  setSlideAccentSize,
} = slidesSlice.actions;

export type { Block, Row, Slide, Theme, PresentationInfo, SlideAccent };

const undoableSlidesReducer = undoable(slidesSlice.reducer, {
  limit: 50,
  filter: excludeAction([
    "slides/setActiveSlide",
    "slides/setTheme",
    "slides/resetTheme",
    "slides/setPresentation",
    "slides/updatePresentationTitle",
    "slides/setSlides",
    "slides/replaceSlideWithServerData",
  ]),
  groupBy: (action) => {
    if (action.type === "slides/updateBlockContent") {
      const payload = action.payload as { blockId: string };
      return `updateBlockContent-${payload.blockId}`;
    }
    return null;
  },
  syncFilter: true,
});

export default undoableSlidesReducer;

export type UndoableSlidesState = StateWithHistory<SlidesState>;

export const selectSlidesState = (state: RootState) => state.slides.present;
export const selectSlides = (state: RootState) => state.slides.present.slides;
export const selectActiveSlideId = (state: RootState) =>
  state.slides.present.activeSlideId;
export const selectActiveSlide = (state: RootState) =>
  state.slides.present.slides.find(
    (s) => s.id === state.slides.present.activeSlideId
  ) || null;
export const selectTheme = (state: RootState) => state.slides.present.theme;
export const selectPresentation = (state: RootState) =>
  state.slides.present.presentation;

export const selectCanUndo = (state: RootState) => state.slides.past.length > 0;
export const selectCanRedo = (state: RootState) =>
  state.slides.future.length > 0;
