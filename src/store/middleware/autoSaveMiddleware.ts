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

                // Check if slide ID looks like a database ID (cuid format) or a temporary ID
                // If it's a temporary ID (starts with "slide-" or is a nanoid), create a new slide
                const isTemporaryId =
                  slide.id.startsWith("slide-") || slide.id.length < 20;

                if (isTemporaryId) {
                  // Create new slide in database
                  const response = await addSlideService(presentationId, {
                    data: slideData,
                    order: index,
                  });

                  if (response.success && response.data) {
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
              !order.slideId.startsWith("slide-") && order.slideId.length >= 20
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
