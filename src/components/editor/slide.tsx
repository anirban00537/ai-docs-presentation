"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type {
  SlideElement,
  SlideElementUpdate,
  TextElement,
  RectangleElement,
  CircleElement,
  ArrowElement,
  ResizeHandle,
} from "@/components/editor/slide/types";
import { TextElementNode } from "@/components/editor/slide/text-element-node";
import { ShapeElementNode } from "@/components/editor/slide/shape-element-node";

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const MIN_ELEMENT_SIZE = 32;

type SlideProps = {
  elements: SlideElement[];
  selectedId: string | null;
  editingId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: SlideElementUpdate) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
};

const Slide: React.FC<SlideProps> = ({
  elements,
  selectedId,
  editingId,
  onSelect,
  onUpdateElement,
  onStartEditing,
  onStopEditing,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [liveOverrides, setLiveOverrides] = useState<
    Record<string, SlideElementUpdate>
  >({});
  const pointerSessionRef = useRef<{
    type: "drag" | "resize";
    elementId: string;
    pointerId: number;
    handle?: ResizeHandle;
    startPointer: { x: number; y: number };
    startRect: { x: number; y: number; width: number; height: number };
    lastRect: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const [activePointerId, setActivePointerId] = useState<number | null>(null);

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
      setLiveOverrides((prev) => ({
        ...prev,
        [elementId]: {
          ...(prev[elementId] ?? {}),
          ...updates,
        },
      }));
    },
    []
  );

  const clearLiveOverride = useCallback((elementId: string) => {
    setLiveOverrides((prev) => {
      if (!(elementId in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[elementId];
      return next;
    });
  }, []);

  useEffect(() => {
    if (editingId && editingTextareaRef.current) {
      editingTextareaRef.current.focus();
      editingTextareaRef.current.select();
    }
  }, [editingId]);

  const clamp = useCallback(
    (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    []
  );

  const handleCanvasPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.target === containerRef.current) {
        onSelect(null);
        onStopEditing();
      }
    },
    [onSelect, onStopEditing]
  );

  const computeDrag = useCallback(
    (
      session: NonNullable<typeof pointerSessionRef.current>,
      clientX: number,
      clientY: number
    ) => {
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

      scheduleLiveOverride(elementId, { x, y });
      session.lastRect = {
        x,
        y,
        width: startRect.width,
        height: startRect.height,
      };
    },
    [clamp, logInteraction, scheduleLiveOverride]
  );

  const computeResize = useCallback(
    (
      session: NonNullable<typeof pointerSessionRef.current>,
      clientX: number,
      clientY: number
    ) => {
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

      const override = { x, y, width, height };
      logInteraction("resize:move", { id: elementId, ...override });

      scheduleLiveOverride(elementId, override);
      session.lastRect = override;
    },
    [clamp, logInteraction, scheduleLiveOverride]
  );

  const endPointerSession = useCallback(
    (cancelled = false) => {
      const session = pointerSessionRef.current;
      if (!session) return;

      const { elementId, type, lastRect, startRect } = session;
      const finalRect = lastRect ?? startRect;

      if (type === "drag") {
        logInteraction("drag:stop", { id: elementId, ...finalRect });
      } else {
        logInteraction("resize:stop", { id: elementId, ...finalRect });
      }

      if (!cancelled) {
        onUpdateElement(elementId, finalRect);
      }

      clearLiveOverride(elementId);
      pointerSessionRef.current = null;
    },
    [clearLiveOverride, logInteraction, onUpdateElement]
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
      setActivePointerId(null);
      endPointerSession(cancelled);
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
  }, [activePointerId, computeDrag, computeResize, endPointerSession]);

  const beginDrag = useCallback(
    (
      element: SlideElement,
      effective: SlideElement,
      event: React.PointerEvent<HTMLDivElement>
    ) => {
      const container = containerRef.current;
      if (!container || event.button !== 0) return;

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

      pointerSessionRef.current = {
        type: "drag",
        elementId: element.id,
        pointerId: event.pointerId,
        startPointer: pointer,
        startRect,
        lastRect: startRect,
      };

      logInteraction("drag:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      setActivePointerId(event.pointerId);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [logInteraction]
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

      pointerSessionRef.current = {
        type: "resize",
        elementId: element.id,
        pointerId: event.pointerId,
        handle,
        startPointer: pointer,
        startRect,
        lastRect: startRect,
      };

      logInteraction("resize:start", {
        id: element.id,
        x: startRect.x,
        y: startRect.y,
        width: startRect.width,
        height: startRect.height,
      });

      setActivePointerId(event.pointerId);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [logInteraction]
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
        if (!isSelected) {
          onSelect(element.id);
        }
        if (isEditing) {
          return;
        }
        beginDrag(element, effective, event);
      },
    [beginDrag, onSelect]
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
        className="relative bg-white"
        style={{ width: SLIDE_WIDTH, height: SLIDE_HEIGHT }}
        onPointerDown={handleCanvasPointerDown}
      >
        {elements.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-white/80 px-4 py-2 text-sm text-muted-foreground shadow-sm">
              Use the toolbar to add content to this slide.
            </span>
          </div>
        )}

        {elements.map((element) => {
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
                onUpdateElement={(id, updates) => onUpdateElement(id, updates)}
                onStartEditing={onStartEditing}
                onStopEditing={onStopEditing}
              />
            );
          }

          return (
            <ShapeElementNode
              key={element.id}
              element={
                effective as RectangleElement | CircleElement | ArrowElement
              }
              isSelected={isSelected}
              isEditing={isEditing}
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
