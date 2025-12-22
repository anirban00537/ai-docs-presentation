"use client";

import React, { useMemo } from "react";
import { SlideContainer } from "@/app/(protected)/presentation/[id]/editor/slide/SlideContainer";
import { Theme } from "@/store/slices/slidesSlice";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";

interface SlidePreviewProps {
  slide: any;
  theme: Theme;
}

export const SlidePreview: React.FC<SlidePreviewProps> = ({ slide, theme }) => {
  const containerWidth = 360;
  const scale = containerWidth / SLIDE_MAX_WIDTH;
  const slideHeight = SLIDE_MAX_WIDTH * (9 / 16);
  const thumbnailHeight = slideHeight * scale;

  // Convert API slide data to Redux format
  const reduxSlide = useMemo(
    () => ({
      id: slide.id,
      rows: slide.data?.rows || [],
    }),
    [slide]
  );

  // No-op handlers for read-only preview
  const noop = () => {};

  return (
    <div
      className="relative overflow-hidden"
      style={{
        height: `${thumbnailHeight}px`,
        borderRadius: "0.75rem 0.75rem 0 0",
      }}
    >
      {/* Subtle gradient overlay at top for depth */}
      <div
        className="absolute inset-x-0 top-0 h-8 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, transparent 100%)",
        }}
      />

      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${SLIDE_MAX_WIDTH}px`,
          height: `${slideHeight}px`,
        }}
      >
        <div
          style={{
            backgroundColor: theme.pageBackground,
            fontFamily: `${theme.fontFamily}, sans-serif`,
          }}
        >
          <SlideContainer
            slide={reduxSlide}
            onUpdateBlock={noop}
            onDeleteRow={noop}
            onAddColumn={noop}
            onAddRowAtTop={noop}
            onAddRowAtBottom={noop}
            onUpdateColumnWidths={noop}
            enableDragHints={false}
            readOnly={true}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
};
