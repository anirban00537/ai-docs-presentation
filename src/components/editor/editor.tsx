"use client";

import React from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { cn } from "@/lib/utils";
import {
  selectActiveSlide,
  selectSlides,
  selectGlobalTheme,
  selectPresentationId,
  updateSlide,
  setSlideTheme,
  removeWidget,
  addSlide,
  updateSlideId,
} from "@/store/slices/slidesSlice";
import { useAddSlide } from "@/hooks/use-presentation";
import { store } from "@/store";
import { useWidgetInteractions } from "@/hooks/use-widget-interactions";
import { EditorToolbarTitle } from "@/components/editor/editor-toolbar-title";
import { EditorToolbarCenter } from "@/components/editor/editor-toolbar-center";
import { EditorToolbarActions } from "@/components/editor/editor-toolbar-actions";
import {
  RightSidebar,
  type SidebarPanel,
} from "@/components/editor/right-sidebar";
import { PresentationMode } from "@/components/editor/presentation-mode";
import { useSlideIntersection } from "@/hooks/use-slide-intersection";
import {
  selectIsPresentationMode,
  setPresentationMode,
} from "@/store/slices/editorUiSlice";
import { SlideWrapper } from "@/components/editor/slide-wrapper";
import { useCreateLayout } from "@/hooks/use-layouts";
import { toast } from "sonner";

const Editor = () => {
  const activeSlide = useAppSelector(selectActiveSlide);
  const slides = useAppSelector(selectSlides);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const presentationId = useAppSelector(selectPresentationId);
  const dispatch = useAppDispatch();
  const addSlideMutation = useAddSlide();
  const createLayoutMutation = useCreateLayout();

  const {
    selectedId,
    editingId,
    liveOverrides,
    onSelectWidget,
    onSetLiveOverride,
    onClearLiveOverride,
  } = useWidgetInteractions();

  const [activePanel, setActivePanel] = React.useState<SidebarPanel>(null);
  const isPresentationMode = useAppSelector(selectIsPresentationMode);

  const togglePanel = React.useCallback((panel: SidebarPanel) => {
    setActivePanel((current) => (current === panel ? null : panel));
  }, []);

  const handleStartPresentation = React.useCallback(() => {
    if (slides.length > 0) {
      dispatch(setPresentationMode(true));
    }
  }, [slides.length, dispatch]);

  const handleExitPresentation = React.useCallback(() => {
    dispatch(setPresentationMode(false));
  }, [dispatch]);

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

  const handleAddAsLayout = React.useCallback(
    async (slideId: string) => {
      const slide = slides.find((s) => s.id === slideId);
      if (!slide) {
        toast.error("Slide not found");
        return;
      }

      try {
        const response = await createLayoutMutation.mutateAsync({
          name: slide.title || "Untitled Layout",
          description: `Layout based on ${slide.title || "slide"}`,
          data: {
            title: slide.title,
            widgets: slide.widgets,
            backgroundColor: slide.backgroundColor,
            backgroundImage: slide.backgroundImage,
            backgroundBlur: slide.backgroundBlur,
            showSlideNumber: slide.showSlideNumber,
            slideStyle: slide.slideStyle,
          },
          type: "user",
          tags: [],
        });

        if (response.success) {
          toast.success("Layout saved successfully");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to save layout");
        console.error("Failed to create layout:", error);
      }
    },
    [slides, createLayoutMutation]
  );

  const handleAddSlideAfter = React.useCallback(
    async (afterSlideId: string) => {
      if (!presentationId) {
        console.error("No presentation ID available");
        return;
      }

      // Calculate insert index
      const insertIndex = slides.findIndex(
        (slide) => slide.id === afterSlideId
      );
      const defaultTitle = `Slide ${slides.length + 1}`;
      const targetIndex = insertIndex >= 0 ? insertIndex + 1 : slides.length;

      // Add to Redux first (creates slide with temporary nanoid ID)
      dispatch(addSlide({ title: defaultTitle }));

      // Get the new slide from Redux state (it's now the active slide)
      // Use setTimeout to ensure Redux state has updated
      setTimeout(async () => {
        const currentState = store.getState();
        const newSlideId = currentState.slides.activeSlideId;
        const newSlide = currentState.slides.slides.find(
          (slide) => slide.id === newSlideId
        );

        if (!newSlide) {
          console.error("Failed to find newly created slide");
          return;
        }

        // Create slide in API immediately
        try {
          const response = await addSlideMutation.mutateAsync({
            presentationId,
            payload: {
              data: {
                id: newSlide.id,
                title: newSlide.title,
                widgets: newSlide.widgets,
                backgroundColor: newSlide.backgroundColor,
                backgroundImage: newSlide.backgroundImage,
                showSlideNumber: newSlide.showSlideNumber,
                slideStyle: newSlide.slideStyle,
              },
              order: targetIndex,
            },
          });

          if (response.success && response.data) {
            // Update the slide ID in Redux with the database ID
            dispatch(
              updateSlideId({
                oldId: newSlide.id,
                newId: response.data.id,
              })
            );
          }
        } catch (error) {
          console.error("Failed to create slide in API:", error);
        }
      }, 0);
    },
    [presentationId, slides, dispatch, addSlideMutation]
  );

  // Scroll container ref for intersection observer
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Use intersection observer to detect visible slide
  const { registerSlide, setProgrammaticScroll } = useSlideIntersection(
    slides,
    scrollContainerRef,
    slides.length > 0 && !isPresentationMode
  );

  // Listen for programmatic scroll events from sidebar
  React.useEffect(() => {
    const handleProgrammaticStart = () => {
      setProgrammaticScroll(true);
    };
    const handleProgrammaticEnd = () => {
      setProgrammaticScroll(false);
    };

    const handleRequestSlideScroll = (event: Event) => {
      const customEvent = event as CustomEvent<{ slideId: string }>;
      const { slideId } = customEvent.detail;
      const container = scrollContainerRef.current;

      if (container) {
        const slideElement = container.querySelector(
          `[data-slide-id="${slideId}"]`
        ) as HTMLElement | null;

        if (slideElement) {
          setProgrammaticScroll(true);
          slideElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Reset programmatic scroll after animation
          setTimeout(() => {
            setProgrammaticScroll(false);
          }, 500);
        }
      }
    };

    window.addEventListener(
      "programmatic-scroll-start",
      handleProgrammaticStart
    );
    window.addEventListener("programmatic-scroll-end", handleProgrammaticEnd);
    window.addEventListener("request-slide-scroll", handleRequestSlideScroll);

    return () => {
      window.removeEventListener(
        "programmatic-scroll-start",
        handleProgrammaticStart
      );
      window.removeEventListener(
        "programmatic-scroll-end",
        handleProgrammaticEnd
      );
      window.removeEventListener(
        "request-slide-scroll",
        handleRequestSlideScroll
      );
    };
  }, [setProgrammaticScroll]);

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
        <div className="fixed top-4 bg-transparent left-4 right-4 flex items-center justify-between gap-4 z-50 pointer-events-none">
          <EditorToolbarTitle />
          <EditorToolbarCenter />
          <EditorToolbarActions onStartPresentation={handleStartPresentation} />
        </div>
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
          />
        </div>
      </div>
    );
  }

  // Get the active slide for right sidebar (use first slide if none active)
  const currentActiveSlide = activeSlide || slides[0];

  return (
    <div
      className="relative flex h-full flex-1 flex-col overflow-hidden"
      style={{
        backgroundColor: globalTheme?.surface || undefined,
      }}
    >
      <div className="flex flex-1 min-h-0 overflow-hidden h-full ">
        <div className="fixed top-4 bg-transparent left-4 right-4 flex items-center justify-between gap-4 z-50 pointer-events-none">
          <EditorToolbarTitle />
          <EditorToolbarCenter />
          <EditorToolbarActions onStartPresentation={handleStartPresentation} />
        </div>
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex-1 overflow-y-auto min-h-0 custom-scrollbar",
            globalTheme?.tone === "dark"
              ? "custom-scrollbar-dark"
              : "custom-scrollbar-light"
          )}
        >
          <div className="flex flex-col items-center gap-16 py-8">
            {slides.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh]">
                <p className="text-muted-foreground/70 text-sm font-medium">
                  No slides yet. Create your first slide to get started.
                </p>
              </div>
            ) : (
              slides.map((slide) => {
                const isActive =
                  slide.id === (activeSlide?.id || slides[0]?.id);
                return (
                  <SlideWrapper
                    key={slide.id}
                    slide={slide}
                    isActive={isActive}
                    selectedId={selectedId}
                    editingId={editingId}
                    liveOverrides={liveOverrides}
                    onSelectWidget={onSelectWidget}
                    onSetLiveOverride={onSetLiveOverride}
                    onClearLiveOverride={onClearLiveOverride}
                    globalTheme={globalTheme}
                    registerSlide={registerSlide}
                    onAddSlideAfter={handleAddSlideAfter}
                    onAddAsLayout={handleAddAsLayout}
                    isSavingLayout={createLayoutMutation.isPending}
                  />
                );
              })
            )}
          </div>
        </div>
        <RightSidebar
          panel={activePanel}
          onClose={() => setActivePanel(null)}
          onOpenPanel={togglePanel}
          backgroundColor={currentActiveSlide?.backgroundColor}
          backgroundImage={currentActiveSlide?.backgroundImage}
          backgroundBlur={currentActiveSlide?.backgroundBlur}
          onBackgroundColorChange={handleBackgroundColorChange}
          onBackgroundImageChange={handleBackgroundImageChange}
          onBackgroundBlurChange={handleBackgroundBlurChange}
          activeThemeId={globalTheme?.id}
          onSelectTheme={handleThemeSelect}
          globalTheme={globalTheme}
        />
      </div>
    </div>
  );
};

export default Editor;
