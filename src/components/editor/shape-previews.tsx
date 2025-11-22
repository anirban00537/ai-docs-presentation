import React from "react";
import { cn } from "@/lib/utils";

const PREVIEW_FILL = "#1f2937";
const PREVIEW_STROKE = "#1f2937";
const PREVIEW_STROKE_WIDTH = 6;

export const SquarePreview: React.FC<{
  rounded?: boolean;
  outline?: boolean;
  className?: string;
}> = ({ rounded = false, outline = false, className }) => (
  <span
    className={cn(
      "block h-8 w-8",
      rounded ? "rounded-2xl" : "rounded-md",
      outline ? "bg-transparent border-2" : "",
      className
    )}
    style={
      outline
        ? {
            borderColor: "currentColor",
          }
        : { backgroundColor: "currentColor" }
    }
  />
);

export const CirclePreview: React.FC<{
  outline?: boolean;
  className?: string;
}> = ({ outline = false, className }) => (
  <span
    className={cn("block h-8 w-8 rounded-full", className)}
    style={
      outline
        ? {
            backgroundColor: "transparent",
            border: "2px solid currentColor",
          }
        : { backgroundColor: "currentColor" }
    }
  />
);

export const PolygonPreview: React.FC<{
  points: string;
  outline?: boolean;
  className?: string;
}> = ({ points, outline = false, className }) => (
  <svg
    viewBox="0 0 100 100"
    className={cn("h-10 w-10", className)}
    preserveAspectRatio="xMidYMid meet"
  >
    <polygon
      points={points}
      fill={outline ? "transparent" : "currentColor"}
      stroke={outline ? "currentColor" : "transparent"}
      strokeWidth={outline ? PREVIEW_STROKE_WIDTH : 0}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

export const ArrowPreview: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    viewBox="0 0 200 80"
    className={cn("h-8 w-12", className)}
    preserveAspectRatio="xMidYMid meet"
  >
    <line
      x1="10"
      y1="40"
      x2="150"
      y2="40"
      stroke="currentColor"
      strokeWidth={12}
      strokeLinecap="round"
    />
    <polygon points="150,15 195,40 150,65" fill="currentColor" />
  </svg>
);

