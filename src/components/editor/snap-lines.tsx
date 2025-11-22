"use client";

import React from "react";
import type { SnapLine } from "@/components/editor/widgets/types";

type SnapLinesProps = {
  lines: SnapLine[];
};

export const SnapLines: React.FC<SnapLinesProps> = ({ lines }) => {
  if (lines.length === 0) {
    return null;
  }

  return (
    <>
      {lines.map((line, i) => (
        <div
          key={`snap-line-${i}`}
          className="absolute pointer-events-none"
          style={{
            borderLeft:
              line.type === "vertical" ? "1px dashed #F24E1E" : "none",
            borderTop:
              line.type === "horizontal" ? "1px dashed #F24E1E" : "none",
            left:
              line.type === "vertical" ? `${line.position}px` : `${line.start}px`,
            top:
              line.type === "horizontal"
                ? `${line.position}px`
                : `${line.start}px`,
            width:
              line.type === "horizontal" ? `${line.end - line.start}px` : "0px",
            height:
              line.type === "vertical" ? `${line.end - line.start}px` : "0px",
            zIndex: 9999,
          }}
        />
      ))}
    </>
  );
};

