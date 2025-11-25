"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ResizeHandles } from "@/components/editor/resize-handles";
import type { ResizeHandle } from "../types";

interface WidgetContainerProps {
  widgetRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  isEditing: boolean;
  widget: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  baseZIndex: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
  toolbar?: React.ReactNode;
  children: React.ReactNode;
}

export const WidgetContainer: React.FC<WidgetContainerProps> = ({
  widgetRef,
  isSelected,
  isEditing,
  widget,
  baseZIndex,
  onPointerDown,
  getResizePointerDown,
  toolbar,
  children,
}) => {
  return (
    <div
      ref={widgetRef}
      className={cn(
        "canvas-element group absolute flex select-none border border-transparent transition",
        isSelected && !isEditing
          ? "border-primary/70 ring-1 ring-primary/60"
          : "border-transparent",
        "cursor-move"
      )}
      style={{
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        zIndex: baseZIndex,
      }}
      onPointerDown={onPointerDown}
    >
      <div className="canvas-element__content relative flex h-full w-full items-stretch justify-stretch rounded">
        {toolbar}
        {children}
        {isSelected && !isEditing && (
          <ResizeHandles getResizePointerDown={getResizePointerDown} />
        )}
      </div>
    </div>
  );
};
