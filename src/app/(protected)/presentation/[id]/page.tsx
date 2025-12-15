"use client";

import React, { useState, useEffect, useRef } from "react";

import { useSearchParams, useParams } from "next/navigation";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion } from "framer-motion";
import {
  SlideCard,
  SlidesSidebar,
  PresentationTopBar,
  GeneratingIndicator,
  PresentationMode,
  BlockDragPreview,
} from "@/app/(protected)/presentation/[id]/editor";
import { BlockFocusProvider } from "@/app/(protected)/presentation/[id]/editor/BlockFocusContext";
import { LoadingScreen } from "@/app/(protected)/presentation/[id]/editor/LoadingScreen";
import { useEditorPage } from "./hooks/useEditorPage";
import { useAppSelector } from "@/store/hooks";
import { selectPresentation, selectActiveSlideId } from "@/store/slices/slidesSlice";
import { FloatingSidebar } from "./editor/FloatingSidebar";
import { useUndoRedoKeyboardShortcuts } from "@/hooks/useUndoRedo";

// --- Main Page Component ---
const GammaPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const presentationId = params?.id as string;
  const outlineId = searchParams.get("outlineId");

  const {
    slides,
    theme,
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    isLoadingPresentation,
    isGeneratingSlides,
    slideGenerationProgress,
  } = useEditorPage({ presentationId, outlineId });

  const presentation = useAppSelector(selectPresentation);
  const activeSlideId = useAppSelector(selectActiveSlideId);

  // Enable undo/redo keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
  useUndoRedoKeyboardShortcuts();

  const isDark = theme.themeType === "dark";

  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const presentationContainerRef = useRef<HTMLDivElement>(null);

  const handlePresentClick = () => {
    setIsPresenting(true);
    setCurrentSlideIndex(0);
  };

  // Lock body scroll during presentation
  useEffect(() => {
    if (isPresenting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPresenting]);

  // Reset scroll position on slide change
  useEffect(() => {
    if (presentationContainerRef.current) {
      presentationContainerRef.current.scrollTop = 0;
    }
  }, [currentSlideIndex]);

  // Keyboard navigation for presentation mode
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        presentationContainerRef.current?.scrollBy({
          top: 100,
          behavior: "smooth",
        });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        presentationContainerRef.current?.scrollBy({
          top: -100,
          behavior: "smooth",
        });
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, slides.length]);

  // Scroll active slide into view
  useEffect(() => {
    if (activeSlideId && !isPresenting) {
      const slideElement = document.querySelector(`[data-slide-id="${activeSlideId}"]`);
      if (slideElement) {
        slideElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [activeSlideId, isPresenting]);

  // Auto-scroll to bottom when new slides arrive during generation
  useEffect(() => {
    if (isGeneratingSlides && slides.length > 0) {
      const timeoutId = setTimeout(() => {
        const allSlides = document.querySelectorAll('[data-slide-id]');
        const lastSlide = allSlides[allSlides.length - 1];
        if (lastSlide) {
          lastSlide.scrollIntoView({ behavior: "smooth", block: "end" });
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isGeneratingSlides, slides.length]);

  // Only show loading screen during initial presentation load
  const showLoading = isLoadingPresentation && !isGeneratingSlides;

  if (showLoading) {
    return (
      <>
        <GoogleFontsLoader />
        <LoadingScreen isGenerating={false} progress={null} />
      </>
    );
  }

  return (
    <>
      <GoogleFontsLoader />

      {/* Presentation Mode Overlay */}
      <PresentationMode
        isPresenting={isPresenting}
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        theme={theme}
        containerRef={presentationContainerRef}
        onPrevSlide={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
        onNextSlide={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
        onClose={() => setIsPresenting(false)}
        onUpdateBlock={handleUpdateBlock}
        onDeleteRow={handleDeleteRow}
        onAddColumn={handleAddColumn}
        onAddRowAtTop={handleAddRowAtTop}
        onAddRowAtBottom={handleAddRowAtBottom}
        onUpdateColumnWidths={handleUpdateColumnWidths}
      />

      <PresentationTopBar onPresentClick={handlePresentClick} />
      
      {/* Clean background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: theme.pageBackground,
        }}
      />
      
      {/* Subtle ambient gradient */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          background: isDark 
            ? `radial-gradient(ellipse at 30% 20%, ${theme.primary}06 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${theme.primary}04 0%, transparent 40%)`
            : `radial-gradient(ellipse at 30% 20%, ${theme.primary}08 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, ${theme.primary}05 0%, transparent 40%)`,
        }}
      />

      {/* Scrollable content container */}
      <div className="min-h-screen overflow-y-auto pt-16 relative">
        {/* Slides Sidebar */}
        <SlidesSidebar
          slides={slides.filter(
            (slide) => slide && slide.rows && Array.isArray(slide.rows)
          )}
          onUpdateBlock={handleUpdateBlock}
          onDeleteRow={handleDeleteRow}
          onAddColumn={handleAddColumn}
          onAddRowAtTop={handleAddRowAtTop}
          onAddRowAtBottom={handleAddRowAtBottom}
          onUpdateColumnWidths={handleUpdateColumnWidths}
        />

        <div className="w-full mx-auto px-6 py-10 pr-16">
          {/* All Slides */}
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* Block Focus Provider for keyboard navigation */}
            <BlockFocusProvider>
              {/* Blocks Panel needs to be inside DndContext for drag to work */}
              <FloatingSidebar presentationId={presentationId} />

              <div className="flex flex-col gap-16">
                {slides
                  .filter(
                    (slide) => slide && slide.rows && Array.isArray(slide.rows)
                  )
                  .map((slide, index) => (
                    <motion.div
                      key={slide.id}
                      data-slide-id={slide.id}
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      {/* Slide number indicator */}
                      <div
                        className="absolute -left-12 top-6 text-xs font-medium opacity-40"
                        style={{ color: theme.bodyColor }}
                      >
                        {index + 1}
                      </div>
                      
                      <SlideCard
                        slide={slide}
                        onUpdateBlock={handleUpdateBlock}
                        onDeleteRow={handleDeleteRow}
                        onAddColumn={handleAddColumn}
                        onAddRowAtTop={handleAddRowAtTop}
                        onAddRowAtBottom={handleAddRowAtBottom}
                        onUpdateColumnWidths={handleUpdateColumnWidths}
                      />
                    </motion.div>
                  ))}
              </div>
            </BlockFocusProvider>

            {/* Drag Overlay */}
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              {activeBlock && (
                <BlockDragPreview block={activeBlock} theme={theme} />
              )}
              {isBlockDragging && draggingBlockType && (
                <BlockDragPreview blockType={draggingBlockType} theme={theme} />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Generating Indicator */}
      <GeneratingIndicator
        isGenerating={isGeneratingSlides}
        progress={slideGenerationProgress}
        theme={theme}
      />
    </>
  );
};

export default GammaPage;
