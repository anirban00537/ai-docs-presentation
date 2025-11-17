"use client";

import React from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector } from "@/store/hooks";
import { selectActiveSlide } from "@/store/slices/slidesSlice";
import { useElementInteractions } from "@/hooks/use-element-interactions";

const Editor = () => {
  const activeSlide = useAppSelector(selectActiveSlide);

  const {
    selectedId,
    editingId,
    liveOverrides,
    onSelectElement,
    onSetLiveOverride,
    onClearLiveOverride,
  } = useElementInteractions();

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
          onSelectElement={onSelectElement}
          onSetLiveOverride={onSetLiveOverride}
          onClearLiveOverride={onClearLiveOverride}
        />
      </div>
    </div>
  );
};

export default Editor;
