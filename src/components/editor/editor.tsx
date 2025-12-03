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
  updateGlobalTheme,
  removeWidget,
} from "@/store/slices/slidesSlice";
import { useWidgetInteractions } from "@/hooks/use-widget-interactions";
import { EditorHeader } from "@/components/editor/editor-toolbar";
import {
  RightSidebar,
  type SidebarPanel,
} from "@/components/editor/right-sidebar";
import { PresentationMode } from "@/components/editor/presentation-mode";

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

  const [activePanel, setActivePanel] = React.useState<SidebarPanel>(null);
  const [isPresentationMode, setIsPresentationMode] = React.useState(false);

  const togglePanel = React.useCallback((panel: SidebarPanel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  }, []);

  const handleStartPresentation = React.useCallback(() => {
    if (slides.length > 0) {
      setIsPresentationMode(true);
    }
  }, [slides.length]);

  const handleExitPresentation = React.useCallback(() => {
    setIsPresentationMode(false);
  }, []);

  const handleBackgroundColorChange = React.useCallback(
    (color: string) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundColor: color,
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleBackgroundImageChange = React.useCallback(
    (imageUrl: string | undefined) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundImage: imageUrl,
          },
        })
      );
    },
    [activeSlide, dispatch]
  );

  const handleBackgroundBlurChange = React.useCallback(
    (blur: boolean) => {
      if (!activeSlide) return;
      dispatch(
        updateSlide({
          slideId: activeSlide.id,
          updates: {
            backgroundBlur: blur,
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

  const handleThemeChange = React.useCallback(
    (updates: Partial<Omit<typeof globalTheme, "id">>) => {
      dispatch(
        updateGlobalTheme({
          updates,
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

  React.useEffect(() => {
    if (!selectedId || !activeSlide) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Delete") {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (editingId) {
        return;
      }

      event.preventDefault();
      dispatch(
        removeWidget({
          widgetId: selectedId,
          slideId: activeSlide.id,
        })
      );
      onSelectWidget(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedId, activeSlide, editingId, dispatch, onSelectWidget]);

  // Presentation Mode
  if (isPresentationMode) {
    const currentSlideIndex = activeSlide
      ? slides.findIndex((s) => s.id === activeSlide.id)
      : 0;

    return (
      <PresentationMode
        slides={slides}
        initialSlideIndex={Math.max(0, currentSlideIndex)}
        globalTheme={globalTheme}
        onExit={handleExitPresentation}
      />
    );
  }

  if (!activeSlide) {
    return (
      <div
        className="flex h-full flex-1 flex-col overflow-hidden"
        style={{
          backgroundColor: globalTheme?.surface || undefined,
        }}
      >
        <EditorHeader
          onOpenInsertPanel={() => togglePanel("insert")}
          onStartPresentation={handleStartPresentation}
        />
        <div className="flex flex-1 min-h-0 overflow-hidden h-full  py-10">
          <div className="flex flex-1 flex-col items-center justify-center min-h-0">
            <p className="text-muted-foreground/70 text-sm font-medium">
              No slide selected
            </p>
          </div>
          <RightSidebar
            panel={activePanel}
            onClose={() => setActivePanel(null)}
            onOpenPanel={togglePanel}
            backgroundColor={undefined}
            onBackgroundColorChange={handleBackgroundColorChange}
            onBackgroundBlurChange={handleBackgroundBlurChange}
            activeThemeId={globalTheme?.id}
            onSelectTheme={handleThemeSelect}
            globalTheme={globalTheme}
            onThemeChange={handleThemeChange}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-full flex-1 flex-col overflow-hidden"
      style={{
        backgroundColor: globalTheme?.surface || undefined,
      }}
    >
      <EditorHeader
        onOpenInsertPanel={() => togglePanel("insert")}
        onStartPresentation={handleStartPresentation}
      />
      <div className="flex flex-1 min-h-0 overflow-hidden h-full  py-10">
        <div
          className="flex flex-1 flex-col gap-1 overflow-hidden px-1 pt-1 min-h-0"
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
            globalTheme={globalTheme}
          />
        </div>
        <RightSidebar
          panel={activePanel}
          onClose={() => setActivePanel(null)}
          onOpenPanel={togglePanel}
          backgroundColor={activeSlide?.backgroundColor}
          backgroundImage={activeSlide?.backgroundImage}
          backgroundBlur={activeSlide?.backgroundBlur}
          onBackgroundColorChange={handleBackgroundColorChange}
          onBackgroundImageChange={handleBackgroundImageChange}
          onBackgroundBlurChange={handleBackgroundBlurChange}
          activeThemeId={globalTheme?.id}
          onSelectTheme={handleThemeSelect}
          globalTheme={globalTheme}
          onThemeChange={handleThemeChange}
        />
      </div>
    </div>
  );
};

export default Editor;
