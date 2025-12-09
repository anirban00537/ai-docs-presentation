import { Middleware } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "@/store";
import {
  addSlide as addSlideAction,
  updateBlockContent as updateBlockContentAction,
  addRowWithColumns as addRowWithColumnsAction,
  addRowAtTop as addRowAtTopAction,
  deleteRow as deleteRowAction,
  addBlockToRow as addBlockToRowAction,
  Slide,
} from "@/store/slices/slidesSlice";
import { createSlide, updateSlide } from "@/services/presentation";
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

// Debounce function to batch updates
let updateTimeout: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 500; // 500ms debounce

// Middleware to handle slide API operations
export const slidesApiMiddleware: Middleware<object, RootState, AppDispatch> =
  (store) => (next) => (action: any) => {
    const result = next(action);
    const state = store.getState();
    const slides = state.slides.slides;

    // Only proceed if we have a presentation ID
    if (!currentPresentationId) {
      return result;
    }

    // Handle addSlide action
    if (addSlideAction.match(action)) {
      const newSlide = slides[slides.length - 1];
      if (newSlide) {
        const apiData = convertReduxSlideToApi(newSlide);
        if (currentPresentationId) {
          createSlide(currentPresentationId, {
            ...apiData,
            order: slides.length - 1,
          }).catch((error) => {
            console.error("Failed to create slide:", error);
            toast.error("Failed to save slide");
          });
        }
      }
      return result;
    }

    // Handle update actions (debounced)
    const updateActions = [
      updateBlockContentAction,
      addRowWithColumnsAction,
      addRowAtTopAction,
      addBlockToRowAction,
      deleteRowAction,
    ];

    const isUpdateAction = updateActions.some((actionType) =>
      actionType.match(action)
    );

    if (isUpdateAction) {
      // Clear existing timeout
      if (updateTimeout) {
        clearTimeout(updateTimeout);
      }

      // Debounce the update
      updateTimeout = setTimeout(() => {
        const { slideId } = action.payload as { slideId: string };
        const slide = slides.find((s) => s.id === slideId);
        if (slide && currentPresentationId) {
          const apiData = convertReduxSlideToApi(slide);
          updateSlide(currentPresentationId, slideId, apiData).catch(
            (error) => {
              console.error("Failed to update slide:", error);
              toast.error("Failed to update slide");
            }
          );
        }
      }, DEBOUNCE_DELAY);
    }

    return result;
  };
