"use client";

import { useCallback, useRef, useEffect } from "react";

interface UseResizeOptions {
  onResize: (deltaX: number) => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
}

/**
 * Shared hook for handling resize operations via mouse drag.
 * Centralizes the event listener management to reduce code duplication.
 */
export function useResize({ onResize, onResizeStart, onResizeEnd }: UseResizeOptions) {
  const isResizingRef = useRef(false);
  const lastXRef = useRef(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizingRef.current) return;
      const deltaX = e.clientX - lastXRef.current;
      onResize(deltaX);
      lastXRef.current = e.clientX;
    },
    [onResize]
  );

  const handleMouseUp = useCallback(() => {
    if (!isResizingRef.current) return;
    isResizingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    onResizeEnd?.();
  }, [handleMouseMove, onResizeEnd]);

  const startResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      isResizingRef.current = true;
      lastXRef.current = e.clientX;
      onResizeStart?.();
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleMouseMove, handleMouseUp, onResizeStart]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    startResize,
    isResizing: isResizingRef.current,
  };
}

interface UseDragDetectionOptions {
  threshold?: number;
  onDragStart?: () => void;
  onClick?: () => void;
}

/**
 * Hook to detect whether a pointer event is a click or a drag.
 * Useful for elements that can be both clicked and dragged.
 */
export function useDragDetection({
  threshold = 5,
  onDragStart,
  onClick,
}: UseDragDetectionOptions) {
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const wasDraggingRef = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, additionalHandler?: (e: React.PointerEvent) => void) => {
      startPosRef.current = { x: e.clientX, y: e.clientY };
      wasDraggingRef.current = false;
      additionalHandler?.(e);
    },
    []
  );

  const handlePointerMove = useCallback(() => {
    if (startPosRef.current && !wasDraggingRef.current) {
      wasDraggingRef.current = true;
      onDragStart?.();
    }
  }, [onDragStart]);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!wasDraggingRef.current && startPosRef.current) {
        const dist = Math.sqrt(
          Math.pow(e.clientX - startPosRef.current.x, 2) +
            Math.pow(e.clientY - startPosRef.current.y, 2)
        );
        if (dist < threshold) {
          e.preventDefault();
          e.stopPropagation();
          onClick?.();
        }
      }
      startPosRef.current = null;
    },
    [threshold, onClick]
  );

  return {
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
  };
}
