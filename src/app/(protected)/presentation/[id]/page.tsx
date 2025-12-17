"use client";

import React, { useEffect } from "react";

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
import { usePresentationMode } from "./hooks/usePresentationMode";
import { useAppSelector } from "@/store/hooks";
import { selectPresentation, selectActiveSlideId } from "@/store/slices/slidesSlice";
import { FloatingSidebar } from "./editor/FloatingSidebar";
import { useUndoRedoKeyboardShortcuts } from "@/hooks/useUndoRedo";

// --- Main Page Component ---
const PresentationEditorPage = () => {
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

  // Presentation mode hook - handles all presentation state and navigation
  const {
    isPresenting,
    currentSlideIndex,
    presentationContainerRef,
    startPresentation,
    stopPresentation,
    goToNextSlide,
    goToPrevSlide,
  } = usePresentationMode({ slidesCount: slides.length });

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

      <PresentationTopBar onPresentClick={startPresentation} />
      
      {/* Base background */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: theme.pageBackground,
        }}
      />
      
      {/* === MESH GRADIENT === */}
      {/* Primary blob - Top Left */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "60vw",
          height: "60vh",
          top: "-20%",
          left: "-10%",
          background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '20' : '15'} 0%, ${theme.primary}${isDark ? '08' : '05'} 40%, transparent 70%)`,
          filter: "blur(80px)",
          transform: "rotate(-15deg)",
        }}
      />
      
      {/* Heading color blob - Top Right */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "50vw",
          height: "50vh",
          top: "-15%",
          right: "-15%",
          background: `radial-gradient(circle at center, ${theme.headingColor}${isDark ? '12' : '08'} 0%, ${theme.primary}${isDark ? '06' : '04'} 50%, transparent 70%)`,
          filter: "blur(100px)",
          transform: "rotate(20deg)",
        }}
      />
      
      {/* Primary accent - Left Center */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "40vw",
          height: "70vh",
          top: "20%",
          left: "-15%",
          background: `radial-gradient(ellipse at center, ${theme.primary}${isDark ? '15' : '10'} 0%, transparent 70%)`,
          filter: "blur(90px)",
        }}
      />
      
      {/* Card background blob - Right Center */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "45vw",
          height: "60vh",
          top: "30%",
          right: "-10%",
          background: `radial-gradient(ellipse at center, ${theme.cardBackground}${isDark ? '18' : '12'} 0%, ${theme.primary}${isDark ? '05' : '03'} 50%, transparent 70%)`,
          filter: "blur(110px)",
          transform: "rotate(-10deg)",
        }}
      />
      
      {/* Body color - Center */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "50vw",
          height: "50vh",
          top: "25%",
          left: "25%",
          background: `radial-gradient(circle at center, ${theme.bodyColor}${isDark ? '06' : '04'} 0%, transparent 60%)`,
          filter: "blur(120px)",
        }}
      />
      
      {/* Primary blob - Bottom Left */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "55vw",
          height: "55vh",
          bottom: "-20%",
          left: "-10%",
          background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '18' : '12'} 0%, ${theme.headingColor}${isDark ? '06' : '04'} 50%, transparent 70%)`,
          filter: "blur(100px)",
          transform: "rotate(25deg)",
        }}
      />
      
      {/* Heading accent - Bottom Right */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "50vw",
          height: "50vh",
          bottom: "-15%",
          right: "-10%",
          background: `radial-gradient(circle at center, ${theme.headingColor}${isDark ? '10' : '06'} 0%, ${theme.cardBackground}${isDark ? '08' : '05'} 40%, transparent 70%)`,
          filter: "blur(90px)",
          transform: "rotate(-20deg)",
        }}
      />
      
      {/* Primary center glow */}
      <div
        className="fixed -z-10 pointer-events-none"
        style={{
          width: "35vw",
          height: "35vh",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle at center, ${theme.primary}${isDark ? '08' : '05'} 0%, transparent 70%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
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

export default PresentationEditorPage;
