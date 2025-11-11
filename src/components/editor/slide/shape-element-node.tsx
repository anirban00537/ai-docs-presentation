"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type {
  RectangleElement,
  CircleElement,
  ArrowElement,
  ResizeHandle,
} from "@/components/editor/slide/types";
import { ResizeHandles } from "@/components/editor/slide/resize-handles";

type ShapeElementNodeProps = {
  element: RectangleElement | CircleElement | ArrowElement;
  isSelected: boolean;
  isEditing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
};

export const ShapeElementNode: React.FC<ShapeElementNodeProps> = ({
  element,
  isSelected,
  isEditing,
  onPointerDown,
  getResizePointerDown,
}) => {
  const renderContent = () => {
    switch (element.type) {
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
    <div
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent shadow-sm transition",
        isSelected && !isEditing
          ? "border-blue-500/70 shadow-[0_0_0_1px_rgba(37,99,235,0.6)]"
          : "border-transparent",
        isEditing ? "cursor-text" : "cursor-move"
      )}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: isSelected ? 20 : 10,
        borderRadius:
          element.type === "circle"
            ? "9999px"
            : element.type === "rectangle"
            ? element.borderRadius
            : undefined,
      }}
      onPointerDown={onPointerDown}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {renderContent()}
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};
