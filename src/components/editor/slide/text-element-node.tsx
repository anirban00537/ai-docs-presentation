"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  TextElement,
  ResizeHandle,
} from "@/components/editor/slide/types";
import { ResizeHandles } from "@/components/editor/slide/resize-handles";

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
        ) : (
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
        )}

        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};
