"use client";

import React from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectActiveSlide,
  selectSlides,
  selectGlobalTheme,
  setActiveSlide,
  updateSlide,
  setSlideTheme,
} from "@/store/slices/slidesSlice";
import { useWidgetInteractions } from "@/hooks/use-widget-interactions";
import { EditorHeader } from "@/components/editor/editor-toolbar";
import { useWidgetCreation } from "@/hooks/use-widget-creation";
import {
  RightSidebar,
  type SidebarPanel,
} from "@/components/editor/right-sidebar";

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

  const {
    handleAddText,
    handleAddShape,
    handleAddFeatureCard,
    handleAddIconCard,
    handleAddLabelCard,
  } = useWidgetCreation();

  const [activePanel, setActivePanel] = React.useState<SidebarPanel>(null);

  const togglePanel = React.useCallback((panel: SidebarPanel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  }, []);

  const handleBackgroundColorChange = React.useCallback(
    (colors: string[]) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundColor: colors,
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleThemeSelect = React.useCallback(
    (themeId: string) => {
      dispatch(
        setSlideTheme({
          themeId,
        })
      );
    },
    [dispatch]
  );

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
          onOpenInsertPanel={() => togglePanel("insert")}
          onOpenBackgroundPanel={() => togglePanel("background")}
          onOpenThemePanel={() => togglePanel("theme")}
        />
        <div className="flex flex-1 min-h-0 overflow-hidden h-full">
          <div className="flex flex-1 flex-col items-center justify-center min-h-0">
            <p className="text-muted-foreground">No slide selected</p>
          </div>
          {activePanel && (
            <RightSidebar
              panel={activePanel}
              onClose={() => setActivePanel(null)}
              onAddText={handleAddText}
              onAddShape={handleAddShape}
              onAddFeatureCard={handleAddFeatureCard}
              onAddIconCard={handleAddIconCard}
              onAddLabelCard={handleAddLabelCard}
              backgroundColor={undefined}
              onBackgroundColorChange={handleBackgroundColorChange}
              activeThemeId={globalTheme?.id}
              onSelectTheme={handleThemeSelect}
            />
          )}
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
        onOpenInsertPanel={() => togglePanel("insert")}
        onOpenBackgroundPanel={() => togglePanel("background")}
        onOpenThemePanel={() => togglePanel("theme")}
      />
      <div className="flex flex-1 min-h-0 overflow-hidden h-full">
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
        {activePanel && (
          <RightSidebar
            panel={activePanel}
            onClose={() => setActivePanel(null)}
            onAddText={handleAddText}
            onAddShape={handleAddShape}
            onAddFeatureCard={handleAddFeatureCard}
            onAddIconCard={handleAddIconCard}
            onAddLabelCard={handleAddLabelCard}
            backgroundColor={activeSlide?.backgroundColor}
            onBackgroundColorChange={handleBackgroundColorChange}
            activeThemeId={globalTheme?.id}
            onSelectTheme={handleThemeSelect}
          />
        )}
      </div>
    </div>
  );
};

export default Editor;
