"use client";

import React, { useCallback, useEffect, useRef } from "react";
import {
  Rnd,
  type RndDragCallback,
  type RndResizeCallback,
  type RndResizeStartCallback,
} from "react-rnd";
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

function handleStyle() {
  return {
    width: "10px",
    height: "10px",
    borderRadius: "2px",
    background: "#2563eb",
    border: "1px solid #ffffff",
  };
}

const resizeHandleStyles = {
  bottom: { height: "8px", background: "transparent" },
  bottomLeft: handleStyle(),
  bottomRight: handleStyle(),
  left: { width: "8px", background: "transparent" },
  right: { width: "8px", background: "transparent" },
  top: { height: "8px", background: "transparent" },
  topLeft: handleStyle(),
  topRight: handleStyle(),
} as const;

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

  const createDragHandler =
    (
      action: "drag:start" | "drag:move" | "drag:stop",
      element: SlideElement,
      callback?: (coords: { x: number; y: number }) => void
    ): RndDragCallback =>
    (_event, data) => {
      const payload = {
        id: element.id,
        x: data.x,
        y: data.y,
        width: element.width,
        height: element.height,
      };
      logInteraction(action, payload);
      callback?.({ x: data.x, y: data.y });
    };

  const createResizeStartHandler =
    (element: SlideElement): RndResizeStartCallback =>
    () => {
      logInteraction("resize:start", {
        id: element.id,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
      });
    };

  const createResizeHandler =
    (
      action: "resize:move" | "resize:stop",
      element: SlideElement,
      callback?: (detail: {
        width: number;
        height: number;
        x: number;
        y: number;
      }) => void
    ): RndResizeCallback =>
    (...args: Parameters<RndResizeCallback>) => {
      const [, , ref, , position] = args;
      const width = parseFloat(ref.style.width);
      const height = parseFloat(ref.style.height);

      logInteraction(action, {
        id: element.id,
        x: position.x,
        y: position.y,
        width,
        height,
      });

      callback?.({
        width,
        height,
        x: position.x,
        y: position.y,
      });
    };

  useEffect(() => {
    if (editingId && editingTextareaRef.current) {
      editingTextareaRef.current.focus();
      editingTextareaRef.current.select();
    }
  }, [editingId]);

  const handleCanvasPointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (event.target === containerRef.current) {
      onSelect(null);
      onStopEditing();
    }
  };

  const renderElementContent = (element: SlideElement) => {
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
  };

  return (
    <div className="flex flex-1 items-center justify-center overflow-auto bg-slate-100/60 py-6">
      <div
        ref={containerRef}
        className="relative  bg-white"
        style={{
          width: SLIDE_WIDTH,
          height: SLIDE_HEIGHT,
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

        {elements.map((element) => {
          const isSelected = selectedId === element.id;
          const isEditing = editingId === element.id;

          return (
            <Rnd
              key={element.id}
              bounds="parent"
              size={{ width: element.width, height: element.height }}
              position={{ x: element.x, y: element.y }}
              enableUserSelectHack={false}
              data-element-type={element.type}
              onDragStart={createDragHandler("drag:start", element)}
              onDrag={createDragHandler("drag:move", element)}
              onDragStop={createDragHandler("drag:stop", element, ({ x, y }) =>
                onUpdateElement(element.id, { x, y })
              )}
              onResizeStart={createResizeStartHandler(element)}
              onResize={createResizeHandler("resize:move", element)}
              onResizeStop={createResizeHandler(
                "resize:stop",
                element,
                (detail) =>
                  onUpdateElement(element.id, {
                    width: detail.width,
                    height: detail.height,
                    x: detail.x,
                    y: detail.y,
                  })
              )}
              enableResizing={isSelected && !isEditing}
              disableDragging={isEditing}
              dragHandleClassName="canvas-element__content"
              className={cn(
                "canvas-element group absolute flex select-none border border-transparent shadow-sm",
                isSelected && !isEditing
                  ? "border-blue-500/70 shadow-[0_0_0_1px_rgba(37,99,235,0.6)]"
                  : "border-transparent"
              )}
              style={{
                zIndex: isSelected ? 20 : 10,
                borderRadius:
                  element.type === "circle"
                    ? "9999px"
                    : element.type === "rectangle"
                    ? (element as RectangleElement).borderRadius
                    : undefined,
              }}
              resizeHandleStyles={
                isSelected && !isEditing ? resizeHandleStyles : undefined
              }
              onPointerDown={(event: React.PointerEvent<HTMLDivElement>) => {
                event.stopPropagation();
                if (!isSelected) {
                  onSelect(element.id);
                }
              }}
            >
              <div
                className={cn(
                  "canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded",
                  isEditing ? "cursor-text" : "cursor-move"
                )}
              >
                {renderElementContent(element)}
              </div>
            </Rnd>
          );
        })}
      </div>
    </div>
  );
};

export default Slide;
