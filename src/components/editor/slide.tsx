"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type ElementCommon = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type TextElement = ElementCommon & {
  type: "text";
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
};

export type RectangleElement = ElementCommon & {
  type: "rectangle";
  fill: string;
  borderRadius: number;
};

export type CircleElement = ElementCommon & {
  type: "circle";
  fill: string;
};

export type ArrowElement = ElementCommon & {
  type: "arrow";
  stroke: string;
  strokeWidth: number;
};

export type SlideElement =
  | TextElement
  | RectangleElement
  | CircleElement
  | ArrowElement;

export type SlideElementUpdate = Partial<
  Omit<ElementCommon, "id"> & {
    text: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    align: "left" | "center" | "right";
    fill: string;
    borderRadius: number;
    stroke: string;
    strokeWidth: number;
    lineHeight: number;
  }
>;

type SlideProps = {
  elements: SlideElement[];
  selectedId: string | null;
  editingId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement: (id: string, updates: SlideElementUpdate) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
};

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const MIN_ELEMENT_SIZE = 32;

type ResizeHandle =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";

const cursorByHandle: Record<ResizeHandle, string> = {
  "top-left": "cursor-nwse-resize",
  top: "cursor-ns-resize",
  "top-right": "cursor-nesw-resize",
  right: "cursor-ew-resize",
  "bottom-right": "cursor-nwse-resize",
  bottom: "cursor-ns-resize",
  "bottom-left": "cursor-nesw-resize",
  left: "cursor-ew-resize",
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

  const renderElementContent = useCallback(
    (element: SlideElement) => {
      switch (element.type) {
        case "text":
          if (editingId === element.id) {
            return (
              <textarea
                ref={editingTextareaRef}
                className="h-full w-full resize-none border-none bg-transparent p-0 text-foreground outline-none focus:ring-0"
                style={{
                  fontSize: element.fontSize,
                  fontWeight: element.fontWeight,
                  color: element.color,
                  textAlign: element.align,
                  lineHeight: element.lineHeight ?? 1.3,
                }}
                value={element.text}
                onChange={(event) =>
                  onUpdateElement(element.id, { text: event.target.value })
                }
                onBlur={() => onStopEditing()}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    onStopEditing();
                  }
                }}
              />
            );
          }

          return (
            <div
              className="h-full w-full cursor-text whitespace-pre-wrap wrap-break-word"
              style={{
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                color: element.color,
                textAlign: element.align,
                lineHeight: element.lineHeight ?? 1.3,
              }}
              onDoubleClick={(event) => {
                event.stopPropagation();
                onStartEditing(element.id);
              }}
            >
              {element.text || "Start typing…"}
            </div>
          );

        case "rectangle":
          return (
            <div
              className="h-full w-full"
              style={{
                backgroundColor: element.fill,
                borderRadius: element.borderRadius,
              }}
            />
          );

        case "circle":
          return (
            <div
              className="h-full w-full"
              style={{
                backgroundColor: element.fill,
                borderRadius: "9999px",
              }}
            />
          );

        case "arrow":
          return (
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 200 80"
              preserveAspectRatio="none"
            >
              <line
                x1="10"
                y1="40"
                x2="160"
                y2="40"
                stroke={element.stroke}
                strokeWidth={element.strokeWidth}
                strokeLinecap="round"
              />
              <polygon points="160,15 190,40 160,65" fill={element.stroke} />
            </svg>
          );

        default:
          return null;
      }
    },
    [editingId, onStartEditing, onStopEditing, onUpdateElement]
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

          return (
            <div
              key={element.id}
              className={cn(
                "canvas-element group absolute flex select-none border border-transparent shadow-sm transition",
                isSelected && !isEditing
                  ? "border-blue-500/70 shadow-[0_0_0_1px_rgba(37,99,235,0.6)]"
                  : "border-transparent",
                isEditing ? "cursor-text" : "cursor-move"
              )}
              style={{
                left: effective.x,
                top: effective.y,
                width: effective.width,
                height: effective.height,
                zIndex: isSelected ? 20 : 10,
                borderRadius:
                  effective.type === "circle"
                    ? "9999px"
                    : effective.type === "rectangle"
                    ? (effective as RectangleElement).borderRadius
                    : undefined,
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
                if (!isSelected) {
                  onSelect(element.id);
                }
                if (isEditing) return;
                beginDrag(element, effective, event);
              }}
            >
              <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
                {renderElementContent(effective)}
                {isSelected && !isEditing && (
                  <ResizeHandles
                    onPointerDown={(handle, handleEvent) =>
                      beginResize(element, effective, handle, handleEvent)
                    }
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Slide;

type ResizeHandlesProps = {
  onPointerDown: (
    handle: ResizeHandle,
    event: React.PointerEvent<HTMLDivElement>
  ) => void;
};

const handleDefinitions: Array<{ handle: ResizeHandle; className: string }> = [
  { handle: "top-left", className: "-left-1.5 -top-1.5" },
  { handle: "top", className: "left-1/2 -top-1.5 -translate-x-1/2" },
  { handle: "top-right", className: "-right-1.5 -top-1.5" },
  { handle: "right", className: "-right-1.5 top-1/2 -translate-y-1/2" },
  { handle: "bottom-right", className: "-bottom-1.5 -right-1.5" },
  { handle: "bottom", className: "left-1/2 -bottom-1.5 -translate-x-1/2" },
  { handle: "bottom-left", className: "-bottom-1.5 -left-1.5" },
  { handle: "left", className: "-left-1.5 top-1/2 -translate-y-1/2" },
];

const ResizeHandles: React.FC<ResizeHandlesProps> = ({ onPointerDown }) => {
  return (
    <>
      {handleDefinitions.map(({ handle, className }) => (
        <div
          key={handle}
          className={cn(
            "absolute h-3 w-3 rounded-sm border border-white bg-blue-500 shadow-sm",
            cursorByHandle[handle],
            className
          )}
          onPointerDown={(event) => onPointerDown(handle, event)}
        />
      ))}
    </>
  );
};
