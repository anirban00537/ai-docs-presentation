"use client";

import React from "react";
import { cn } from "@/lib/utils";

const PREVIEW_FILL = "#1f2937";
const PREVIEW_STROKE = "#1f2937";
const PREVIEW_STROKE_WIDTH = 6;

const ShapePreviewFrame: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <span className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-muted/40">
    {children}
  </span>
);

export const SquarePreview: React.FC<{
  rounded?: boolean;
  outline?: boolean;
}> = ({ rounded = false, outline = false }) => (
  <ShapePreviewFrame>
    <span
      className={cn(
        "block h-7 w-7",
        rounded ? "rounded-2xl" : "rounded-md",
        outline ? "bg-transparent border" : ""
      )}
      style={
        outline
          ? {
              borderColor: PREVIEW_STROKE,
              borderWidth: PREVIEW_STROKE_WIDTH / 2,
            }
          : { backgroundColor: PREVIEW_FILL }
      }
    />
  </ShapePreviewFrame>
);

export const CirclePreview: React.FC<{ outline?: boolean }> = ({
  outline = false,
}) => (
  <ShapePreviewFrame>
    <span
      className="block h-7 w-7 rounded-full"
      style={
        outline
          ? {
              backgroundColor: "transparent",
              borderColor: PREVIEW_STROKE,
              borderWidth: PREVIEW_STROKE_WIDTH / 2,
              borderStyle: "solid",
            }
          : { backgroundColor: PREVIEW_FILL }
      }
    />
  </ShapePreviewFrame>
);

export const PolygonPreview: React.FC<{
  points: string;
  outline?: boolean;
}> = ({ points, outline = false }) => (
  <ShapePreviewFrame>
    <svg
      viewBox="0 0 100 100"
      className="h-9 w-9"
      preserveAspectRatio="xMidYMid meet"
    >
      <polygon
        points={points}
        fill={outline ? "transparent" : PREVIEW_FILL}
        stroke={outline ? PREVIEW_STROKE : "transparent"}
        strokeWidth={outline ? PREVIEW_STROKE_WIDTH : 0}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  </ShapePreviewFrame>
);

export const ArrowPreview: React.FC = () => (
  <ShapePreviewFrame>
    <svg
      viewBox="0 0 200 80"
      className="h-8 w-10 text-primary"
      preserveAspectRatio="xMidYMid meet"
    >
      <line
        x1="10"
        y1="40"
        x2="150"
        y2="40"
        stroke="currentColor"
        strokeWidth={8}
        strokeLinecap="round"
      />
      <polygon points="150,22 190,40 150,58" fill="currentColor" />
    </svg>
  </ShapePreviewFrame>
);

