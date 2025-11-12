"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  TextElement,
  ResizeHandle,
} from "@/components/editor/slide/types";

const textResizeHandles: Array<{
  handle: Extract<ResizeHandle, "left" | "right">;
  className: string;
}> = [
  { handle: "left", className: "-left-1.5 top-1/2 -translate-y-1/2" },
  { handle: "right", className: "-right-1.5 top-1/2 -translate-y-1/2" },
];

type TextElementNodeProps = {
  element: TextElement;
  isSelected: boolean;
  isEditing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  editingTextareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpdateElement: (id: string, updates: Partial<TextElement>) => void;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
};

export const TextElementNode: React.FC<TextElementNodeProps> = ({
  element,
  isSelected,
  isEditing,
  onPointerDown,
  getResizePointerDown,
  editingTextareaRef,
  onUpdateElement,
  onStartEditing,
  onStopEditing,
}) => {
  const contentRef = React.useRef<HTMLDivElement | HTMLTextAreaElement | null>(
    null
  );
  const lastAppliedHeightRef = React.useRef<number>(element.height);

  const setTextareaRef = React.useCallback(
    (node: HTMLTextAreaElement | null) => {
      if (editingTextareaRef) {
        editingTextareaRef.current = node;
      }
      contentRef.current = node;
    },
    [editingTextareaRef]
  );

  const setDisplayRef = React.useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
  }, []);

  React.useEffect(() => {
    lastAppliedHeightRef.current = element.height;
  }, [element.height]);

  React.useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) {
      return;
    }

    if (node instanceof HTMLTextAreaElement) {
      node.style.height = "auto";
      node.style.height = `${node.scrollHeight}px`;
    }

    const measuredHeight =
      node instanceof HTMLTextAreaElement
        ? node.scrollHeight
        : node.offsetHeight;

    if (Number.isFinite(measuredHeight)) {
      const nextHeight = Math.max(1, measuredHeight);
      if (
        Math.abs(nextHeight - element.height) > 0.5 &&
        Math.abs(nextHeight - lastAppliedHeightRef.current) > 0.5
      ) {
        lastAppliedHeightRef.current = nextHeight;
        onUpdateElement(element.id, { height: nextHeight });
      }
    }
  }, [
    element.align,
    element.fontSize,
    element.fontWeight,
    element.height,
    element.id,
    element.lineHeight,
    element.text,
    element.width,
    isEditing,
    onUpdateElement,
  ]);

  const handlePointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.detail >= 2 && !isEditing) {
        event.stopPropagation();
        onStartEditing(element.id);
        return;
      }
      onPointerDown(event);
    },
    [element.id, isEditing, onPointerDown, onStartEditing]
  );

  return (
    <div
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing ? "border-blue-500/70" : "border-transparent",
        isEditing ? "cursor-text" : "cursor-move"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: isSelected ? 20 : 10,
      }}
      onPointerDown={handlePointerDown}
      onDoubleClick={(event) => {
        event.stopPropagation();
        onStartEditing(element.id);
      }}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {isEditing ? (
          <textarea
            ref={setTextareaRef}
            className="w-full resize-none border-none bg-transparent p-0 text-foreground outline-none focus:ring-0"
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
        ) : (
          <div className="flex h-full w-full items-center">
            <div
              ref={setDisplayRef}
              className="w-full cursor-text whitespace-pre-wrap wrap-break-word"
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
          </div>
        )}

        {isSelected && !isEditing && (
          <>
            {textResizeHandles.map(({ handle, className }) => (
              <div
                key={handle}
                className={cn(
                  "absolute h-3 w-3 rounded-sm border border-white bg-blue-500 shadow-sm cursor-ew-resize",
                  className
                )}
                onPointerDown={getResizePointerDown(handle)}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
