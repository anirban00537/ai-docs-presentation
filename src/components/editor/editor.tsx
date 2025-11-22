"use client";

import React from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectActiveSlide,
  selectSlides,
  selectGlobalTheme,
  setActiveSlide,
} from "@/store/slices/slidesSlice";
import { useWidgetInteractions } from "@/hooks/use-widget-interactions";
import { EditorHeader } from "@/components/editor/editor-toolbar";
import { useWidgetCreation } from "@/hooks/use-widget-creation";

const Editor = () => {
  const activeSlide = useAppSelector(selectActiveSlide);
  const slides = useAppSelector(selectSlides);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const dispatch = useAppDispatch();

  const {
    selectedId,
    editingId,
    liveOverrides,
    onSelectWidget,
    onSetLiveOverride,
    onClearLiveOverride,
  } = useWidgetInteractions();

  const { handleAddText, handleAddShape, handleAddFeatureCard } =
    useWidgetCreation();

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!activeSlide || slides.length === 0) return;

    // Only react to vertical scrolling
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

    event.preventDefault();

    const currentIndex = slides.findIndex(
      (slide) => slide.id === activeSlide.id
    );
    if (currentIndex === -1) return;

    const direction = event.deltaY > 0 ? 1 : -1; // down = next, up = previous
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= slides.length) return;

    dispatch(setActiveSlide(slides[nextIndex].id));
  };

  if (!activeSlide) {
    return (
      <div className="flex h-full flex-1 flex-col overflow-hidden">
        <EditorHeader
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddFeatureCard={handleAddFeatureCard}
        />
        <div className="flex flex-1 flex-col items-center justify-center min-h-0">
          <p className="text-muted-foreground">No slide selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden">
      <EditorHeader
        onAddText={handleAddText}
        onAddShape={handleAddShape}
        onAddFeatureCard={handleAddFeatureCard}
      />
      <div
        className="flex flex-1 flex-col gap-4 overflow-hidden px-4 pt-4 min-h-0"
        onWheel={handleWheel}
      >
        <Slide
          slide={activeSlide}
          selectedId={selectedId}
          editingId={editingId}
          liveOverrides={liveOverrides}
          onSelectWidget={onSelectWidget}
          onSetLiveOverride={onSetLiveOverride}
          onClearLiveOverride={onClearLiveOverride}
          theme={globalTheme}
        />
      </div>
    </div>
  );
};

export default Editor;
