import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SlideElementUpdate, ResizeHandle } from "@/components/editor/widgets/types";
import type { RootState } from "@/store";

export type PointerSession = {
  type: "drag" | "resize";
  elementId: string;
  pointerId: number;
  handle?: ResizeHandle;
  startPointer: { x: number; y: number };
  startRect: { x: number; y: number; width: number; height: number };
  lastRect?: { x: number; y: number; width: number; height: number };
};

type EditorUiState = {
  selectedElementId: string | null;
  editingElementId: string | null;
  liveOverrides: Record<string, SlideElementUpdate>;
  pointerSession: PointerSession | null;
  activePointerId: number | null;
};

const initialState: EditorUiState = {
  selectedElementId: null,
  editingElementId: null,
  liveOverrides: {},
  pointerSession: null,
  activePointerId: null,
};

const editorUiSlice = createSlice({
  name: "editorUi",
  initialState,
  reducers: {
    selectElement(state, action: PayloadAction<string | null>) {
      state.selectedElementId = action.payload;
      if (action.payload !== state.editingElementId) {
        state.editingElementId = null;
      }
    },
    startEditing(state, action: PayloadAction<string>) {
      state.selectedElementId = action.payload;
      state.editingElementId = action.payload;
    },
    stopEditing(state) {
      state.editingElementId = null;
    },
    setLiveOverride(
      state,
      action: PayloadAction<{ elementId: string; updates: SlideElementUpdate }>
    ) {
      state.liveOverrides[action.payload.elementId] = {
        ...(state.liveOverrides[action.payload.elementId] ?? {}),
        ...action.payload.updates,
      };
    },
    clearLiveOverride(state, action: PayloadAction<string>) {
      if (action.payload in state.liveOverrides) {
        delete state.liveOverrides[action.payload];
      }
    },
    clearAllLiveOverrides(state) {
      state.liveOverrides = {};
    },
    startPointerSession(state, action: PayloadAction<PointerSession>) {
      state.pointerSession = action.payload;
      state.activePointerId = action.payload.pointerId;
    },
    updatePointerSession(
      state,
      action: PayloadAction<Partial<PointerSession>>
    ) {
      if (!state.pointerSession) return;
      state.pointerSession = {
        ...state.pointerSession,
        ...action.payload,
        lastRect: action.payload.lastRect ?? state.pointerSession.lastRect,
      };
    },
    endPointerSession(state) {
      state.pointerSession = null;
      state.activePointerId = null;
    },
    setActivePointerId(state, action: PayloadAction<number | null>) {
      state.activePointerId = action.payload;
    },
    resetEditorUi(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  selectElement,
  startEditing,
  stopEditing,
  setLiveOverride,
  clearLiveOverride,
  clearAllLiveOverrides,
  startPointerSession,
  updatePointerSession,
  endPointerSession,
  setActivePointerId,
  resetEditorUi,
} = editorUiSlice.actions;

export const selectEditorUiState = (state: RootState) => state.editorUi;
export const selectSelectedElementId = (state: RootState) =>
  state.editorUi.selectedElementId;
export const selectEditingElementId = (state: RootState) =>
  state.editorUi.editingElementId;
export const selectLiveOverrides = (state: RootState) =>
  state.editorUi.liveOverrides;
export const selectPointerSession = (state: RootState) =>
  state.editorUi.pointerSession;
export const selectActivePointerId = (state: RootState) =>
  state.editorUi.activePointerId;

export default editorUiSlice.reducer;

