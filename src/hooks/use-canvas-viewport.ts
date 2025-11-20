import { useCallback, useEffect, useState, RefObject } from "react";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const CANVAS_PADDING = 40;

export type Viewport = {
  width: number;
  height: number;
  scale: number;
  translateX: number;
  translateY: number;
};

export type ScreenToSlideTransform = (screenX: number, screenY: number) => {
  x: number;
  y: number;
};

export function useCanvasViewport(
  containerRef: RefObject<HTMLDivElement | null>,
  fixedScale?: number,
  padding: number = CANVAS_PADDING
): {
  viewport: Viewport;
  screenToSlide: ScreenToSlideTransform;
  invScale: number;
} {
  const [viewport, setViewport] = useState<Viewport>({
    width: 1280,
    height: 720,
    scale: fixedScale ?? 1,
    translateX: 0,
    translateY: 0,
  });

  // Calculate viewport and scale
  useEffect(() => {
    // If fixed scale is provided, use it and skip responsive calculation
    if (fixedScale !== undefined) {
      const updateFixedScale = () => {
        const container = containerRef.current;
        if (!container) return;

        const containerRect = container.getBoundingClientRect();
        const containerWidth = containerRect.width;
        const containerHeight = containerRect.height;

        // Calculate scaled dimensions
        const scaledWidth = SLIDE_WIDTH * fixedScale;
        const scaledHeight = SLIDE_HEIGHT * fixedScale;

        // Center the slide within the container
        const translateX = (containerWidth - scaledWidth) / 2;
        const translateY = (containerHeight - scaledHeight) / 2;

        setViewport({
          width: containerWidth,
          height: containerHeight,
          scale: fixedScale,
          translateX,
          translateY,
        });
      };

      updateFixedScale();

      const resizeObserver = new ResizeObserver(updateFixedScale);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }

    // Responsive calculation for normal editor view
    const updateViewport = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // Calculate scale to fit slide within available space with padding
      const availableWidth = containerWidth - padding * 2;
      const availableHeight = containerHeight - padding * 2;

      if (availableWidth <= 0 || availableHeight <= 0) {
        return;
      }

      // Calculate scale to fit slide within available space
      const scaleX = availableWidth / SLIDE_WIDTH;
      const scaleY = availableHeight / SLIDE_HEIGHT;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 1

      // Calculate scaled dimensions
      const scaledWidth = SLIDE_WIDTH * scale;
      const scaledHeight = SLIDE_HEIGHT * scale;

      // Center the slide within the container (accounting for padding)
      const translateX = padding + (availableWidth - scaledWidth) / 2;
      const translateY = padding + (availableHeight - scaledHeight) / 2;

      setViewport({
        width: containerWidth,
        height: containerHeight,
        scale,
        translateX,
        translateY,
      });
    };

    updateViewport();

    const resizeObserver = new ResizeObserver(updateViewport);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateViewport);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateViewport);
    };
  }, [containerRef, fixedScale, padding]);

  // Transform screen coordinates to slide coordinates
  const screenToSlide = useCallback(
    (screenX: number, screenY: number): { x: number; y: number } => {
      const container = containerRef.current;
      if (!container || viewport.scale === 0) return { x: 0, y: 0 };

      const rect = container.getBoundingClientRect();

      // Get coordinates relative to container
      const relativeX = screenX - rect.left;
      const relativeY = screenY - rect.top;

      // Account for translate and scale to get slide coordinates
      // The drag layer applies translate, and read layer applies scale
      const x = (relativeX - viewport.translateX) / viewport.scale;
      const y = (relativeY - viewport.translateY) / viewport.scale;

      return { x, y };
    },
    [containerRef, viewport]
  );

  const invScale = viewport.scale > 0 ? 1 / viewport.scale : 1;

  return {
    viewport,
    screenToSlide,
    invScale,
  };
}

// Export constants for use in other components
export { SLIDE_WIDTH, SLIDE_HEIGHT, CANVAS_PADDING };
