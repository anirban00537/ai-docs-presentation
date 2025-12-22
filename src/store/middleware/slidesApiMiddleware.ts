import { Middleware } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store";
import {
  addSlide as addSlideAction,
  deleteSlide as deleteSlideAction,
  setActiveSlide as setActiveSlideAction,
  setSlides as setSlidesAction,
  replaceSlideWithServerData,
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
      // Include accent if present (for accent image templates)
      ...(reduxSlide.accent && { accent: reduxSlide.accent }),
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

  const { slides: currentSlides, theme: currentTheme } = state.slides.present;

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
    (slide: Slide) => !previousSlidesState.find((ps: Slide) => ps.id === slide.id)
  );

  // Create new slides
  for (const newSlide of newSlides) {
    try {
      const order = currentSlides.findIndex((s: Slide) => s.id === newSlide.id);
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
  const updatedSlides = currentSlides.filter((slide: Slide) => {
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
  const reordered = currentSlides.some((slide: Slide, index: number) => {
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
      previousSlidesState = JSON.parse(JSON.stringify(state.slides.present.slides));
      previousThemeState = JSON.parse(JSON.stringify(state.slides.present.theme));
      return result;
    }

    // Handle addSlide action immediately (no debounce for creation)
    if (addSlideAction.match(action)) {
      const newSlide = state.slides.present.slides[state.slides.present.slides.length - 1];
      if (newSlide) {
        const clientId = newSlide.id; // Store client-side ID
        const apiData = convertReduxSlideToApi(newSlide);
        createSlide(currentPresentationId, {
          ...apiData,
          // Don't send order - let backend calculate maxOrder + 1 to add at the end
        })
          .then((response) => {
            if (response.success && response.data) {
              // Get current state to preserve any updates (like template rows)
              const currentState = store.getState();
              const currentSlide = currentState.slides.present.slides.find(
                (s: Slide) => s.id === clientId
              );

              // Convert API Slide format to Redux Slide format
              // Preserve current rows if they exist (template may have been applied)
              // Also preserve accent if template had one
              const serverSlide: Slide = {
                id: response.data.id,
                rows: currentSlide?.rows?.length
                  ? currentSlide.rows // Use current rows if template was applied
                  : response.data.data?.rows || [], // Otherwise use server rows
                // Preserve accent from template if it exists, or use server accent
                ...(currentSlide?.accent 
                  ? { accent: currentSlide.accent }
                  : response.data.data?.accent 
                    ? { accent: response.data.data.accent }
                    : {}),
              };

              // Replace client-side slide with server-side slide
              store.dispatch(
                replaceSlideWithServerData({
                  clientId,
                  serverSlide,
                })
              );

              // If template was applied, immediately sync to server
              if (currentSlide?.rows?.length) {
                const finalState = store.getState();
                const finalSlide = finalState.slides.present.slides.find(
                  (s: Slide) => s.id === response.data.id
                );
                if (finalSlide) {
                  const updateData = convertReduxSlideToApi(finalSlide);
                  updateSlide(currentPresentationId!, finalSlide.id, updateData)
                    .then(() => {
                      // Update previous state after successful update
                      const updatedState = store.getState();
                      previousSlidesState = JSON.parse(
                        JSON.stringify(updatedState.slides.present.slides)
                      );
                    })
                    .catch((error) => {
                      console.error(
                        "Failed to update slide with template:",
                        error
                      );
                    });
                }
              } else {
                // Update previous state after successful creation
                const updatedState = store.getState();
                previousSlidesState = JSON.parse(
                  JSON.stringify(updatedState.slides.present.slides)
                );
              }
            }
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
          previousSlidesState = JSON.parse(JSON.stringify(state.slides.present.slides));
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
