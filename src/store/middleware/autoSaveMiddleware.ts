import { Middleware, type AnyAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import {
  addSlide,
  removeSlide,
  updateWidget,
  addWidget,
  removeWidget,
  replaceWidgets,
  updateSlide,
  reorderSlides,
  updateGlobalTheme,
  setSlideTheme,
  updateSlideId,
  loadPresentation,
} from "@/store/slices/slidesSlice";
import type { SlideModel } from "@/store/slices/slidesSlice";
import type { SlideWidget } from "@/components/editor/widgets/types";
import {
  updateSlide as updateSlideService,
  updatePresentation,
  reorderSlides as reorderSlidesService,
  addSlide as addSlideService,
} from "@/services/presentation";

// Track pending saves
type PendingSlideSave = {
  slideId: string;
  data: unknown;
  timeout: NodeJS.Timeout;
};

const pendingSlideSaves = new Map<string, PendingSlideSave>();

// Track slides that have been created in the database
// This helps us distinguish between temporary IDs (nanoid) and database IDs (cuid)
const createdSlideIds = new Set<string>();

type PendingPresentationUpdate = {
  presentationId: string | null;
  globalTheme: unknown;
  timeout: NodeJS.Timeout | null;
};

const pendingPresentationUpdate: PendingPresentationUpdate = {
  presentationId: null,
  globalTheme: null,
  timeout: null,
};

type PendingReorder = {
  presentationId: string | null;
  slideOrders: { slideId: string; order: number }[];
  timeout: NodeJS.Timeout | null;
};

const pendingReorder: PendingReorder = {
  presentationId: null,
  slideOrders: [],
  timeout: null,
};

// Debounce delay (ms)
const SAVE_DELAY = 2000; // 2 seconds

function createAutoSaveMiddleware() {
  return (store: {
      getState: () => RootState;
      dispatch: (action: AnyAction) => void;
    }) =>
    (next: (action: AnyAction) => AnyAction) =>
    (action: AnyAction) => {
      const result = next(action);
      const state = store.getState();

      const presentationId = state.slides.presentationId;

      // Don't save if no presentationId
      if (!presentationId) {
        return result;
      }

      // Handle loadPresentation - initialize createdSlideIds with loaded slide IDs
      if (action.type === loadPresentation.type) {
        const { slides } = action.payload as { slides: SlideModel[] };
        // Mark all loaded slides as created in database
        slides.forEach((slide) => {
          createdSlideIds.add(slide.id);
        });
        return result;
      }

      // Handle updateSlideId action - update pending saves when slide ID changes
      if (action.type === updateSlideId.type) {
        const { oldId, newId } = action.payload as {
          oldId: string;
          newId: string;
        };
        const pendingSave = pendingSlideSaves.get(oldId);

        if (pendingSave) {
          // Cancel the old pending save
          clearTimeout(pendingSave.timeout);
          pendingSlideSaves.delete(oldId);

          // Get the current slide data from Redux state (which now has the new ID)
          const currentState = store.getState();
          const updatedSlide = currentState.slides.slides.find(
            (slide) => slide.id === newId
          );

          if (updatedSlide) {
            // Mark this slide as created in database
            createdSlideIds.add(newId);

            // Reschedule the save with the new ID and current data
            const timeout = setTimeout(async () => {
              try {
                // Prepare slide data matching your SlideModel structure
                const slideData: Partial<SlideModel> = {
                  id: newId,
                  title: updatedSlide.title,
                  widgets: updatedSlide.widgets as SlideWidget[],
                  backgroundColor: updatedSlide.backgroundColor,
                  backgroundImage: updatedSlide.backgroundImage,
                  showSlideNumber: updatedSlide.showSlideNumber,
                  slideStyle: updatedSlide.slideStyle,
                };

                // Now update the existing slide with the new database ID
                await updateSlideService(newId, { data: slideData });
                pendingSlideSaves.delete(newId);
              } catch (error) {
                console.error(`Failed to save slide ${newId}:`, error);
              }
            }, SAVE_DELAY);

            pendingSlideSaves.set(newId, {
              slideId: newId,
              data: updatedSlide,
              timeout,
            });
          }
        } else {
          // Even if no pending save, mark the new ID as created
          createdSlideIds.add(newId);
        }

        return result;
      }

      // Handle slide-level changes
      const slideActions: string[] = [
        addSlide.type,
        removeSlide.type,
        updateWidget.type,
        addWidget.type,
        removeWidget.type,
        replaceWidgets.type,
        updateSlide.type,
      ];

      if (slideActions.includes(action.type as string)) {
        const slides = state.slides.slides;

        // Cancel existing pending saves
        pendingSlideSaves.forEach((pending) => clearTimeout(pending.timeout));
        pendingSlideSaves.clear();

        // Schedule save for each slide
        slides.forEach(
          (
            slide: {
              id: string;
              title: string;
              widgets: unknown[];
              backgroundColor?: string[];
              backgroundImage?: string;
              showSlideNumber?: boolean;
              slideStyle?: string;
            },
            index: number
          ) => {
            const existing = pendingSlideSaves.get(slide.id);
            if (existing) {
              clearTimeout(existing.timeout);
            }

            const timeout = setTimeout(async () => {
              try {
                // Prepare slide data matching your SlideModel structure
                const slideData: Partial<SlideModel> = {
                  id: slide.id,
                  title: slide.title,
                  widgets: slide.widgets as SlideWidget[],
                  backgroundColor: slide.backgroundColor,
                  backgroundImage: slide.backgroundImage,
                  showSlideNumber: slide.showSlideNumber,
                  slideStyle: slide.slideStyle,
                };

                // Check if slide ID has been created in database
                // Database IDs (cuid) typically start with 'c' and are 25 characters
                // Temporary IDs (nanoid) are 21 characters and not in createdSlideIds
                const isDatabaseId =
                  createdSlideIds.has(slide.id) ||
                  (slide.id.startsWith("c") && slide.id.length === 25);

                if (!isDatabaseId) {
                  // Create new slide in database
                  const response = await addSlideService(presentationId, {
                    data: slideData,
                    order: index,
                  });

                  if (response.success && response.data) {
                    // Mark as created
                    createdSlideIds.add(response.data.id);

                    // Update the slide ID in Redux with the database ID
                    store.dispatch(
                      updateSlideId({
                        oldId: slide.id,
                        newId: response.data.id,
                      })
                    );
                  }
                } else {
                  // Update existing slide
                  await updateSlideService(slide.id, { data: slideData });
                }

                pendingSlideSaves.delete(slide.id);
              } catch (error) {
                console.error(`Failed to save slide ${slide.id}:`, error);
              }
            }, SAVE_DELAY);

            pendingSlideSaves.set(slide.id, {
              slideId: slide.id,
              data: slide,
              timeout,
            });
          }
        );
      }

      // Handle slide reordering
      if (action.type === reorderSlides.type) {
        if (pendingReorder.timeout) {
          clearTimeout(pendingReorder.timeout);
        }

        const slides = state.slides.slides;
        // Filter out temporary slide IDs (they don't exist in DB yet)
        const slideOrders = slides
          .map((slide: { id: string }, index: number) => ({
            slideId: slide.id,
            order: index,
          }))
          .filter(
            (order: { slideId: string; order: number }) =>
              createdSlideIds.has(order.slideId) ||
              (order.slideId.startsWith("c") && order.slideId.length === 25)
          );

        if (slideOrders.length > 0) {
          pendingReorder.timeout = setTimeout(async () => {
            try {
              await reorderSlidesService(presentationId, slideOrders);
              pendingReorder.presentationId = null;
              pendingReorder.slideOrders = [];
              pendingReorder.timeout = null;
            } catch (error) {
              console.error("Failed to reorder slides:", error);
            }
          }, SAVE_DELAY);

          pendingReorder.presentationId = presentationId;
          pendingReorder.slideOrders = slideOrders;
        }
      }

      // Handle presentation-level changes (globalTheme)
      const presentationActions: string[] = [
        updateGlobalTheme.type,
        setSlideTheme.type,
      ];

      if (presentationActions.includes(action.type as string)) {
        if (pendingPresentationUpdate.timeout) {
          clearTimeout(pendingPresentationUpdate.timeout);
        }

        pendingPresentationUpdate.timeout = setTimeout(async () => {
          try {
            await updatePresentation(presentationId, {
              globalTheme: state.slides.globalTheme,
            });
            pendingPresentationUpdate.presentationId = null;
            pendingPresentationUpdate.timeout = null;
          } catch (error) {
            console.error("Failed to save presentation:", error);
          }
        }, SAVE_DELAY);

        pendingPresentationUpdate.presentationId = presentationId;
        pendingPresentationUpdate.globalTheme = state.slides.globalTheme;
      }

      return result;
    };
}

// Type assertion to avoid circular reference
const _middleware = createAutoSaveMiddleware();
export const autoSaveMiddleware: Middleware<
  Record<string, never>,
  RootState
> = _middleware as unknown as Middleware<Record<string, never>, RootState>;
