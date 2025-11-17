import { useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import {
  selectElement as selectElementAction,
  stopEditing as stopEditingAction,
} from "@/store/slices/editorUiSlice";

export const useCanvasInteractions = () => {
  const dispatch = useAppDispatch();

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Check if clicking on the canvas background (not on an element)
      const target = event.target as HTMLElement;
      const slideElement = target.closest('[data-slide-container="true"]');

      // If clicking directly on the slide background or empty area
      if (
        target.classList.contains("slide") ||
        (slideElement &&
          target.closest(".canvas-element") === null)
      ) {
        dispatch(selectElementAction(null));
        dispatch(stopEditingAction());
      }
    },
    [dispatch]
  );

  return {
    handleCanvasPointerDown,
  };
};

