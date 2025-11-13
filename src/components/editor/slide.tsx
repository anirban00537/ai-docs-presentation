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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectActiveSlideElements,
  selectActiveSlideId,
  selectActiveSlide,
  updateElement as updateElementAction,
} from "@/store/slices/slidesSlice";
import {
  selectElement as selectElementAction,
  selectSelectedElementId,
  selectEditingElementId,
  selectLiveOverrides,
  selectPointerSession,
  selectActivePointerId,
  setLiveOverride,
  clearLiveOverride,
  startPointerSession as startPointerSessionAction,
  updatePointerSession as updatePointerSessionAction,
  endPointerSession as endPointerSessionAction,
  stopEditing as stopEditingAction,
} from "@/store/slices/editorUiSlice";
import type { PointerSession } from "@/store/slices/editorUiSlice";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const MIN_ELEMENT_SIZE = 32;

const Slide: React.FC = () => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pointerSessionRef = useRef<PointerSession | null>(null);

  const elements = useAppSelector(selectActiveSlideElements);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const activeSlide = useAppSelector(selectActiveSlide);
  const selectedId = useAppSelector(selectSelectedElementId);
  const editingId = useAppSelector(selectEditingElementId);
  const liveOverrides = useAppSelector(selectLiveOverrides);
  const pointerSession = useAppSelector(selectPointerSession);
  const activePointerId = useAppSelector(selectActivePointerId);

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
      dispatch(setLiveOverride({ elementId, updates }));
    },
    [dispatch]
  );

  const clearOverride = useCallback(
    (elementId: string) => {
      dispatch(clearLiveOverride(elementId));
    },
    [dispatch]
  );

  const clamp = useCallback(
    (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    []
  );

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.target === containerRef.current) {
        dispatch(selectElementAction(null));
        dispatch(stopEditingAction());
      }
    },
    [dispatch]
  );

  const computeDrag = useCallback(
    (session: PointerSession, clientX: number, clientY: number) => {
      const { startPointer, startRect, elementId } = session;
      const dx = clientX - startPointer.x;
      const dy = clientY - startPointer.y;
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
      dispatch(updatePointerSessionAction({ lastRect: override }));
      pointerSessionRef.current = { ...session, lastRect: override };
    },
    [clamp, dispatch, logInteraction, scheduleLiveOverride]
  );

  const computeResize = useCallback(
    (session: PointerSession, clientX: number, clientY: number) => {
      const { startPointer, startRect, elementId, handle } = session;
      if (!handle) return;

      const dx = clientX - startPointer.x;
      const dy = clientY - startPointer.y;

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
      dispatch(updatePointerSessionAction({ lastRect: override }));
      pointerSessionRef.current = { ...session, lastRect: override };
    },
    [clamp, dispatch, logInteraction, scheduleLiveOverride]
  );

  const finishPointerSession = useCallback(
    (cancelled = false) => {
      const session = pointerSessionRef.current;
      if (!session) return;

      const { elementId, type, lastRect, startRect } = session;
      const finalRect = lastRect ?? startRect;

      logInteraction(`${type}:stop`, { id: elementId, ...finalRect });

      if (!cancelled && activeSlideId) {
        dispatch(
          updateElementAction({
            slideId: activeSlideId,
            elementId,
            updates: finalRect,
          })
        );
      }

      clearOverride(elementId);
      pointerSessionRef.current = null;
      dispatch(endPointerSessionAction());
    },
    [activeSlideId, clearOverride, dispatch, logInteraction]
  );

  useEffect(() => {
    if (activePointerId == null) {
      return;
    }

    const handleMove = (event: PointerEvent) => {
      const session = pointerSessionRef.current;
      const container = containerRef.current;
      if (!session || !container || event.pointerId !== activePointerId) {
        return;
      }
      event.preventDefault();
      const rect = container.getBoundingClientRect();
      const clientX = event.clientX - rect.left;
      const clientY = event.clientY - rect.top;

      if (session.type === "drag") {
        computeDrag(session, clientX, clientY);
      } else {
        computeResize(session, clientX, clientY);
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
      const container = containerRef.current;
      if (!container || event.button !== 0) return;

      const rect = container.getBoundingClientRect();
      const pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
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
      dispatch(startPointerSessionAction(session));

      logInteraction("drag:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dispatch, logInteraction]
  );

  const beginResize = useCallback(
    (
      element: SlideElement,
      effective: SlideElement,
      handle: ResizeHandle,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      const container = containerRef.current;
      if (!container || event.button !== 0) return;

      event.stopPropagation();
      event.preventDefault();

      const rect = container.getBoundingClientRect();
      const pointer = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
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
      dispatch(startPointerSessionAction(session));

      logInteraction("resize:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [dispatch, logInteraction]
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
          dispatch(selectElementAction(element.id));
        }
        if (isEditing) {
          return;
        }
        beginDrag(element, effective, event);
      },
    [beginDrag, dispatch]
  );

  const createResizePointerDown = useCallback(
    (element: SlideElement, effective: SlideElement, handle: ResizeHandle) =>
      (event: React.PointerEvent<HTMLDivElement>) => {
        beginResize(element, effective, handle, event);
      },
    [beginResize]
  );

  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100/60 py-6">
      <div
        ref={containerRef}
        className="relative"
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
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
  );
};

export default Slide;
