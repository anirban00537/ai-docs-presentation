import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  selectWidget as selectWidgetAction,
  stopWidgetEditing as stopWidgetEditingAction,
} from "@/store/slices/editorUiSlice";

export const useCanvasInteractions = () => {
  const dispatch = useAppDispatch();

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Check if clicking on the canvas background (not on a widget)
      const target = event.target as HTMLElement;
      const slideWidget = target.closest('[data-slide-container="true"]');

      // If clicking directly on the slide background or empty area
      if (
        target.classList.contains("slide") ||
        (slideWidget &&
          target.closest(".canvas-element") === null)
      ) {
        dispatch(selectWidgetAction(null));
        dispatch(stopWidgetEditingAction());
      }
    },
    [dispatch]
  );

  return {
    handleCanvasPointerDown,
  };
};

