"use client";

import React, { useEffect, useState, useRef } from "react";
import type { SnapLine } from "@/components/editor/widgets/types";
import { cn } from "@/lib/utils";

type SnapLinesProps = {
  lines: SnapLine[];
};

const SNAP_LINE_COLOR = "#F24E1E";
const FADE_DURATION = 150; // ms

export const SnapLines: React.FC<SnapLinesProps> = ({ lines }) => {
  // Keep lines visible during fade-out animation
  const [visibleLines, setVisibleLines] = useState<SnapLine[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (lines.length > 0) {
      // Clear any pending fade-out
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      setVisibleLines(lines);
      // Trigger fade-in
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      // Start fade-out
      setIsVisible(false);
      
      // Remove from DOM after animation completes
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setVisibleLines([]);
      }, FADE_DURATION);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [lines]);

  if (visibleLines.length === 0) {
    return null;
  }

  return (
    <>
      {visibleLines.map((line, i) => {
        const isVertical = line.type === "vertical";
        const lineLength = Math.abs(line.end - line.start);
        
        return (
          <React.Fragment key={`snap-line-${i}`}>
            {/* Main snap line with gradient dashes */}
            <div
              className={cn(
                "absolute pointer-events-none",
                "transition-opacity ease-out"
              )}
              style={{
                opacity: isVisible ? 1 : 0,
                transitionDuration: `${FADE_DURATION}ms`,
                [isVertical ? "left" : "top"]: `${line.position}px`,
                [isVertical ? "top" : "left"]: `${line.start}px`,
                [isVertical ? "width" : "height"]: "1px",
                [isVertical ? "height" : "width"]: `${lineLength}px`,
                zIndex: 9999,
                background: isVertical
                  ? `repeating-linear-gradient(
                      to bottom,
                      ${SNAP_LINE_COLOR} 0px,
                      ${SNAP_LINE_COLOR} 4px,
                      transparent 4px,
                      transparent 8px
                    )`
                  : `repeating-linear-gradient(
                      to right,
                      ${SNAP_LINE_COLOR} 0px,
                      ${SNAP_LINE_COLOR} 4px,
                      transparent 4px,
                      transparent 8px
                    )`,
                boxShadow: `0 0 3px rgba(242, 78, 30, 0.4)`,
              }}
            />

            {/* Start intersection dot */}
            <div
              className={cn(
                "absolute pointer-events-none rounded-full",
                "transition-opacity ease-out"
              )}
              style={{
                opacity: isVisible ? 1 : 0,
                transitionDuration: `${FADE_DURATION}ms`,
                left: isVertical ? `${line.position}px` : `${line.start}px`,
                top: isVertical ? `${line.start}px` : `${line.position}px`,
                width: "6px",
                height: "6px",
                transform: "translate(-50%, -50%)",
                backgroundColor: SNAP_LINE_COLOR,
                border: "1.5px solid white",
                boxShadow: `0 0 4px rgba(242, 78, 30, 0.6)`,
                zIndex: 10000,
              }}
            />

            {/* End intersection dot */}
            <div
              className={cn(
                "absolute pointer-events-none rounded-full",
                "transition-opacity ease-out"
              )}
              style={{
                opacity: isVisible ? 1 : 0,
                transitionDuration: `${FADE_DURATION}ms`,
                left: isVertical ? `${line.position}px` : `${line.end}px`,
                top: isVertical ? `${line.end}px` : `${line.position}px`,
                width: "6px",
                height: "6px",
                transform: "translate(-50%, -50%)",
                backgroundColor: SNAP_LINE_COLOR,
                border: "1.5px solid white",
                boxShadow: `0 0 4px rgba(242, 78, 30, 0.6)`,
                zIndex: 10000,
              }}
            />

            {/* Center alignment indicator (for slide center) */}
            {lineLength > 100 && (
              <div
                className={cn(
                  "absolute pointer-events-none",
                  "transition-opacity ease-out",
                  "flex items-center justify-center"
                )}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transitionDuration: `${FADE_DURATION}ms`,
                  left: isVertical
                    ? `${line.position}px`
                    : `${line.start + lineLength / 2}px`,
                  top: isVertical
                    ? `${line.start + lineLength / 2}px`
                    : `${line.position}px`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10001,
                }}
              >
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: "16px",
                    height: "16px",
                    backgroundColor: SNAP_LINE_COLOR,
                    borderRadius: "50%",
                    border: "2px solid white",
                    boxShadow: `0 2px 6px rgba(242, 78, 30, 0.4)`,
                  }}
                >
                  <svg
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="4" cy="4" r="1.5" fill="white" />
                  </svg>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
