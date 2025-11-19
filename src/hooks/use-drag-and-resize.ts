import { useCallback } from "react";
import type { SlideWidgetUpdate } from "@/components/editor/widgets/types";
import type { PointerSession } from "@/store/slices/editorUiSlice";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "@/hooks/use-canvas-viewport";
import type { ScreenToSlideTransform } from "@/hooks/use-canvas-viewport";

const MIN_WIDGET_SIZE = 32;

export const useDragAndResize = (screenToSlide: ScreenToSlideTransform) => {
  const clamp = useCallback(
    (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    []
  );

  const computeDrag = useCallback(
    (
      session: PointerSession,
      clientX: number,
      clientY: number
    ): SlideWidgetUpdate => {
      const { startPointer, startRect } = session;

      // Convert screen coordinates to slide coordinates
      const currentSlidePos = screenToSlide(clientX, clientY);
      const startSlidePos = screenToSlide(startPointer.x, startPointer.y);

      const dx = currentSlidePos.x - startSlidePos.x;
      const dy = currentSlidePos.y - startSlidePos.y;

      const x = clamp(startRect.x + dx, 0, SLIDE_WIDTH - startRect.width);
      const y = clamp(startRect.y + dy, 0, SLIDE_HEIGHT - startRect.height);

      return {
        x,
        y,
        width: startRect.width,
        height: startRect.height,
      };
    },
    [clamp, screenToSlide]
  );

  const computeResize = useCallback(
    (
      session: PointerSession,
      clientX: number,
      clientY: number
    ): SlideWidgetUpdate => {
      const { startPointer, startRect, handle } = session;
      if (!handle) {
        return startRect;
      }

      // Convert screen coordinates to slide coordinates
      const currentSlidePos = screenToSlide(clientX, clientY);
      const startSlidePos = screenToSlide(startPointer.x, startPointer.y);

      const dx = currentSlidePos.x - startSlidePos.x;
      const dy = currentSlidePos.y - startSlidePos.y;

      let { x, y, width, height } = startRect;

      const includes = (direction: "left" | "right" | "top" | "bottom") =>
        handle.includes(direction);

      if (includes("left")) {
        const proposedX = startRect.x + dx;
        const maxX = startRect.x + startRect.width - MIN_WIDGET_SIZE;
        const clampedX = clamp(proposedX, 0, maxX);
        width = clamp(
          startRect.width + (startRect.x - clampedX),
          MIN_WIDGET_SIZE,
          SLIDE_WIDTH
        );
        x = clamp(clampedX, 0, SLIDE_WIDTH - MIN_WIDGET_SIZE);
        if (x + width > SLIDE_WIDTH) {
          width = SLIDE_WIDTH - x;
        }
      }

      if (includes("right")) {
        const proposedWidth = startRect.width + dx;
        width = clamp(
          proposedWidth,
          MIN_WIDGET_SIZE,
          SLIDE_WIDTH - startRect.x
        );
      }

      if (includes("top")) {
        const proposedY = startRect.y + dy;
        const maxY = startRect.y + startRect.height - MIN_WIDGET_SIZE;
        const clampedY = clamp(proposedY, 0, maxY);
        height = clamp(
          startRect.height + (startRect.y - clampedY),
          MIN_WIDGET_SIZE,
          SLIDE_HEIGHT
        );
        y = clamp(clampedY, 0, SLIDE_HEIGHT - MIN_WIDGET_SIZE);
        if (y + height > SLIDE_HEIGHT) {
          height = SLIDE_HEIGHT - y;
        }
      }

      if (includes("bottom")) {
        const proposedHeight = startRect.height + dy;
        height = clamp(
          proposedHeight,
          MIN_WIDGET_SIZE,
          SLIDE_HEIGHT - startRect.y
        );
      }

      width = clamp(width, MIN_WIDGET_SIZE, SLIDE_WIDTH);
      height = clamp(height, MIN_WIDGET_SIZE, SLIDE_HEIGHT);
      x = clamp(x, 0, SLIDE_WIDTH - width);
      y = clamp(y, 0, SLIDE_HEIGHT - height);

      return { x, y, width, height };
    },
    [clamp, screenToSlide]
  );

  return {
    computeDrag,
    computeResize,
    MIN_WIDGET_SIZE,
  };
};

