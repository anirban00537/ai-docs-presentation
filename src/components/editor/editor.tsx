"use client";

import React from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector } from "@/store/hooks";
import { selectActiveSlide } from "@/store/slices/slidesSlice";
import { useWidgetInteractions } from "@/hooks/use-widget-interactions";

const Editor = () => {
  const activeSlide = useAppSelector(selectActiveSlide);

  const {
    selectedId,
    editingId,
    liveOverrides,
    onSelectWidget,
    onSetLiveOverride,
    onClearLiveOverride,
  } = useWidgetInteractions();

  if (!activeSlide) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center">
        <p className="text-muted-foreground">No slide selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-hidden">
        <Slide
          slide={activeSlide}
          selectedId={selectedId}
          editingId={editingId}
          liveOverrides={liveOverrides}
          onSelectWidget={onSelectWidget}
          onSetLiveOverride={onSetLiveOverride}
          onClearLiveOverride={onClearLiveOverride}
        />
      </div>
    </div>
  );
};

export default Editor;
