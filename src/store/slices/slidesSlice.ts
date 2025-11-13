import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";
import type {
  SlideElement,
  SlideElementUpdate,
} from "@/components/editor/slide/types";
import type { RootState } from "@/store";

export type SlideModel = {
  id: string;
  title: string;
  elements: SlideElement[];
  backgroundColor?: string;
  backgroundImage?: string;
  showSlideNumber?: boolean;
  slideStyle?: string;
};

type SlidesState = {
  slides: SlideModel[];
  activeSlideId: string;
};

const createEmptySlide = (title: string): SlideModel => ({
  id: nanoid(),
  title,
  elements: [],
  backgroundColor: "#ffffff",
  backgroundImage: undefined,
  showSlideNumber: false,
  slideStyle: "Engineering Team Meeting",
});

const initialSlide = createEmptySlide("Slide 1");

const initialState: SlidesState = {
  slides: [initialSlide],
  activeSlideId: initialSlide.id,
};

const resolveSlide = (
  state: SlidesState,
  requestedSlideId?: string
): SlideModel | undefined => {
  const targetId = requestedSlideId ?? state.activeSlideId;
  return state.slides.find((slide) => slide.id === targetId);
};

const applyElementUpdates = (
  element: SlideElement,
  updates: SlideElementUpdate
) => {
  Object.assign(element, updates);
};

const slidesSlice = createSlice({
  name: "slides",
  initialState,
  reducers: {
    addSlide: {
      reducer(state, action: PayloadAction<SlideModel>) {
        state.slides.push(action.payload);
        state.activeSlideId = action.payload.id;
      },
      prepare(title?: string, elements?: SlideElement[]) {
        return {
          payload: {
            id: nanoid(),
            title: title ?? "Untitled slide",
            elements: elements ?? [],
          } satisfies SlideModel,
        };
      },
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
    addElement(
      state,
      action: PayloadAction<{ element: SlideElement; slideId?: string }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      const existingIndex = slide.elements.findIndex(
        (el) => el.id === action.payload.element.id
      );
      if (existingIndex >= 0) {
        slide.elements[existingIndex] = action.payload.element;
      } else {
        slide.elements.push(action.payload.element);
      }
    },
    updateElement(
      state,
      action: PayloadAction<{
        elementId: string;
        updates: SlideElementUpdate;
        slideId?: string;
      }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      const element = slide.elements.find(
        (el) => el.id === action.payload.elementId
      );
      if (!element) return;
      applyElementUpdates(element, action.payload.updates);
    },
    removeElement(
      state,
      action: PayloadAction<{ elementId: string; slideId?: string }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      slide.elements = slide.elements.filter(
        (el) => el.id !== action.payload.elementId
      );
    },
    replaceElements(
      state,
      action: PayloadAction<{ elements: SlideElement[]; slideId?: string }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      slide.elements = action.payload.elements;
    },
    updateSlide(
      state,
      action: PayloadAction<{
        slideId?: string;
        updates: Partial<Omit<SlideModel, "id" | "elements">>;
      }>
    ) {
      const slide = resolveSlide(state, action.payload.slideId);
      if (!slide) return;
      Object.assign(slide, action.payload.updates);
    },
    resetSlidesState() {
      return initialState;
    },
  },
});

export const {
  addSlide,
  setActiveSlide,
  removeSlide,
  addElement,
  updateElement,
  removeElement,
  replaceElements,
  updateSlide,
  resetSlidesState,
} = slidesSlice.actions;

export const selectSlidesState = (state: RootState) => state.slides;
export const selectSlides = (state: RootState) => state.slides.slides;
export const selectActiveSlideId = (state: RootState) =>
  state.slides.activeSlideId;
export const selectActiveSlide = (state: RootState) =>
  state.slides.slides.find(
    (slide) => slide.id === state.slides.activeSlideId
  ) ?? null;
export const selectActiveSlideElements = (state: RootState) =>
  selectActiveSlide(state)?.elements ?? [];

export default slidesSlice.reducer;
