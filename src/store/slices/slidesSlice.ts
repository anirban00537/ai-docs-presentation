import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SlideWidget,
  SlideWidgetUpdate,
} from "@/components/editor/widgets/types";
import type { RootState } from "@/store";
import { SLIDE_THEMES, type WidgetBackgroundType } from "@/lib/slide-themes";

export type SlideModel = {
  id: string;
  title: string;
  widgets: SlideWidget[];
  backgroundColor?: string[];
  backgroundImage?: string;
  backgroundBlur?: boolean;
  showSlideNumber?: boolean;
  slideStyle?: string;
};

export type GlobalTheme = {
  id: string;
  background: string[];
  surface: string;
  text: string;
  accent: string;
  font: string;
  cardBackgroundType: WidgetBackgroundType;
  tone: import("@/lib/slide-themes").ThemeTone;
};

type SlidesState = {
  presentationId: string | null;
  presentationTitle: string;
  slides: SlideModel[];
  activeSlideId: string;
  globalTheme: GlobalTheme;
};

const createEmptySlide = (title: string): SlideModel => ({
  id: nanoid(),
  title,
  widgets: [],
  backgroundColor: undefined,
  backgroundImage: undefined,
  showSlideNumber: false,
  slideStyle: "Engineering Team Meeting",
});

const defaultTheme = SLIDE_THEMES[0];

const initialState: SlidesState = {
  presentationId: null,
  presentationTitle: "",
  slides: [],
  activeSlideId: "",
  globalTheme: {
    id: defaultTheme.id,
    background: defaultTheme.background,
    surface: defaultTheme.surface,
    text: defaultTheme.text,
    accent: defaultTheme.accent,
    font: defaultTheme.font,
    cardBackgroundType: defaultTheme.cardBackgroundType,
    tone: defaultTheme.tone,
  },
};

const resolveSlide = (
  state: SlidesState,
  requestedSlideId?: string
): SlideModel | undefined => {
  const targetId = requestedSlideId ?? state.activeSlideId;
  return state.slides.find((slide) => slide.id === targetId);
};

const applyWidgetUpdates = (
  widget: SlideWidget,
  updates: SlideWidgetUpdate
) => {
  Object.assign(widget, updates);
};

const slidesSlice = createSlice({
  name: "slides",
  initialState,
  reducers: {
    addSlide(
      state,
      action: PayloadAction<
        { title?: string; widgets?: SlideWidget[] } | undefined
      >
    ) {
      const insertIndex = state.slides.findIndex(
        (slide) => slide.id === state.activeSlideId
      );
      const defaultTitle = `Slide ${state.slides.length + 1}`;
      const { title, widgets } = action.payload ?? {};
      const newSlide = createEmptySlide(title ?? defaultTitle);
      if (widgets) {
        newSlide.widgets = widgets;
      }
      const targetIndex =
        insertIndex >= 0 ? insertIndex + 1 : state.slides.length;
      state.slides.splice(targetIndex, 0, newSlide);
      state.activeSlideId = newSlide.id;
    },
    setActiveSlide(state, action: PayloadAction<string>) {
      const exists = state.slides.some((slide) => slide.id === action.payload);
      if (exists) {
        state.activeSlideId = action.payload;
      }
    },
    removeSlide(state, action: PayloadAction<string>) {
      if (state.slides.length <= 1) {
        return;
      }
      const index = state.slides.findIndex(
        (slide) => slide.id === action.payload
      );
      if (index === -1) return;
      const [removed] = state.slides.splice(index, 1);
      if (removed.id === state.activeSlideId) {
        const next = state.slides[Math.max(0, index - 1)];
        if (next) {
          state.activeSlideId = next.id;
        }
      }
    },
    addWidget(
      state,
      action: PayloadAction<{ widget: SlideWidget; slideId?: string }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      slide.widgets ??= [];
      const existingIndex = slide.widgets.findIndex(
        (el) => el.id === action.payload.widget.id
      );
      if (existingIndex >= 0) {
        slide.widgets[existingIndex] = action.payload.widget;
      } else {
        slide.widgets.push(action.payload.widget);
      }
    },
    updateWidget(
      state,
      action: PayloadAction<{
        widgetId: string;
        updates: SlideWidgetUpdate;
        slideId?: string;
      }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      slide.widgets ??= [];
      const widget = slide.widgets.find(
        (el) => el.id === action.payload.widgetId
      );
      if (!widget) return;
      applyWidgetUpdates(widget, action.payload.updates);
    },
    removeWidget(
      state,
      action: PayloadAction<{ widgetId: string; slideId?: string }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      slide.widgets ??= [];
      slide.widgets = slide.widgets.filter(
        (el) => el.id !== action.payload.widgetId
      );
    },
    replaceWidgets(
      state,
      action: PayloadAction<{ widgets: SlideWidget[]; slideId?: string }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      slide.widgets = action.payload.widgets;
    },
    updateSlide(
      state,
      action: PayloadAction<{
        slideId?: string;
        updates: Partial<Omit<SlideModel, "id" | "widgets">>;
      }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      Object.assign(slide, action.payload.updates);
    },
    reorderSlides(
      state,
      action: PayloadAction<{ activeId: string; overId: string }>
    ) {
      const { activeId, overId } = action.payload;
      const oldIndex = state.slides.findIndex((slide) => slide.id === activeId);
      const newIndex = state.slides.findIndex((slide) => slide.id === overId);

      if (oldIndex !== -1 && newIndex !== -1) {
        const [movedSlide] = state.slides.splice(oldIndex, 1);
        state.slides.splice(newIndex, 0, movedSlide);
      }
    },
    resetSlidesState() {
      return initialState;
    },
    setSlideTheme(
      state,
      action: PayloadAction<{
        themeId: string;
      }>
    ) {
      const theme = SLIDE_THEMES.find((t) => t.id === action.payload.themeId);
      if (!theme) return;

      // Only update globalTheme - widgets and slides will automatically use new colors
      // since they fallback to globalTheme when their own colors are undefined
      state.globalTheme = {
        id: theme.id,
        background: theme.background,
        surface: theme.surface,
        text: theme.text,
        accent: theme.accent,
        font: theme.font,
        cardBackgroundType: theme.cardBackgroundType,
        tone: theme.tone,
      };
    },
    updateGlobalTheme(
      state,
      action: PayloadAction<{
        updates: Partial<Omit<GlobalTheme, "id">>;
      }>
    ) {
      // Only update globalTheme - widgets and slides will automatically use new colors
      // since they fallback to globalTheme when their own colors are undefined
      Object.assign(state.globalTheme, action.payload.updates);
    },
    setPresentationId(
      state,
      action: PayloadAction<{ presentationId: string | null }>
    ) {
      state.presentationId = action.payload.presentationId;
    },
    loadPresentation(
      state,
      action: PayloadAction<{
        presentationId: string;
        presentationTitle: string;
        slides: SlideModel[];
        globalTheme: GlobalTheme;
      }>
    ) {
      state.presentationId = action.payload.presentationId;
      state.presentationTitle = action.payload.presentationTitle;
      state.slides = action.payload.slides;
      state.globalTheme = action.payload.globalTheme;
      if (action.payload.slides.length > 0) {
        state.activeSlideId = action.payload.slides[0].id;
      } else {
        state.activeSlideId = "";
      }
    },
    updatePresentationTitle(state, action: PayloadAction<{ title: string }>) {
      state.presentationTitle = action.payload.title;
    },
    updateSlideId(
      state,
      action: PayloadAction<{ oldId: string; newId: string }>
    ) {
      const slideIndex = state.slides.findIndex(
        (slide) => slide.id === action.payload.oldId
      );
      if (slideIndex >= 0) {
        state.slides[slideIndex].id = action.payload.newId;
        if (state.activeSlideId === action.payload.oldId) {
          state.activeSlideId = action.payload.newId;
        }
      }
    },
  },
});

export const {
  addSlide,
  setActiveSlide,
  removeSlide,
  addWidget,
  updateWidget,
  removeWidget,
  replaceWidgets,
  updateSlide,
  reorderSlides,
  resetSlidesState,
  setSlideTheme,
  updateGlobalTheme,
  setPresentationId,
  loadPresentation,
  updateSlideId,
  updatePresentationTitle,
} = slidesSlice.actions;

export const selectSlidesState = (state: RootState) => state.slides;
export const selectSlides = (state: RootState) => state.slides.slides;
export const selectActiveSlideId = (state: RootState) =>
  state.slides.activeSlideId;
export const selectActiveSlide = (state: RootState) =>
  state.slides.slides.find(
    (slide: SlideModel) => slide.id === state.slides.activeSlideId
  ) ?? null;
export const selectActiveSlideWidgets = (state: RootState) =>
  selectActiveSlide(state)?.widgets ?? [];
export const selectGlobalTheme = (state: RootState) => state.slides.globalTheme;
export const selectPresentationId = (state: RootState) =>
  state.slides.presentationId;
export const selectPresentationTitle = (state: RootState) =>
  state.slides.presentationTitle;

export default slidesSlice.reducer;
