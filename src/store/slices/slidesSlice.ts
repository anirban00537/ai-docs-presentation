import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SlideWidget,
  SlideWidgetUpdate,
} from "@/components/editor/widgets/types";
import type { RootState } from "@/store";
import { SLIDE_THEMES } from "@/lib/slide-themes";

export type SlideModel = {
  id: string;
  title: string;
  widgets: SlideWidget[];
  /**
   * Background colors for the slide.
   * - If undefined/empty: fall back to global theme background.
   * - If length === 1: rendered as a solid background.
   * - If length >= 2: rendered as a linear gradient using all colors.
   */
  backgroundColors?: string[];
  backgroundGradientDirection?: string; // Gradient direction (e.g., "to top", "to bottom right")
  backgroundImage?: string;
  showSlideNumber?: boolean;
  slideStyle?: string;
};

export type GlobalTheme = {
  id: string;
  background: string[];
  text: string[];
  accent: string[];
};

type SlidesState = {
  slides: SlideModel[];
  activeSlideId: string;
  globalTheme: GlobalTheme;
};

const createEmptySlide = (title: string): SlideModel => ({
  id: nanoid(),
  title,
  widgets: [],
  backgroundColors: undefined,
  backgroundGradientDirection: undefined,
  backgroundImage: undefined,
  showSlideNumber: false,
  slideStyle: "Engineering Team Meeting",
});

const initialSlide = createEmptySlide("Slide 1");
const defaultTheme = SLIDE_THEMES[0];

const initialState: SlidesState = {
  slides: [initialSlide],
  activeSlideId: initialSlide.id,
  globalTheme: {
    id: defaultTheme.id,
    background: defaultTheme.background,
    text: defaultTheme.text,
    accent: defaultTheme.accent,
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

      // Ensure we always have at least one color for each slot
      const backgroundColors =
        Array.isArray(theme.background) && theme.background.length > 0
          ? theme.background
          : ["#ffffff"];
      const textColors =
        Array.isArray(theme.text) && theme.text.length > 0
          ? theme.text
          : ["#111827"];
      const accentColors =
        Array.isArray(theme.accent) && theme.accent.length > 0
          ? theme.accent
          : ["#2563eb"];

      state.globalTheme = {
        id: theme.id,
        background: backgroundColors,
        text: textColors,
        accent: accentColors,
      };

      // Apply theme to all slides and widgets
      state.slides.forEach((slide) => {
        // Only override background when there is no image
        if (!slide.backgroundImage) {
          slide.backgroundColors = [...backgroundColors];
        }

        if (!slide.widgets) return;

        slide.widgets.forEach((widget) => {
          switch (widget.type) {
            case "text": {
              widget.color = textColors[0];
              break;
            }
            case "rectangle":
            case "circle":
            case "polygon": {
              widget.fill = accentColors[0];
              break;
            }
            case "arrow": {
              widget.stroke = accentColors[0];
              break;
            }
            case "featureCard": {
              widget.backgroundColor = backgroundColors[0];
              widget.numberColor = accentColors[0];
              widget.titleColor = textColors[0];
              widget.descriptionColor = textColors[0];
              break;
            }
            default:
              break;
          }
        });
      });
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
  resetSlidesState,
  setSlideTheme,
} = slidesSlice.actions;

export const selectSlidesState = (state: RootState) => state.slides;
export const selectSlides = (state: RootState) => state.slides.slides;
export const selectActiveSlideId = (state: RootState) =>
  state.slides.activeSlideId;
export const selectActiveSlide = (state: RootState) =>
  state.slides.slides.find(
    (slide) => slide.id === state.slides.activeSlideId
  ) ?? null;
export const selectActiveSlideWidgets = (state: RootState) =>
  selectActiveSlide(state)?.widgets ?? [];
export const selectGlobalTheme = (state: RootState) => state.slides.globalTheme;

export default slidesSlice.reducer;
