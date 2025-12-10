import { Middleware } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store";
import {
  addSlide as addSlideAction,
  deleteSlide as deleteSlideAction,
  setActiveSlide as setActiveSlideAction,
  setSlides as setSlidesAction,
  Slide,
} from "@/store/slices/slidesSlice";
import {
  createSlide,
  updateSlide,
  updatePresentation,
  deleteSlide,
} from "@/services/presentation";
import { toast } from "sonner";

// Convert Redux slide to API format
const convertReduxSlideToApi = (reduxSlide: Slide): any => {
  return {
    data: {
      rows: reduxSlide.rows,
    },
  };
};

// Store presentation ID (set from component)
let currentPresentationId: string | null = null;

export const setPresentationId = (id: string | null) => {
  currentPresentationId = id;
};

// Track previous state for comparison
let previousSlidesState: Slide[] = [];
let previousThemeState: any = null;

// Debounce function to batch updates
let stateUpdateTimeout: NodeJS.Timeout | null = null;
const STATE_UPDATE_DEBOUNCE_DELAY = 800; // 800ms debounce for all state updates

// Unified function to sync all state changes to API
const syncStateToApi = async (state: RootState) => {
  if (!currentPresentationId) return;

  const { slides: currentSlides, theme: currentTheme } = state.slides;

  // Update theme if it changed
  const themeChanged =
    JSON.stringify(previousThemeState) !== JSON.stringify(currentTheme);
  if (themeChanged) {
    try {
      await updatePresentation(currentPresentationId, {
        globalTheme: currentTheme,
      });
      previousThemeState = JSON.parse(JSON.stringify(currentTheme));
    } catch (error) {
      console.error("Failed to update theme:", error);
      toast.error("Failed to save theme");
    }
  }

  // Handle slides updates

  // Check for new slides (slides added)
  const newSlides = currentSlides.filter(
    (slide) => !previousSlidesState.find((ps) => ps.id === slide.id)
  );

  // Create new slides
  for (const newSlide of newSlides) {
    try {
      const order = currentSlides.findIndex((s) => s.id === newSlide.id);
      const apiData = convertReduxSlideToApi(newSlide);
      await createSlide(currentPresentationId, {
        ...apiData,
        order,
      });
    } catch (error) {
      console.error("Failed to create slide:", error);
      toast.error("Failed to save slide");
    }
  }

  // Check for updated slides (compare by JSON stringify)
  const updatedSlides = currentSlides.filter((slide) => {
    const previousSlide = previousSlidesState.find((ps) => ps.id === slide.id);
    if (!previousSlide) return false;
    return JSON.stringify(previousSlide) !== JSON.stringify(slide);
  });

  // Update changed slides
  for (const updatedSlide of updatedSlides) {
    try {
      const apiData = convertReduxSlideToApi(updatedSlide);
      await updateSlide(currentPresentationId, updatedSlide.id, apiData);
    } catch (error) {
      console.error("Failed to update slide:", error);
      toast.error("Failed to update slide");
    }
  }

  // Check for reordered slides - if order changed, update all slides
  // This ensures order is preserved in the database
  const reordered = currentSlides.some((slide, index) => {
    const prevIndex = previousSlidesState.findIndex((ps) => ps.id === slide.id);
    return prevIndex !== -1 && prevIndex !== index;
  });

  // If slides were reordered, update all slides to ensure order is correct
  // The order is determined by the array position, so we update all slides
  if (reordered && currentSlides.length > 0) {
    // Update all slides to ensure order is preserved
    // This is a bit inefficient but ensures consistency
    for (const slide of currentSlides) {
      try {
        const apiData = convertReduxSlideToApi(slide);
        await updateSlide(currentPresentationId, slide.id, apiData);
      } catch (error) {
        console.error("Failed to update slide order:", error);
        // Don't show toast for each failed update, just log
      }
    }
  }

  // Update previous state
  previousSlidesState = JSON.parse(JSON.stringify(currentSlides));
};

// Middleware to handle slide API operations
export const slidesApiMiddleware: Middleware<object, RootState, AppDispatch> =
  (store) => (next) => (action: any) => {
    const result = next(action);
    const state = store.getState();

    // Only proceed if we have a presentation ID
    if (!currentPresentationId) {
      return result;
    }

    // Skip actions that don't modify data
    if (
      setActiveSlideAction.match(action) ||
      action.type === "slides/setActiveSlide"
    ) {
      return result;
    }

    // Skip setSlides action (used for initial load, handled separately)
    if (setSlidesAction.match(action)) {
      // Update previous state but don't sync (initial load)
      previousSlidesState = JSON.parse(JSON.stringify(state.slides.slides));
      previousThemeState = JSON.parse(JSON.stringify(state.slides.theme));
      return result;
    }

    // Handle addSlide action immediately (no debounce for creation)
    if (addSlideAction.match(action)) {
      const newSlide = state.slides.slides[state.slides.slides.length - 1];
      if (newSlide) {
        const apiData = convertReduxSlideToApi(newSlide);
        createSlide(currentPresentationId, {
          ...apiData,
          order: state.slides.slides.length - 1,
        })
          .then(() => {
            // Update previous state after successful creation
            previousSlidesState = JSON.parse(
              JSON.stringify(state.slides.slides)
            );
          })
          .catch((error) => {
            console.error("Failed to create slide:", error);
            toast.error("Failed to save slide");
          });
      }
      return result;
    }

    // Handle deleteSlide action immediately (no debounce for deletion)
    if (deleteSlideAction.match(action)) {
      const slideId = action.payload;
      // The slide has already been removed from state by the reducer
      // We need to delete it from the backend
      deleteSlide(currentPresentationId, slideId)
        .then(() => {
          // Update previous state after successful deletion
          previousSlidesState = JSON.parse(
            JSON.stringify(state.slides.slides)
          );
        })
        .catch((error) => {
          console.error("Failed to delete slide:", error);
          toast.error("Failed to delete slide");
        });
      return result;
    }

    // For all other slides slice actions, debounce and sync
    if (action.type?.startsWith("slides/")) {
      // Clear existing timeout
      if (stateUpdateTimeout) {
        clearTimeout(stateUpdateTimeout);
      }

      // Debounce the state sync
      stateUpdateTimeout = setTimeout(() => {
        syncStateToApi(store.getState());
      }, STATE_UPDATE_DEBOUNCE_DELAY);
    }

    return result;
  };
