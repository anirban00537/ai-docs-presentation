"use client";

import React from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { cn } from "@/lib/utils";
import {
  selectActiveSlide,
  selectSlides,
  selectGlobalTheme,
  selectPresentationId,
  updateSlide,
  setSlideTheme,
  updateGlobalTheme,
  removeWidget,
  addSlide,
  updateSlideId,
} from "@/store/slices/slidesSlice";
import { useAddSlide } from "@/hooks/use-presentation";
import { store } from "@/store";
import { Plus } from "lucide-react";
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
import type { SlideModel, GlobalTheme } from "@/store/slices/slidesSlice";
import {
  selectIsPresentationMode,
  setPresentationMode,
} from "@/store/slices/editorUiSlice";

// Slide wrapper component for intersection observer
const SlideWrapper: React.FC<{
  slide: SlideModel;
  isActive: boolean;
  selectedId: string | null;
  editingId: string | null;
  liveOverrides: Record<string, any>;
  onSelectWidget: (id: string | null) => void;
  onSetLiveOverride: (id: string, updates: any) => void;
  onClearLiveOverride: (id: string) => void;
  globalTheme: GlobalTheme | null;
  registerSlide: (slideId: string, element: HTMLDivElement | null) => void;
  onAddSlideAfter: (slideId: string) => void;
}> = ({
  slide,
  isActive,
  selectedId,
  editingId,
  liveOverrides,
  onSelectWidget,
  onSetLiveOverride,
  onClearLiveOverride,
  globalTheme,
  registerSlide,
  onAddSlideAfter,
}) => {
  const slideRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (slideRef.current) {
      registerSlide(slide.id, slideRef.current);
    }
    return () => {
      registerSlide(slide.id, null);
    };
  }, [slide.id, registerSlide]);

  // Calculate slide height based on viewport height (accounting for toolbar)
  const [slideHeight, setSlideHeight] = React.useState(0);

  React.useEffect(() => {
    const updateHeight = () => {
      // Viewport height minus toolbar (pt-20 = 5rem = 80px)
      const height = window.innerHeight - 80;
      setSlideHeight(height);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <div
      ref={slideRef}
      data-slide-id={slide.id}
      className="group relative w-full flex flex-col justify-center items-center"
      style={{
        minHeight: slideHeight > 0 ? `${slideHeight}px` : "100vh",
        height: slideHeight > 0 ? `${slideHeight}px` : "100vh",
      }}
    >
      <Slide
        slide={slide}
        selectedId={isActive ? selectedId : null}
        editingId={isActive ? editingId : null}
        liveOverrides={isActive ? liveOverrides : {}}
        onSelectWidget={isActive ? onSelectWidget : () => {}}
        onSetLiveOverride={isActive ? onSetLiveOverride : () => {}}
        onClearLiveOverride={isActive ? onClearLiveOverride : () => {}}
        globalTheme={globalTheme || undefined}
        showSnapLines={isActive}
      />
      {/* Add Slide Button - appears on hover */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none group-hover:pointer-events-auto z-10">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddSlideAfter(slide.id);
          }}
          className={cn(
            "flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-lg",
            "transition-all duration-200 ease-out",
            "hover:scale-105 active:scale-95",
            isDarkTheme
              ? "bg-oklch(0.1 0.01 250) border border-neutral-800 text-white/80 hover:text-white hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
              : "bg-oklch(1 0 0) border border-border text-muted-foreground hover:text-foreground hover:bg-background shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
          )}
          style={{
            backgroundColor: isDarkTheme
              ? "oklch(0.1 0.01 250)"
              : "oklch(1 0 0)",
            boxShadow: isDarkTheme
              ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
              : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
          }}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-semibold">Add Slide</span>
        </button>
      </div>
    </div>
  );
};

const Editor = () => {
  const activeSlide = useAppSelector(selectActiveSlide);
  const slides = useAppSelector(selectSlides);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const presentationId = useAppSelector(selectPresentationId);
  const dispatch = useAppDispatch();
  const addSlideMutation = useAddSlide();

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
            onThemeChange={handleThemeChange}
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
          onThemeChange={handleThemeChange}
        />
      </div>
    </div>
  );
};

export default Editor;
