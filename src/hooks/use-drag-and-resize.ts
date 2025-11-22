import { useCallback } from "react";
import type {
  SlideWidget,
  SlideWidgetUpdate,
  SnapLine,
} from "@/components/editor/widgets/types";
import type { PointerSession } from "@/store/slices/editorUiSlice";
import { SLIDE_WIDTH, SLIDE_HEIGHT } from "@/hooks/use-canvas-viewport";
import type { ScreenToSlideTransform } from "@/hooks/use-canvas-viewport";

const MIN_WIDGET_SIZE = 32;
const SNAP_THRESHOLD = 5;

type ComputeDragResult = {
  updates: SlideWidgetUpdate;
  snapLines: SnapLine[];
};

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
      clientY: number,
      otherWidgets: SlideWidget[] = []
    ): ComputeDragResult => {
      const { startPointer, startRect } = session;

      // Convert screen coordinates to slide coordinates
      const currentSlidePos = screenToSlide(clientX, clientY);
      const startSlidePos = screenToSlide(startPointer.x, startPointer.y);

      const rawDx = currentSlidePos.x - startSlidePos.x;
      const rawDy = currentSlidePos.y - startSlidePos.y;

      let proposedX = startRect.x + rawDx;
      let proposedY = startRect.y + rawDy;
      const width = startRect.width;
      const height = startRect.height;

      // Snapping Logic
      const snapLines: SnapLine[] = [];

      // 1. Collect snap candidates (vertical and horizontal lines)
      // format: { value: number, start: number, end: number }
      const vCandidates: { value: number; start: number; end: number }[] = [
        { value: 0, start: 0, end: SLIDE_HEIGHT }, // Slide left
        { value: SLIDE_WIDTH / 2, start: 0, end: SLIDE_HEIGHT }, // Slide center
        { value: SLIDE_WIDTH, start: 0, end: SLIDE_HEIGHT }, // Slide right
      ];
      const hCandidates: { value: number; start: number; end: number }[] = [
        { value: 0, start: 0, end: SLIDE_WIDTH }, // Slide top
        { value: SLIDE_HEIGHT / 2, start: 0, end: SLIDE_WIDTH }, // Slide middle
        { value: SLIDE_HEIGHT, start: 0, end: SLIDE_WIDTH }, // Slide bottom
      ];

      otherWidgets.forEach((w) => {
        // Vertical lines from other widgets (left, center, right)
        vCandidates.push({ value: w.x, start: w.y, end: w.y + w.height });
        vCandidates.push({
          value: w.x + w.width / 2,
          start: w.y,
          end: w.y + w.height,
        });
        vCandidates.push({
          value: w.x + w.width,
          start: w.y,
          end: w.y + w.height,
        });

        // Horizontal lines from other widgets (top, middle, bottom)
        hCandidates.push({ value: w.y, start: w.x, end: w.x + w.width });
        hCandidates.push({
          value: w.y + w.height / 2,
          start: w.x,
          end: w.x + w.width,
        });
        hCandidates.push({
          value: w.y + w.height,
          start: w.x,
          end: w.x + w.width,
        });
      });

      // 2. Find closest vertical snap
      // We check dragged widget's left, center, right against candidates
      const vPoints = [
        { offset: 0, type: "left" },
        { offset: width / 2, type: "center" },
        { offset: width, type: "right" },
      ];

      type SnapResult = {
        candidateValue: number;
        offset: number;
        candidate: { value: number; start: number; end: number };
      };

      let bestVDiff = SNAP_THRESHOLD + 1;
      let bestVSnap: SnapResult | null = null;

      for (const point of vPoints) {
        const currentX = proposedX + point.offset;
        for (const candidate of vCandidates) {
          const diff = Math.abs(currentX - candidate.value);
          if (diff < bestVDiff) {
            bestVDiff = diff;
            bestVSnap = {
              candidateValue: candidate.value,
              offset: point.offset,
              candidate,
            };
          }
        }
      }

      if (bestVSnap !== null && bestVDiff <= SNAP_THRESHOLD) {
        proposedX = bestVSnap.candidateValue - bestVSnap.offset;
        // Add snap line
        snapLines.push({
          type: "vertical",
          position: bestVSnap.candidateValue,
          start: Math.min(proposedY, bestVSnap.candidate.start),
          end: Math.max(proposedY + height, bestVSnap.candidate.end),
        });
      }

      // 3. Find closest horizontal snap
      // We check dragged widget's top, middle, bottom against candidates
      const hPoints = [
        { offset: 0, type: "top" },
        { offset: height / 2, type: "middle" },
        { offset: height, type: "bottom" },
      ];

      let bestHDiff = SNAP_THRESHOLD + 1;
      let bestHSnap: SnapResult | null = null;

      for (const point of hPoints) {
        const currentY = proposedY + point.offset;
        for (const candidate of hCandidates) {
          const diff = Math.abs(currentY - candidate.value);
          if (diff < bestHDiff) {
            bestHDiff = diff;
            bestHSnap = {
              candidateValue: candidate.value,
              offset: point.offset,
              candidate,
            };
          }
        }
      }

      if (bestHSnap !== null && bestHDiff <= SNAP_THRESHOLD) {
        proposedY = bestHSnap.candidateValue - bestHSnap.offset;
        // Add snap line
        snapLines.push({
          type: "horizontal",
          position: bestHSnap.candidateValue,
          start: Math.min(proposedX, bestHSnap.candidate.start),
          end: Math.max(proposedX + width, bestHSnap.candidate.end),
        });
      }

      return {
        updates: {
          x: proposedX,
          y: proposedY,
          width: startRect.width,
          height: startRect.height,
        },
        snapLines,
      };
    },
    [screenToSlide]
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
        const clampedX = clamp(proposedX, Number.NEGATIVE_INFINITY, maxX);
        width = clamp(
          startRect.width + (startRect.x - clampedX),
          MIN_WIDGET_SIZE,
          Number.POSITIVE_INFINITY
        );
        x = clampedX;
      }

      if (includes("right")) {
        const proposedWidth = startRect.width + dx;
        width = clamp(proposedWidth, MIN_WIDGET_SIZE, Number.POSITIVE_INFINITY);
      }

      if (includes("top")) {
        const proposedY = startRect.y + dy;
        const maxY = startRect.y + startRect.height - MIN_WIDGET_SIZE;
        const clampedY = clamp(proposedY, Number.NEGATIVE_INFINITY, maxY);
        height = clamp(
          startRect.height + (startRect.y - clampedY),
          MIN_WIDGET_SIZE,
          Number.POSITIVE_INFINITY
        );
        y = clampedY;
      }

      if (includes("bottom")) {
        const proposedHeight = startRect.height + dy;
        height = clamp(
          proposedHeight,
          MIN_WIDGET_SIZE,
          Number.POSITIVE_INFINITY
        );
      }

      // Only enforce minimum size constraints, no boundary limits
      width = clamp(width, MIN_WIDGET_SIZE, Number.POSITIVE_INFINITY);
      height = clamp(height, MIN_WIDGET_SIZE, Number.POSITIVE_INFINITY);

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
