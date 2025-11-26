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

      // Apply theme to all slides and widgets
      state.slides.forEach((slide) => {
        // Only override background when there is no image
        if (!slide.backgroundImage) {
          slide.backgroundColor = [...theme.background];
        }

        if (!slide.widgets) return;

        slide.widgets.forEach((widget) => {
          const themeFont = theme.font;
          const cardBackgroundType = theme.cardBackgroundType;

          switch (widget.type) {
            case "text": {
              widget.color = theme.text;
              widget.fontFamily = themeFont;
              break;
            }
            case "numberCard": {
              widget.backgroundColor = theme.surface;
              widget.numberColor = theme.accent;
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              widget.numberFontFamily = themeFont;
              widget.titleFontFamily = themeFont;
              widget.descriptionFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "iconCard": {
              widget.backgroundColor = theme.surface;
              widget.iconColor = theme.accent;
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              widget.titleFontFamily = themeFont;
              widget.descriptionFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "imageCard": {
              widget.backgroundColor = theme.surface;
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              widget.titleFontFamily = themeFont;
              widget.descriptionFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "labelCard": {
              widget.backgroundColor = theme.surface;
              widget.labelColor = theme.accent;
              widget.labelTextColor = "#ffffff";
              widget.titleColor = theme.text;
              widget.descriptionColor = theme.text;
              widget.labelFontFamily = themeFont;
              widget.titleFontFamily = themeFont;
              widget.descriptionFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "titleCard": {
              widget.backgroundColor = theme.surface;
              widget.eyebrowColor = theme.accent;
              widget.titleColor = theme.text;
              widget.subtitleColor = theme.text;
              widget.eyebrowFontFamily = themeFont;
              widget.titleFontFamily = themeFont;
              widget.subtitleFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "list": {
              widget.backgroundColor = theme.surface;
              widget.itemColor = theme.text;
              widget.bulletColor = theme.accent;
              widget.titleColor = theme.text;
              widget.titleFontFamily = themeFont;
              widget.itemFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "quote": {
              widget.backgroundColor = theme.surface;
              widget.quoteColor = theme.text;
              widget.attributionColor = theme.text;
              widget.iconColor = theme.accent;
              widget.quoteFontFamily = themeFont;
              widget.attributionFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "comparisonCard": {
              widget.backgroundColor = theme.surface;
              widget.leftTextColor = theme.text;
              widget.rightTextColor = theme.text;
              widget.leftAccentColor = theme.accent;
              widget.rightAccentColor = theme.accent;
              widget.dividerColor = "rgba(15,23,42,0.12)";
              widget.leftLabelFontFamily = themeFont;
              widget.rightLabelFontFamily = themeFont;
              widget.leftTitleFontFamily = themeFont;
              widget.rightTitleFontFamily = themeFont;
              widget.leftItemFontFamily = themeFont;
              widget.rightItemFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            case "pricingCard": {
              widget.backgroundColor = theme.surface;
              widget.planNameColor = theme.text;
              widget.priceColor = theme.text;
              widget.periodColor = theme.text;
              widget.badgeColor = theme.accent;
              widget.badgeTextColor = "#ffffff";
              widget.featureColor = theme.text;
              widget.buttonColor = theme.accent;
              widget.buttonTextColor = "#ffffff";
              widget.planNameFontFamily = themeFont;
              widget.priceFontFamily = themeFont;
              widget.periodFontFamily = themeFont;
              widget.badgeFontFamily = themeFont;
              widget.featureFontFamily = themeFont;
              widget.buttonFontFamily = themeFont;
              widget.backgroundType = cardBackgroundType;
              break;
            }
            default:
              break;
          }
        });
      });
    },
    updateGlobalTheme(
      state,
      action: PayloadAction<{
        updates: Partial<Omit<GlobalTheme, "id">>;
      }>
    ) {
      Object.assign(state.globalTheme, action.payload.updates);
      // Apply updated theme properties to all slides and widgets
      state.slides.forEach((slide) => {
        // Update background if theme background changed and no image set
        if (action.payload.updates.background && !slide.backgroundImage) {
          slide.backgroundColor = [...action.payload.updates.background];
        }

        if (!slide.widgets || !action.payload.updates) return;

        const themeFont = action.payload.updates.font ?? state.globalTheme.font;
        const cardBackgroundType =
          action.payload.updates.cardBackgroundType ??
          state.globalTheme.cardBackgroundType;
        const surface =
          action.payload.updates.surface ?? state.globalTheme.surface;
        const text = action.payload.updates.text ?? state.globalTheme.text;
        const accent =
          action.payload.updates.accent ?? state.globalTheme.accent;

        slide.widgets.forEach((widget) => {
          switch (widget.type) {
            case "text": {
              if (action.payload.updates.text)
                widget.color = action.payload.updates.text;
              if (action.payload.updates.font) widget.fontFamily = themeFont;
              break;
            }
            case "numberCard": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.accent) widget.numberColor = accent;
              if (action.payload.updates.text) {
                widget.titleColor = text;
                widget.descriptionColor = text;
              }
              if (action.payload.updates.font) {
                widget.numberFontFamily = themeFont;
                widget.titleFontFamily = themeFont;
                widget.descriptionFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "iconCard": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.accent) widget.iconColor = accent;
              if (action.payload.updates.text) {
                widget.titleColor = text;
                widget.descriptionColor = text;
              }
              if (action.payload.updates.font) {
                widget.titleFontFamily = themeFont;
                widget.descriptionFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "imageCard": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.text) {
                widget.titleColor = text;
                widget.descriptionColor = text;
              }
              if (action.payload.updates.font) {
                widget.titleFontFamily = themeFont;
                widget.descriptionFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "labelCard": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.accent) widget.labelColor = accent;
              if (action.payload.updates.text) {
                widget.titleColor = text;
                widget.descriptionColor = text;
              }
              if (action.payload.updates.font) {
                widget.labelFontFamily = themeFont;
                widget.titleFontFamily = themeFont;
                widget.descriptionFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "titleCard": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.accent) widget.eyebrowColor = accent;
              if (action.payload.updates.text) {
                widget.titleColor = text;
                widget.subtitleColor = text;
              }
              if (action.payload.updates.font) {
                widget.eyebrowFontFamily = themeFont;
                widget.titleFontFamily = themeFont;
                widget.subtitleFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "list": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.text) {
                widget.itemColor = text;
                widget.titleColor = text;
              }
              if (action.payload.updates.accent) widget.bulletColor = accent;
              if (action.payload.updates.font) {
                widget.titleFontFamily = themeFont;
                widget.itemFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "quote": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.text) {
                widget.quoteColor = text;
                widget.attributionColor = text;
              }
              if (action.payload.updates.accent) widget.iconColor = accent;
              if (action.payload.updates.font) {
                widget.quoteFontFamily = themeFont;
                widget.attributionFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "comparisonCard": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.text) {
                widget.leftTextColor = text;
                widget.rightTextColor = text;
              }
              if (action.payload.updates.accent) {
                widget.leftAccentColor = accent;
                widget.rightAccentColor = accent;
              }
              if (action.payload.updates.font) {
                widget.leftLabelFontFamily = themeFont;
                widget.rightLabelFontFamily = themeFont;
                widget.leftTitleFontFamily = themeFont;
                widget.rightTitleFontFamily = themeFont;
                widget.leftItemFontFamily = themeFont;
                widget.rightItemFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
              break;
            }
            case "pricingCard": {
              if (action.payload.updates.surface)
                widget.backgroundColor = surface;
              if (action.payload.updates.text) {
                widget.planNameColor = text;
                widget.priceColor = text;
                widget.periodColor = text;
                widget.featureColor = text;
              }
              if (action.payload.updates.accent) {
                widget.badgeColor = accent;
                widget.buttonColor = accent;
              }
              if (action.payload.updates.font) {
                widget.planNameFontFamily = themeFont;
                widget.priceFontFamily = themeFont;
                widget.periodFontFamily = themeFont;
                widget.badgeFontFamily = themeFont;
                widget.featureFontFamily = themeFont;
                widget.buttonFontFamily = themeFont;
              }
              if (action.payload.updates.cardBackgroundType)
                widget.backgroundType = cardBackgroundType;
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
  reorderSlides,
  resetSlidesState,
  setSlideTheme,
  updateGlobalTheme,
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
