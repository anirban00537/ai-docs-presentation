"use client";

import React from "react";
import { SlideElement, SlideElementUpdate } from "./types";

type ElementContentProps = {
  element: SlideElement;
  isEditing: boolean;
  editingTextareaRef: React.RefObject<HTMLTextAreaElement>;
  onStartEditing: (id: string) => void;
  onStopEditing: () => void;
  onUpdateElement: (id: string, updates: SlideElementUpdate) => void;
};

const ElementContent: React.FC<ElementContentProps> = ({
  element,
  isEditing,
  editingTextareaRef,
  onStartEditing,
  onStopEditing,
  onUpdateElement,
}) => {
  if (element.type === "text") {
    return isEditing ? (
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
    );
  }

  if (element.type === "rectangle") {
    return (
      <div
        className="h-full w-full"
        style={{
          backgroundColor: element.fill,
          borderRadius: element.borderRadius,
        }}
      />
    );
  }

  if (element.type === "circle") {
    return (
      <div
        className="h-full w-full"
        style={{
          backgroundColor: element.fill,
          borderRadius: "9999px",
        }}
      />
    );
  }

  if (element.type === "arrow") {
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
  }

  return null;
};

export default ElementContent;

