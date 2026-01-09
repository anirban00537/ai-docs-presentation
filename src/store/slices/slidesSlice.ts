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
import { BLOCK_DEFINITIONS } from "@/app/(protected)/presentation/[id]/engine/registry/block-definitions";

import {
  createBlockInstance,
  createRow,
  createRowWithColumns,
  createSlide,
} from "@/app/(protected)/presentation/[id]/engine/registry/factories";
import { 
  findSlide, 
  findRow, 
  findBlock, 
  recalculateWidths, 
  ensureRowExists 
} from "../utils/sliceHelpers";

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
    addSlide: (state, action: PayloadAction<{ afterSlideId?: string; id?: string }>) => {
      const newSlide = createSlide();
      if (action.payload.id) {
        newSlide.id = action.payload.id;
      }
      
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
      const slide = findSlide(state, slideId);
      const row = findRow(slide, rowId);
      if (!row || !slide) return;

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
    addRow: (
      state,
      action: PayloadAction<{
        slideId: string;
        insertAt: "top" | "bottom" | number;
        columnCount?: number;
        blockType?: string;
        initialContent?: any;
      }>
    ) => {
      const { slideId, insertAt, columnCount = 1, blockType, initialContent } = action.payload;
      const slide = findSlide(state, slideId);
      if (!slide) return;
      
      const newRow = createRowWithColumns(
        columnCount,
        blockType as any,
        initialContent
      );

      if (insertAt === "top") {
        slide.rows.unshift(newRow);
      } else if (insertAt === "bottom") {
        slide.rows.push(newRow);
      } else if (typeof insertAt === "number") {
        const targetIndex = Math.max(0, Math.min(insertAt, slide.rows.length));
        slide.rows.splice(targetIndex, 0, newRow);
      }
    },
    // Keep backward compatible aliases
    addRowToSlide: (
      state,
      action: PayloadAction<{ slideId: string; afterRowId: string }>
    ) => {
      const { slideId, afterRowId } = action.payload;
      const slide = findSlide(state, slideId);
      if (!slide) return;
      const index = slide.rows.findIndex((r) => r.id === afterRowId);
      slide.rows.splice(index + 1, 0, createRow());
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
      const slide = findSlide(state, slideId);
      if (!slide) return;
      slide.rows.push(createRowWithColumns(columnCount, blockType as any));
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
      const { slideId, columnCount, insertIndex, blockType, initialContent } = action.payload;
      const slide = findSlide(state, slideId);
      if (!slide) return;
      const newRow = createRowWithColumns(columnCount, blockType as any, initialContent);
      const targetIndex = Math.max(0, Math.min(insertIndex, slide.rows.length));
      slide.rows.splice(targetIndex, 0, newRow);
    },
    addRowAtTop: (
      state,
      action: PayloadAction<{ slideId: string; columnCount?: number }>
    ) => {
      const { slideId, columnCount = 1 } = action.payload;
      const slide = findSlide(state, slideId);
      if (!slide) return;
      slide.rows.unshift(createRowWithColumns(columnCount));
    },
    deleteRow: (
      state,
      action: PayloadAction<{ slideId: string; rowId: string }>
    ) => {
      const { slideId, rowId } = action.payload;
      const slide = findSlide(state, slideId);
      if (!slide || slide.rows.length <= 1) return;
      slide.rows = slide.rows.filter((r) => r.id !== rowId);
    },
    setSlideRows: (
      state,
      action: PayloadAction<{ slideId: string; rows: Row[] }>
    ) => {
      const slide = findSlide(state, action.payload.slideId);
      if (slide) {
        slide.rows = action.payload.rows;
      }
    },
    replaceSlideWithLayout: (
      state,
      action: PayloadAction<{ slideId: string; rows: Row[]; accent?: SlideAccent }>
    ) => {
      const slide = findSlide(state, action.payload.slideId);
      if (slide) {
        slide.rows = action.payload.rows;
        // Apply accent if provided by template
        if (action.payload.accent) {
          slide.accent = action.payload.accent;
        }
        state.activeSlideId = slide.id;
      }
    },
    repositionBlock: (
      state,
      action: PayloadAction<{
        slideId: string;
        sourceRowId: string;
        blockId: string;
        target: {
          rowId?: string;
          insertIndex?: number;
          createNewRow?: boolean;
          targetBlockId?: string;
        };
      }>
    ) => {
      const { slideId, sourceRowId, blockId, target } = action.payload;
      const slide = findSlide(state, slideId);
      if (!slide) return;

      const sourceRow = findRow(slide, sourceRowId);
      if (!sourceRow) return;

      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      // 1. Extract block and its width
      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
      let movedWidth = 1;
      if (sourceRow.columnWidths && sourceRow.columnWidths.length > blockIndex) {
        [movedWidth] = sourceRow.columnWidths.splice(blockIndex, 1);
      }

      // Cleanup source row widths if it still has blocks
      if (sourceRow.blocks.length > 0) {
        // If we didn't have widths or they got out of sync, reset them
        if (!sourceRow.columnWidths || sourceRow.columnWidths.length !== sourceRow.blocks.length) {
          recalculateWidths(sourceRow);
        }
      }

      // 2. Handle Target
      if (target.createNewRow) {
        const newRow = createRow([movedBlock]);
        let insertIndex = target.insertIndex ?? slide.rows.length;
        
        // Clean up source row if empty before inserting new one to avoid index shifts
        if (sourceRow.blocks.length === 0) {
          const sourceRowIndex = slide.rows.findIndex(r => r.id === sourceRowId);
          slide.rows.splice(sourceRowIndex, 1);
          if (sourceRowIndex < insertIndex) {
            insertIndex = Math.max(0, insertIndex - 1);
          }
        }
        
        const finalInsertIndex = Math.max(0, Math.min(insertIndex, slide.rows.length));
        slide.rows.splice(finalInsertIndex, 0, newRow);
      } else if (target.rowId) {
        const targetRow = findRow(slide, target.rowId);
        if (!targetRow) {
          // Fallback or error: if target row not found, put it back or handle gracefully
          sourceRow.blocks.splice(blockIndex, 0, movedBlock);
          recalculateWidths(sourceRow);
          return;
        }

        let finalInsertIndex: number;
        if (typeof target.insertIndex === 'number') {
          finalInsertIndex = Math.max(0, Math.min(target.insertIndex, targetRow.blocks.length));
        } else if (target.targetBlockId) {
          const idx = targetRow.blocks.findIndex(b => b.id === target.targetBlockId);
          finalInsertIndex = idx === -1 ? targetRow.blocks.length : idx;
        } else {
          finalInsertIndex = targetRow.blocks.length;
        }

        targetRow.blocks.splice(finalInsertIndex, 0, movedBlock);
        
        // Handle widths for target row
        if (!targetRow.columnWidths) {
          recalculateWidths(targetRow);
        } else {
          targetRow.columnWidths.splice(finalInsertIndex, 0, movedWidth);
        }

        // Clean up empty rows
        slide.rows = slide.rows.filter((r) => r.blocks.length > 0);
        ensureRowExists(slide, createRow);
      }

      // Ensure some row exists
      ensureRowExists(slide, createRow);
    },

    // Legacy move actions (can be deprecated eventually)
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
      const slide = findSlide(state, slideId);
      if (!slide) return;

      const sourceRow = findRow(slide, sourceRowId);
      const targetRow = findRow(slide, targetRowId);
      if (!sourceRow || !targetRow) return;

      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      // Extract
      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
      
      // Target index
      let targetIndex = targetRow.blocks.length;
      if (targetBlockId) {
        const idx = targetRow.blocks.findIndex(b => b.id === targetBlockId);
        if (idx !== -1) {
          targetIndex = (sourceRowId === targetRowId && blockIndex < idx) ? idx - 1 : idx;
        }
      }

      targetRow.blocks.splice(targetIndex, 0, movedBlock);
      
      // Recalculate
      recalculateWidths(sourceRow);
      recalculateWidths(targetRow);

      // Clean up
      slide.rows = slide.rows.filter((r) => r.blocks.length > 0);
      ensureRowExists(slide, createRow);
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
      const slide = findSlide(state, slideId);
      if (!slide) return;
      const row = findRow(slide, rowId);
      if (!row) return;

      if (oldIndex < 0 || oldIndex >= row.blocks.length) return;
      if (newIndex < 0 || newIndex > row.blocks.length) return;
      if (oldIndex === newIndex) return;

      const [movedBlock] = row.blocks.splice(oldIndex, 1);
      let movedWidth = 1;
      if (row.columnWidths && row.columnWidths.length > oldIndex) {
        [movedWidth] = row.columnWidths.splice(oldIndex, 1);
      }

      const adjustedNewIndex = oldIndex < newIndex ? newIndex - 1 : newIndex;
      const finalIndex = Math.max(0, Math.min(adjustedNewIndex, row.blocks.length));

      row.blocks.splice(finalIndex, 0, movedBlock);

      if (row.columnWidths) {
        row.columnWidths.splice(finalIndex, 0, movedWidth);
      } else {
        recalculateWidths(row);
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
      const slide = findSlide(state, slideId);
      if (!slide) return;
      const row = findRow(slide, rowId);
      if (row) {
        row.columnWidths = columnWidths;
      }
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
      const slide = findSlide(state, slideId);
      if (!slide) return;
      const row = findRow(slide, rowId);
      if (!row) return;
      
      const blockIndex = row.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      const originalBlock = row.blocks[blockIndex];
      const duplicatedBlock: Block = JSON.parse(JSON.stringify(originalBlock));
      duplicatedBlock.id = nanoid();

      row.blocks.splice(blockIndex + 1, 0, duplicatedBlock);
      recalculateWidths(row);
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
      const slide = findSlide(state, slideId);
      if (!slide) return;
      const row = findRow(slide, rowId);
      if (!row) return;

      row.blocks = row.blocks.filter((b) => b.id !== blockId);
      recalculateWidths(row);

      slide.rows = slide.rows.filter((r) => r.blocks.length > 0);
      ensureRowExists(slide, createRow);
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
      const slide = findSlide(state, slideId);
      if (!slide) return;
      const row = findRow(slide, rowId);
      const block = findBlock(row, blockId);
      if (!block) return;

      block.type = newType;
      const definition = BLOCK_DEFINITIONS[newType] || BLOCK_DEFINITIONS[BLOCK_TYPES.PROSEMIRROR];
      block.content = definition.createContent();
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
      const slide = findSlide(state, slideId);
      if (!slide) return;

      const sourceRow = findRow(slide, sourceRowId);
      if (!sourceRow) return;

      const blockIndex = sourceRow.blocks.findIndex((b) => b.id === blockId);
      if (blockIndex === -1) return;

      const [movedBlock] = sourceRow.blocks.splice(blockIndex, 1);
      recalculateWidths(sourceRow);

      let targetIndex = Math.max(0, Math.min(insertIndex, slide.rows.length));

      // Clean up source row if empty
      if (sourceRow.blocks.length === 0) {
        const sourceRowIndex = slide.rows.findIndex(r => r.id === sourceRowId);
        slide.rows.splice(sourceRowIndex, 1);
        if (sourceRowIndex < targetIndex) {
          targetIndex = Math.max(0, targetIndex - 1);
        }
      }

      const newRow = createRow([movedBlock]);
      slide.rows.splice(targetIndex, 0, newRow);
      ensureRowExists(slide, createRow);
    },

    // Slide Accent actions
    toggleSlideAccent: (state, action: PayloadAction<{ slideId: string }>) => {
      const slide = findSlide(state, action.payload.slideId);
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
      const slide = findSlide(state, action.payload.slideId);
      if (!slide || !slide.accent) return;

      slide.accent = { ...slide.accent, ...action.payload.update };
    },
    setSlideAccentSize: (
      state,
      action: PayloadAction<{ slideId: string; size: number }>
    ) => {
      const slide = findSlide(state, action.payload.slideId);
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
  addRow,
  addRowToSlide,
  deleteRow,
  addRowWithColumns,
  addRowWithColumnsAtIndex,
  addRowAtTop,
  setSlideRows,
  replaceSlideWithLayout,
  repositionBlock,
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
