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
  backgroundColor?: string[];
  backgroundImage?: string;
  showSlideNumber?: boolean;
  slideStyle?: string;
};

export type GlobalTheme = {
  id: string;
  background: string[];
  surface: string;
  text: string;
  accent: string;
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
  backgroundColor: undefined,
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
    surface: defaultTheme.surface,
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

      state.globalTheme = {
        id: theme.id,
        background: theme.background,
        surface: theme.surface,
        text: theme.text,
        accent: theme.accent,
      };

      // Apply theme to all slides and widgets
      state.slides.forEach((slide) => {
        // Only override background when there is no image
        if (!slide.backgroundImage) {
          slide.backgroundColor = [...theme.background];
        }

        if (!slide.widgets) return;

        slide.widgets.forEach((widget) => {
          switch (widget.type) {
            case "text": {
              widget.color = theme.text;
              break;
            }
            case "rectangle":
            case "circle":
            case "polygon": {
              widget.fill = theme.accent;
              break;
            }
            case "arrow": {
              widget.stroke = theme.accent;
              break;
            }
            case "numberCard": {
              widget.backgroundColor = theme.surface;
              widget.numberColor = theme.accent;
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              break;
            }
            case "iconCard": {
              widget.backgroundColor = theme.surface;
              widget.iconColor = theme.accent;
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              break;
            }
            case "imageCard": {
              widget.backgroundColor = theme.surface;
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              break;
            }
            case "labelCard": {
              widget.backgroundColor = theme.surface;
              widget.labelColor = theme.accent;
              widget.labelTextColor = "#ffffff";
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              break;
            }
            case "list": {
              widget.backgroundColor = theme.surface;
              widget.itemColor = theme.text;
              widget.bulletColor = theme.accent;
              widget.titleColor = theme.text;
              break;
            }
            case "quote": {
              widget.backgroundColor = theme.surface;
              widget.quoteColor = theme.text;
              widget.attributionColor = theme.text;
              widget.iconColor = theme.accent;
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
