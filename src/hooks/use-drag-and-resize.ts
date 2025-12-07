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

type ComputeResizeResult = {
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

      // Margin guides: common margins from slide edges
      const MARGIN_GUIDES = [32, 64, 96];
      MARGIN_GUIDES.forEach((margin) => {
        // Vertical margins (from left and right)
        vCandidates.push({ value: margin, start: 0, end: SLIDE_HEIGHT });
        vCandidates.push({ value: SLIDE_WIDTH - margin, start: 0, end: SLIDE_HEIGHT });
        // Horizontal margins (from top and bottom)
        hCandidates.push({ value: margin, start: 0, end: SLIDE_WIDTH });
        hCandidates.push({ value: SLIDE_HEIGHT - margin, start: 0, end: SLIDE_WIDTH });
      });

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
      clientY: number,
      otherWidgets: SlideWidget[] = []
    ): ComputeResizeResult => {
      const { startPointer, startRect, handle } = session;
      if (!handle) {
        return { updates: startRect, snapLines: [] };
      }

      // Convert screen coordinates to slide coordinates
      const currentSlidePos = screenToSlide(clientX, clientY);
      const startSlidePos = screenToSlide(startPointer.x, startPointer.y);

      const dx = currentSlidePos.x - startSlidePos.x;
      const dy = currentSlidePos.y - startSlidePos.y;

      let { x, y, width, height } = startRect;

      const includes = (direction: "left" | "right" | "top" | "bottom") =>
        handle.includes(direction);

      // Calculate proposed dimensions first (without snapping)
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

      // Snapping Logic for resize
      const snapLines: SnapLine[] = [];
      
      // Margin guides: common margins from slide edges
      const MARGIN_GUIDES = [32, 64, 96];

      // Build snap candidates for the edges being resized
      const vCandidates: { value: number; start: number; end: number }[] = [
        { value: 0, start: 0, end: SLIDE_HEIGHT }, // Slide left edge
        { value: SLIDE_WIDTH, start: 0, end: SLIDE_HEIGHT }, // Slide right edge
        { value: SLIDE_WIDTH / 2, start: 0, end: SLIDE_HEIGHT }, // Slide horizontal center
      ];
      const hCandidates: { value: number; start: number; end: number }[] = [
        { value: 0, start: 0, end: SLIDE_WIDTH }, // Slide top edge
        { value: SLIDE_HEIGHT, start: 0, end: SLIDE_WIDTH }, // Slide bottom edge
        { value: SLIDE_HEIGHT / 2, start: 0, end: SLIDE_WIDTH }, // Slide vertical center
      ];

      // Add margin guides
      MARGIN_GUIDES.forEach((margin) => {
        // Vertical margins (from left and right)
        vCandidates.push({ value: margin, start: 0, end: SLIDE_HEIGHT });
        vCandidates.push({ value: SLIDE_WIDTH - margin, start: 0, end: SLIDE_HEIGHT });
        // Horizontal margins (from top and bottom)
        hCandidates.push({ value: margin, start: 0, end: SLIDE_WIDTH });
        hCandidates.push({ value: SLIDE_HEIGHT - margin, start: 0, end: SLIDE_WIDTH });
      });

      // Add other widgets' edges
      otherWidgets.forEach((w) => {
        vCandidates.push({ value: w.x, start: w.y, end: w.y + w.height }); // Left
        vCandidates.push({ value: w.x + w.width, start: w.y, end: w.y + w.height }); // Right
        vCandidates.push({ value: w.x + w.width / 2, start: w.y, end: w.y + w.height }); // Center
        hCandidates.push({ value: w.y, start: w.x, end: w.x + w.width }); // Top
        hCandidates.push({ value: w.y + w.height, start: w.x, end: w.x + w.width }); // Bottom
        hCandidates.push({ value: w.y + w.height / 2, start: w.x, end: w.x + w.width }); // Middle
      });

      type SnapResult = {
        candidateValue: number;
        candidate: { value: number; start: number; end: number };
      };

      // Snap left edge
      if (includes("left")) {
        let bestDiff = SNAP_THRESHOLD + 1;
        let bestSnap: SnapResult | null = null;
        for (const candidate of vCandidates) {
          const diff = Math.abs(x - candidate.value);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSnap = { candidateValue: candidate.value, candidate };
          }
        }
        if (bestSnap !== null && bestDiff <= SNAP_THRESHOLD) {
          const originalRight = x + width;
          x = bestSnap.candidateValue;
          width = originalRight - x;
          if (width >= MIN_WIDGET_SIZE) {
            snapLines.push({
              type: "vertical",
              position: bestSnap.candidateValue,
              start: Math.min(y, bestSnap.candidate.start),
              end: Math.max(y + height, bestSnap.candidate.end),
            });
          } else {
            // If width would be too small, revert
            x = originalRight - MIN_WIDGET_SIZE;
            width = MIN_WIDGET_SIZE;
          }
        }
      }

      // Snap right edge
      if (includes("right")) {
        const rightEdge = x + width;
        let bestDiff = SNAP_THRESHOLD + 1;
        let bestSnap: SnapResult | null = null;
        for (const candidate of vCandidates) {
          const diff = Math.abs(rightEdge - candidate.value);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSnap = { candidateValue: candidate.value, candidate };
          }
        }
        if (bestSnap !== null && bestDiff <= SNAP_THRESHOLD) {
          const newWidth = bestSnap.candidateValue - x;
          if (newWidth >= MIN_WIDGET_SIZE) {
            width = newWidth;
            snapLines.push({
              type: "vertical",
              position: bestSnap.candidateValue,
              start: Math.min(y, bestSnap.candidate.start),
              end: Math.max(y + height, bestSnap.candidate.end),
            });
          }
        }
      }

      // Snap top edge
      if (includes("top")) {
        let bestDiff = SNAP_THRESHOLD + 1;
        let bestSnap: SnapResult | null = null;
        for (const candidate of hCandidates) {
          const diff = Math.abs(y - candidate.value);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSnap = { candidateValue: candidate.value, candidate };
          }
        }
        if (bestSnap !== null && bestDiff <= SNAP_THRESHOLD) {
          const originalBottom = y + height;
          y = bestSnap.candidateValue;
          height = originalBottom - y;
          if (height >= MIN_WIDGET_SIZE) {
            snapLines.push({
              type: "horizontal",
              position: bestSnap.candidateValue,
              start: Math.min(x, bestSnap.candidate.start),
              end: Math.max(x + width, bestSnap.candidate.end),
            });
          } else {
            // If height would be too small, revert
            y = originalBottom - MIN_WIDGET_SIZE;
            height = MIN_WIDGET_SIZE;
          }
        }
      }

      // Snap bottom edge
      if (includes("bottom")) {
        const bottomEdge = y + height;
        let bestDiff = SNAP_THRESHOLD + 1;
        let bestSnap: SnapResult | null = null;
        for (const candidate of hCandidates) {
          const diff = Math.abs(bottomEdge - candidate.value);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestSnap = { candidateValue: candidate.value, candidate };
          }
        }
        if (bestSnap !== null && bestDiff <= SNAP_THRESHOLD) {
          const newHeight = bestSnap.candidateValue - y;
          if (newHeight >= MIN_WIDGET_SIZE) {
            height = newHeight;
            snapLines.push({
              type: "horizontal",
              position: bestSnap.candidateValue,
              start: Math.min(x, bestSnap.candidate.start),
              end: Math.max(x + width, bestSnap.candidate.end),
            });
          }
        }
      }

      // Enforce minimum size constraints
      width = clamp(width, MIN_WIDGET_SIZE, Number.POSITIVE_INFINITY);
      height = clamp(height, MIN_WIDGET_SIZE, Number.POSITIVE_INFINITY);

      return { updates: { x, y, width, height }, snapLines };
    },
    [clamp, screenToSlide]
  );

  return {
    computeDrag,
    computeResize,
    MIN_WIDGET_SIZE,
  };
};
