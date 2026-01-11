"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlideCanvas,
  SlideNavigator,
  EditorHeader,
  PresentationView,
  EditorBackground,
  BlockSelectionProvider,
  ToolbarPanel,
  EditorThemeProvider,
  EditorDndProvider,
  useEditorTheme,
  ScalableSlideContainer,
} from "@/app/(protected)/docs/[id]/editor";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { LoadingOverlay } from "@/app/(protected)/docs/[id]/editor";
import { LoaderOverlay } from "@/components/ui";
import { useEditorPage } from "./hooks/useEditorPage";
import { usePresentationMode } from "./hooks/usePresentationMode";
import { useAppSelector } from "@/store/hooks";
import { selectPresentation, selectActiveSlideId } from "@/store/slices/slidesSlice";
import { useUndoRedoKeyboardShortcuts } from "@/app/(protected)/docs/[id]/hooks/useUndoRedo";
import DragOverlayWrapper from "./DragOverlayWrapper";
import { Slide } from "@/store/slices/slidesSlice";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import { cn } from "@/lib/utils";


const EditorContent = ({ presentationId, outlineId }: { presentationId: string, outlineId: string | null }) => {
  const {
    slides,
    commandBus,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleAddSlide,
    handleDeleteSlide,
    isLoadingPresentation,
    isGeneratingSlides,
    slideGenerationProgress,
    slideGenerationSpeed,
  } = useEditorPage({ presentationId, outlineId });

  const theme = useEditorTheme();
  const presentation = useAppSelector(selectPresentation);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const isDark = theme.themeType === "dark";
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Mobile UI States
  const [isMobileNavigatorOpen, setIsMobileNavigatorOpen] = useState(false);

  useUndoRedoKeyboardShortcuts();

  const {
    isPresenting,
    currentSlideIndex,
    presentationContainerRef,
    startPresentation,
    stopPresentation,
    goToNextSlide,
    goToPrevSlide,
  } = usePresentationMode({ slidesCount: slides.length });

  useEffect(() => {
    if (activeSlideId && !isPresenting && !isGeneratingSlides) {
      setTimeout(() => {
        const slideElement = document.querySelector(`[data-slide-id="${activeSlideId}"]`);
        if (slideElement) {
          slideElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
      
      // Close mobile navigator when a slide is selected
      setIsMobileNavigatorOpen(false);
    }
  }, [activeSlideId, isPresenting]);

  useEffect(() => {
    if (isGeneratingSlides && slides.length > 0) {
      const timeoutId = setTimeout(() => {
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          // Scroll to the absolute bottom of the container during generation.
          // This follows streaming changes closely and keeps the latest content in view.
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "auto"
          });
        }
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isGeneratingSlides, slides]); // Watch 'slides' to follow streaming content updates

  const showLoading = isLoadingPresentation && !isGeneratingSlides;

  if (showLoading) {
    return (
      <>
        <GoogleFontsLoader />
        <LoadingOverlay isGenerating={false} progress={null} />
      </>
    );
  }

  return (
    <>
      <GoogleFontsLoader />

      <PresentationView
        isPresenting={isPresenting}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        theme={theme}
        containerRef={presentationContainerRef}
        onPrevSlide={goToPrevSlide}
        onNextSlide={goToNextSlide}
        onClose={stopPresentation}
        onUpdateBlock={handleUpdateBlock}
        onDeleteRow={handleDeleteRow}
        onAddColumn={handleAddColumn}
        onAddRowAtTop={handleAddRowAtTop}
        onAddRowAtBottom={handleAddRowAtBottom}
        onUpdateColumnWidths={handleUpdateColumnWidths}
      />

      <EditorHeader 
        onPresentClick={startPresentation} 
        onMenuClick={() => setIsMobileNavigatorOpen(!isMobileNavigatorOpen)}
      />

      <div className="fixed inset-0 pt-16 flex overflow-hidden">
        <EditorBackground theme={theme} />

        {/* Desktop Sidebar */}
        <div className="hidden lg:flex h-full">
          <SlideNavigator
            slides={slides.filter(
              (slide: Slide) => slide && slide.rows && Array.isArray(slide.rows)
            )}
            onUpdateBlock={handleUpdateBlock}
            onDeleteRow={handleDeleteRow}
            onAddColumn={handleAddColumn}
            onAddRowAtTop={handleAddRowAtTop}
            onAddRowAtBottom={handleAddRowAtBottom}
            onUpdateColumnWidths={handleUpdateColumnWidths}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileNavigatorOpen && (
            <div className="lg:hidden fixed inset-0 z-[100]">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileNavigatorOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute top-0 left-0 bottom-0 w-[240px] bg-white dark:bg-[#121216] shadow-2xl"
              >
                <div className="h-full w-full overflow-hidden">
                   <SlideNavigator
                      slides={slides.filter(
                        (slide: Slide) => slide && slide.rows && Array.isArray(slide.rows)
                      )}
                      onUpdateBlock={handleUpdateBlock}
                      onDeleteRow={handleDeleteRow}
                      onAddColumn={handleAddColumn}
                      onAddRowAtTop={handleAddRowAtTop}
                      onAddRowAtBottom={handleAddRowAtBottom}
                      onUpdateColumnWidths={handleUpdateColumnWidths}
                      onAddSlide={handleAddSlide}
                      onDeleteSlide={handleDeleteSlide}
                      isMobile={true}
                    />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-hidden relative flex flex-col">
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto w-full relative">
            <div className="w-full max-w-[1400px] mx-auto px-4 py-8 flex flex-col items-center min-h-full">
              <EditorDndProvider slides={slides} commandBus={commandBus}>
                <BlockSelectionProvider>
                  <ToolbarPanel presentationId={presentationId} />

                  <div className="flex flex-col w-full items-center pb-32 gap-3">
                    {slides
                      .filter(
                        (slide: Slide) => slide && slide.rows && Array.isArray(slide.rows)
                      )
                      .map((slide: Slide, index: number) => (
                        <motion.div
                          key={slide.id}
                          data-slide-id={slide.id}
                          data-slide-index={index}
                          className="w-full max-w-full relative"
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <div
                            className="absolute -left-10 top-0 text-xs font-bold opacity-30 select-none hidden xl:block"
                            style={{ color: theme.bodyColor }}
                          >
                            {index + 1}
                          </div>

                          <ScalableSlideContainer>
                            <SlideCanvas
                              slide={slide}
                              onUpdateBlock={handleUpdateBlock}
                              onDeleteRow={handleDeleteRow}
                              onAddColumn={handleAddColumn}
                              onAddRowAtTop={handleAddRowAtTop}
                              onAddRowAtBottom={handleAddRowAtBottom}
                              onUpdateColumnWidths={handleUpdateColumnWidths}
                            />
                          </ScalableSlideContainer>
                        </motion.div>
                      ))}
                  </div>
                </BlockSelectionProvider>

                <DragOverlayWrapper />
              </EditorDndProvider>
            </div>
          </div>
        </div>
      </div>

      <LoaderOverlay
        isLoading={isGeneratingSlides}
        progress={slideGenerationProgress}
        theme={theme}
        mode={isDark ? "dark" : "light"}
        streamSpeed={slideGenerationSpeed}
      />
    </>
  );
};

export default EditorContent;