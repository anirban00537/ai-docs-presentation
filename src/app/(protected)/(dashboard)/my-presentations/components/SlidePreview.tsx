"use client";

import React, { useMemo } from "react";
import { SlideCard } from "@/app/(protected)/presentation/[id]/editor/SlideCard";
import { Theme } from "@/store/slices/slidesSlice";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import { Provider } from "react-redux";
import { store } from "@/store";

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
  const reduxSlide = useMemo(() => ({
    id: slide.id,
    rows: slide.data?.rows || [],
  }), [slide]);

  // No-op handlers for read-only preview
  const noop = () => {};

  return (
    <div 
      className="relative overflow-hidden rounded-xl"
      style={{ height: `${thumbnailHeight}px` }}
    >
      <div
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: `${SLIDE_MAX_WIDTH}px`,
          height: `${slideHeight}px`,
        }}
      >
        <Provider store={store}>
          <div
            style={{
              backgroundColor: theme.pageBackground,
              fontFamily: `${theme.fontFamily}, sans-serif`,
            }}
          >
            <SlideCard
              slide={reduxSlide}
              onUpdateBlock={noop}
              onDeleteRow={noop}
              onAddColumn={noop}
              onAddRowAtTop={noop}
              onAddRowAtBottom={noop}
              onUpdateColumnWidths={noop}
              enableDragHints={false}
              readOnly={true}
            />
          </div>
        </Provider>
      </div>
    </div>
  );
};
