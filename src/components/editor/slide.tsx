"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { TextElementNode } from "@/components/editor/slide/text-element-node";
import { ShapeElementNode } from "@/components/editor/slide/shape-element-node";
import type {
  SlideElement,
  SlideElementUpdate,
  TextElement,
  RectangleElement,
  CircleElement,
  ArrowElement,
  PolygonElement,
  ResizeHandle,
} from "@/components/editor/slide/types";
import type { PointerSession } from "@/store/slices/editorUiSlice";
import { cn } from "@/lib/utils";
import {
  useCanvasViewport,
  SLIDE_WIDTH,
  SLIDE_HEIGHT,
} from "@/hooks/use-canvas-viewport";

type ActiveSlideMetadata = {
  backgroundColor?: string;
  backgroundImage?: string;
};

type SlideProps = {
  elements: SlideElement[];
  activeSlideId: string | null;
  activeSlide: ActiveSlideMetadata | null;
  selectedId: string | null;
  editingId: string | null;
  liveOverrides: Record<string, SlideElementUpdate>;
  pointerSession: PointerSession | null;
  activePointerId: number | null;
  onSelectElement: (elementId: string | null) => void;
  onStopEditing: () => void;
  onSetLiveOverride: (elementId: string, updates: SlideElementUpdate) => void;
  onClearLiveOverride: (elementId: string) => void;
  onStartPointerSession: (session: PointerSession) => void;
  onUpdatePointerSession: (updates: Partial<PointerSession>) => void;
  onEndPointerSession: () => void;
  onUpdateElement: (payload: {
    slideId?: string;
    elementId: string;
    updates: SlideElementUpdate;
  }) => void;
};

const MIN_ELEMENT_SIZE = 32;

const Slide: React.FC<SlideProps> = ({
  elements,
  activeSlideId,
  activeSlide,
  selectedId,
  editingId,
  liveOverrides,
  pointerSession,
  activePointerId,
  onSelectElement,
  onStopEditing,
  onSetLiveOverride,
  onClearLiveOverride,
  onStartPointerSession,
  onUpdatePointerSession,
  onEndPointerSession,
  onUpdateElement,
}) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragLayerRef = useRef<HTMLDivElement>(null);
  const readLayerRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pointerSessionRef = useRef<PointerSession | null>(null);

  // Use the canvas viewport hook for viewport calculation and coordinate transformation
  const { viewport, screenToSlide, invScale } =
    useCanvasViewport(canvasContainerRef);

  useEffect(() => {
    pointerSessionRef.current = pointerSession;
  }, [pointerSession]);

  useEffect(() => {
    if (editingId && editingTextareaRef.current) {
      editingTextareaRef.current.focus();
      editingTextareaRef.current.select();
    }
  }, [editingId]);

  const logInteraction = useCallback(
    (
      action:
        | "drag:start"
        | "drag:move"
        | "drag:stop"
        | "resize:start"
        | "resize:move"
        | "resize:stop",
      detail: {
        id: string;
        x: number;
        y: number;
        width?: number;
        height?: number;
      }
    ) => {
      console.log(`[Slide] ${action}`, detail);
    },
    []
  );

  const scheduleLiveOverride = useCallback(
    (elementId: string, updates: SlideElementUpdate) => {
      onSetLiveOverride(elementId, updates);
    },
    [onSetLiveOverride]
  );

  const clearOverride = useCallback(
    (elementId: string) => {
      onClearLiveOverride(elementId);
    },
    [onClearLiveOverride]
  );

  const clamp = useCallback(
    (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    []
  );

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Check if clicking on the canvas background (not on an element)
      const target = event.target as HTMLElement;
      const slideElement = target.closest('[data-slide-container="true"]');

      // If clicking directly on the slide background or empty area
      if (
        target.classList.contains("slide") ||
        target === readLayerRef.current ||
        (slideElement === readLayerRef.current &&
          target.closest(".canvas-element") === null)
      ) {
        onSelectElement(null);
        onStopEditing();
      }
    },
    [onSelectElement, onStopEditing]
  );

  const computeDrag = useCallback(
    (session: PointerSession, clientX: number, clientY: number) => {
      const { startPointer, startRect, elementId } = session;

      // Convert screen coordinates to slide coordinates
      const currentSlidePos = screenToSlide(clientX, clientY);
      const startSlidePos = screenToSlide(startPointer.x, startPointer.y);

      const dx = currentSlidePos.x - startSlidePos.x;
      const dy = currentSlidePos.y - startSlidePos.y;

      const x = clamp(startRect.x + dx, 0, SLIDE_WIDTH - startRect.width);
      const y = clamp(startRect.y + dy, 0, SLIDE_HEIGHT - startRect.height);

      logInteraction("drag:move", {
        id: elementId,
        x,
        y,
        width: startRect.width,
        height: startRect.height,
      });

      const override = {
        x,
        y,
        width: startRect.width,
        height: startRect.height,
      } satisfies SlideElementUpdate;
      scheduleLiveOverride(elementId, override);
      onUpdatePointerSession({ lastRect: override });
      pointerSessionRef.current = { ...session, lastRect: override };
    },
    [
      clamp,
      logInteraction,
      onUpdatePointerSession,
      scheduleLiveOverride,
      screenToSlide,
    ]
  );

  const computeResize = useCallback(
    (session: PointerSession, clientX: number, clientY: number) => {
      const { startPointer, startRect, elementId, handle } = session;
      if (!handle) return;

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
        const maxX = startRect.x + startRect.width - MIN_ELEMENT_SIZE;
        const clampedX = clamp(proposedX, 0, maxX);
        width = clamp(
          startRect.width + (startRect.x - clampedX),
          MIN_ELEMENT_SIZE,
          SLIDE_WIDTH
        );
        x = clamp(clampedX, 0, SLIDE_WIDTH - MIN_ELEMENT_SIZE);
        if (x + width > SLIDE_WIDTH) {
          width = SLIDE_WIDTH - x;
        }
      }

      if (includes("right")) {
        const proposedWidth = startRect.width + dx;
        width = clamp(
          proposedWidth,
          MIN_ELEMENT_SIZE,
          SLIDE_WIDTH - startRect.x
        );
      }

      if (includes("top")) {
        const proposedY = startRect.y + dy;
        const maxY = startRect.y + startRect.height - MIN_ELEMENT_SIZE;
        const clampedY = clamp(proposedY, 0, maxY);
        height = clamp(
          startRect.height + (startRect.y - clampedY),
          MIN_ELEMENT_SIZE,
          SLIDE_HEIGHT
        );
        y = clamp(clampedY, 0, SLIDE_HEIGHT - MIN_ELEMENT_SIZE);
        if (y + height > SLIDE_HEIGHT) {
          height = SLIDE_HEIGHT - y;
        }
      }

      if (includes("bottom")) {
        const proposedHeight = startRect.height + dy;
        height = clamp(
          proposedHeight,
          MIN_ELEMENT_SIZE,
          SLIDE_HEIGHT - startRect.y
        );
      }

      width = clamp(width, MIN_ELEMENT_SIZE, SLIDE_WIDTH);
      height = clamp(height, MIN_ELEMENT_SIZE, SLIDE_HEIGHT);
      x = clamp(x, 0, SLIDE_WIDTH - width);
      y = clamp(y, 0, SLIDE_HEIGHT - height);

      const override = { x, y, width, height } satisfies SlideElementUpdate;
      logInteraction("resize:move", { id: elementId, ...override });

      scheduleLiveOverride(elementId, override);
      onUpdatePointerSession({ lastRect: override });
      pointerSessionRef.current = { ...session, lastRect: override };
    },
    [
      clamp,
      logInteraction,
      onUpdatePointerSession,
      scheduleLiveOverride,
      screenToSlide,
    ]
  );

  const finishPointerSession = useCallback(
    (cancelled = false) => {
      const session = pointerSessionRef.current;
      if (!session) return;

      const { elementId, type, lastRect, startRect } = session;
      const finalRect = lastRect ?? startRect;

      logInteraction(`${type}:stop`, { id: elementId, ...finalRect });

      if (!cancelled && activeSlideId) {
        onUpdateElement({
          slideId: activeSlideId ?? undefined,
          elementId,
          updates: finalRect,
        });
      }

      clearOverride(elementId);
      pointerSessionRef.current = null;
      onEndPointerSession();
    },
    [
      activeSlideId,
      clearOverride,
      logInteraction,
      onEndPointerSession,
      onUpdateElement,
    ]
  );

  useEffect(() => {
    if (activePointerId == null) {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      const session = pointerSessionRef.current;
      if (!session || event.pointerId !== activePointerId) {
        return;
      }
      event.preventDefault();

      if (session.type === "drag") {
        computeDrag(session, event.clientX, event.clientY);
      } else {
        computeResize(session, event.clientX, event.clientY);
      }
    };

    const finish = (event: PointerEvent, cancelled: boolean) => {
      const session = pointerSessionRef.current;
      if (!session || event.pointerId !== activePointerId) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target?.hasPointerCapture?.(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }

      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
      finishPointerSession(cancelled);
    };

    const handleUp = (event: PointerEvent) => finish(event, false);
    const handleCancel = (event: PointerEvent) => finish(event, true);

    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp, { passive: false });
    window.addEventListener("pointercancel", handleCancel, { passive: false });

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleCancel);
    };
  }, [activePointerId, computeDrag, computeResize, finishPointerSession]);

  const beginDrag = useCallback(
    (
      element: SlideElement,
      effective: SlideElement,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (event.button !== 0) return;

      // Store screen coordinates for the start pointer
      const pointer = {
        x: event.clientX,
        y: event.clientY,
      };

      const startRect = {
        x: effective.x,
        y: effective.y,
        width: effective.width,
        height: effective.height,
      };

      const session: PointerSession = {
        type: "drag",
        elementId: element.id,
        pointerId: event.pointerId,
        startPointer: pointer,
        startRect,
        lastRect: startRect,
      };

      pointerSessionRef.current = session;
      onStartPointerSession(session);

      logInteraction("drag:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [logInteraction, onStartPointerSession]
  );

  const beginResize = useCallback(
    (
      element: SlideElement,
      effective: SlideElement,
      handle: ResizeHandle,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      if (event.button !== 0) return;

      event.stopPropagation();
      event.preventDefault();

      // Store screen coordinates for the start pointer
      const pointer = {
        x: event.clientX,
        y: event.clientY,
      };

      const startRect = {
        x: effective.x,
        y: effective.y,
        width: effective.width,
        height: effective.height,
      };

      const session: PointerSession = {
        type: "resize",
        elementId: element.id,
        pointerId: event.pointerId,
        handle,
        startPointer: pointer,
        startRect,
        lastRect: startRect,
      };

      pointerSessionRef.current = session;
      onStartPointerSession(session);

      logInteraction("resize:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [logInteraction, onStartPointerSession]
  );

  const createDragPointerDown = useCallback(
    (
        element: SlideElement,
        effective: SlideElement,
        isSelected: boolean,
        isEditing: boolean
      ) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        event.stopPropagation();
        if (event.detail > 1) {
          return;
        }
        if (!isSelected) {
          onSelectElement(element.id);
        }
        if (isEditing) {
          return;
        }
        beginDrag(element, effective, event);
      },
    [beginDrag, onSelectElement]
  );

  const createResizePointerDown = useCallback(
    (element: SlideElement, effective: SlideElement, handle: ResizeHandle) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        beginResize(element, effective, handle, event);
      },
    [beginResize]
  );

  return (
    <div
      ref={canvasContainerRef}
      className="flex flex-1 overflow-hidden"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <div
        ref={canvasRef}
        className="canvas"
        id="canvas"
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div className="selection-helper"></div>
        <div
          ref={dragLayerRef}
          className="canvas-drag-layer"
          style={{
            position: "absolute",
            left: `${viewport.translateX}px`,
            top: `${viewport.translateY}px`,
            width: `${SLIDE_WIDTH * viewport.scale}px`,
            height: `${SLIDE_HEIGHT * viewport.scale}px`,
          }}
        >
          <div
            className="area-selection-wrapper slide-picker-enabled"
            data-test-id="droppable-canvas"
            style={{
              position: "relative",
              width: "100%",
              height: "100%",
            }}
          >
            <div
              ref={readLayerRef}
              data-test-id="slide-interaction-layer"
              data-slide-container="true"
              style={{
                width: `${SLIDE_WIDTH}px`,
                height: `${SLIDE_HEIGHT}px`,
                position: "relative",
                transform: `scale(${viewport.scale})`,
                transformOrigin: "0 0",
                // @ts-expect-error - CSS custom property
                "--inv-scale": invScale,
              }}
            >
              <div
                className={cn(
                  "slide editable theme-background",
                  "relative overflow-hidden bg-white transition-[box-shadow,border] duration-300 ease-out border border-slate-200/70",
                  "shadow-[0_20px_60px_-40px_rgba(15,23,42,0.35)]"
                )}
                data-slide-index="0"
                style={{
                  width: `${SLIDE_WIDTH}px`,
                  height: `${SLIDE_HEIGHT}px`,
                  position: "relative",
                  backgroundColor: activeSlide?.backgroundColor || "#ffffff",
                  backgroundImage: activeSlide?.backgroundImage
                    ? `url(${activeSlide.backgroundImage})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                onPointerDown={handleCanvasPointerDown}
              >
                <div className="selection-helper slide-selection-helper"></div>

                {elements.length === 0 && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
                      Use the toolbar to add content to this slide.
                    </span>
                  </div>
                )}

                {elements.map((element, index) => {
                  const baseZIndex = 100 + index;
                  const isSelected = selectedId === element.id;
                  const isEditing = editingId === element.id;
                  const override = liveOverrides[element.id];
                  const effective = override
                    ? ({ ...element, ...override } as SlideElement)
                    : element;

                  if (effective.type === "text") {
                    return (
                      <TextElementNode
                        key={element.id}
                        element={effective as TextElement}
                        isSelected={isSelected}
                        isEditing={isEditing}
                        baseZIndex={baseZIndex}
                        onPointerDown={createDragPointerDown(
                          element,
                          effective,
                          isSelected,
                          isEditing
                        )}
                        getResizePointerDown={(handle) =>
                          createResizePointerDown(element, effective, handle)
                        }
                        editingTextareaRef={editingTextareaRef}
                      />
                    );
                  }

                  return (
                    <ShapeElementNode
                      key={element.id}
                      element={
                        effective as
                          | RectangleElement
                          | CircleElement
                          | ArrowElement
                          | PolygonElement
                      }
                      isSelected={isSelected}
                      isEditing={isEditing}
                      baseZIndex={baseZIndex}
                      onPointerDown={createDragPointerDown(
                        element,
                        effective,
                        isSelected,
                        isEditing
                      )}
                      getResizePointerDown={(handle) =>
                        createResizePointerDown(element, effective, handle)
                      }
                    />
                  );
                })}
              </div>
            </div>
            <div id="edit-layer"></div>
            <div id="live-collab-layer">
              <div
                className="live-cursors"
                style={{
                  height: `${SLIDE_HEIGHT}px`,
                  width: `${SLIDE_WIDTH}px`,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="upload-indicators"></div>
      </div>
    </div>
  );
};

export default Slide;
