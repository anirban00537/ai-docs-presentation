import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SlideWidget,
  SlideWidgetUpdate,
  ResizeHandle,
  SnapLine,
} from "@/components/editor/widgets/types";
import type { RootState } from "@/store";

export type PointerSession = {
  type: "drag" | "resize";
  widgetId: string;
  pointerId: number;
  handle?: ResizeHandle;
  startPointer: { x: number; y: number };
  startRect: { x: number; y: number; width: number; height: number };
  lastRect?: { x: number; y: number; width: number; height: number };
};

type EditorUiState = {
  selectedWidgetId: string | null;
  editingWidgetId: string | null;
  liveOverrides: Record<string, SlideWidgetUpdate>;
  pointerSession: PointerSession | null;
  activePointerId: number | null;
  snapLines: SnapLine[];
  isPresentationMode: boolean;
  copiedWidget: SlideWidget | null;
};

const initialState: EditorUiState = {
  selectedWidgetId: null,
  editingWidgetId: null,
  liveOverrides: {},
  pointerSession: null,
  activePointerId: null,
  snapLines: [],
  isPresentationMode: false,
  copiedWidget: null,
};

const editorUiSlice = createSlice({
  name: "editorUi",
  initialState,
  reducers: {
    selectWidget(state, action: PayloadAction<string | null>) {
      state.selectedWidgetId = action.payload;
      if (action.payload !== state.editingWidgetId) {
        state.editingWidgetId = null;
      }
    },
    startWidgetEditing(state, action: PayloadAction<string>) {
      state.selectedWidgetId = action.payload;
      state.editingWidgetId = action.payload;
    },
    stopWidgetEditing(state) {
      state.editingWidgetId = null;
    },
    setLiveOverride(
      state,
      action: PayloadAction<{ widgetId: string; updates: SlideWidgetUpdate }>
    ) {
      state.liveOverrides[action.payload.widgetId] = {
        ...(state.liveOverrides[action.payload.widgetId] ?? {}),
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
    setSnapLines(state, action: PayloadAction<SnapLine[]>) {
      state.snapLines = action.payload;
    },
    setPresentationMode(state, action: PayloadAction<boolean>) {
      state.isPresentationMode = action.payload;
    },
    setCopiedWidget(state, action: PayloadAction<SlideWidget | null>) {
      state.copiedWidget = action.payload;
    },
    resetEditorUi(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  selectWidget,
  startWidgetEditing,
  stopWidgetEditing,
  setLiveOverride,
  clearLiveOverride,
  clearAllLiveOverrides,
  startPointerSession,
  updatePointerSession,
  endPointerSession,
  setActivePointerId,
  setSnapLines,
  setPresentationMode,
  setCopiedWidget,
  resetEditorUi,
} = editorUiSlice.actions;

export const selectEditorUiState = (state: RootState) => state.editorUi;
export const selectSelectedWidgetId = (state: RootState) =>
  state.editorUi.selectedWidgetId;
export const selectEditingWidgetId = (state: RootState) =>
  state.editorUi.editingWidgetId;
export const selectLiveOverrides = (state: RootState) =>
  state.editorUi.liveOverrides;
export const selectPointerSession = (state: RootState) =>
  state.editorUi.pointerSession;
export const selectActivePointerId = (state: RootState) =>
  state.editorUi.activePointerId;
export const selectSnapLines = (state: RootState) => state.editorUi.snapLines;
export const selectIsPresentationMode = (state: RootState) =>
  state.editorUi.isPresentationMode;
export const selectCopiedWidget = (state: RootState) =>
  state.editorUi.copiedWidget;

export default editorUiSlice.reducer;
