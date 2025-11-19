"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { ResizeHandle } from "@/components/editor/widgets/types";

export type ResizeHandlesProps = {
  getResizePointerDown: (
    handle: ResizeHandle
  ) => (event: React.PointerEvent<HTMLDivElement>) => void;
};

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

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  getResizePointerDown,
}) => (
  <>
    {handleDefinitions.map(({ handle, className }) => (
      <div
        key={handle}
        className={cn(
          "absolute h-3 w-3 rounded-sm border border-white bg-primary",
          cursorByHandle[handle],
          className
        )}
        onPointerDown={getResizePointerDown(handle)}
      />
    ))}
  </>
);
