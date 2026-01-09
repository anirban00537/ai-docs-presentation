"use client";

import React, { useEffect } from "react";

import { useSearchParams, useParams } from "next/navigation";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion } from "framer-motion";
import {
  SlideCanvas,
  SlideNavigator,
  EditorHeader,
  PresentationView,
  DragPreview,
  EditorBackground,
  BlockSelectionProvider,
  ToolbarPanel,
  LoadingOverlay,
  EditorThemeProvider,
  EditorDndProvider,
  useEditorDndContext,
  useEditorTheme,
} from "@/app/(protected)/presentation/[id]/editor";
import { LoaderOverlay } from "@/components/ui";
import { useEditorPage } from "./hooks/useEditorPage";
import { usePresentationMode } from "./hooks/usePresentationMode";
import { useAppSelector } from "@/store/hooks";
import { selectPresentation, selectActiveSlideId } from "@/store/slices/slidesSlice";
import { useUndoRedoKeyboardShortcuts } from "@/app/(protected)/presentation/[id]/hooks/useUndoRedo";

// --- Main Page Component ---
const PresentationEditorPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const presentationId = params?.id as string;
  const outlineId = searchParams.get("outlineId");

  const commandBus = useEditorPage({ presentationId, outlineId }).commandBus;

  return (
    <EditorThemeProvider>
      {/* 
        We need to access state inside providers, so we create an inner component 
        or use hooks inside the children. 
        However, for this refactor, we can wrap the main content.
      */}
      <EditorContent 
        presentationId={presentationId}
        outlineId={outlineId}
      />
    </EditorThemeProvider>
  );
};

// Separate component to consume the Theme context
const EditorContent = ({ presentationId, outlineId }: { presentationId: string, outlineId: string | null }) => {
  const {
    slides,
    commandBus, // exposing commandBus from hook for the provider
    // Actions
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleAddSlide,
    handleDeleteSlide,
    // Loading state
    isLoadingPresentation,
    isGeneratingSlides,
    slideGenerationProgress,
    slideGenerationSpeed,
  } = useEditorPage({ presentationId, outlineId });

  const theme = useEditorTheme();
  const presentation = useAppSelector(selectPresentation);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const isDark = theme.themeType === "dark";

  // Enable undo/redo keyboard shortcuts (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z)
  useUndoRedoKeyboardShortcuts();

  // Presentation mode hook
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

      <EditorHeader onPresentClick={startPresentation} />
      
      <EditorBackground theme={theme} />

      {/* Scrollable content container */}
      <div className="min-h-screen overflow-y-auto pt-16 relative">
        <SlideNavigator
          slides={slides.filter(
            (slide) => slide && slide.rows && Array.isArray(slide.rows)
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

        <div className="w-full mx-auto px-6 py-10 pr-16">
          <EditorDndProvider slides={slides} commandBus={commandBus}>
            <BlockSelectionProvider>
              <ToolbarPanel presentationId={presentationId} />

              <div className="flex flex-col gap-16">
                {slides
                  .filter(
                    (slide) => slide && slide.rows && Array.isArray(slide.rows)
                  )
                  .map((slide, index) => (
                    <motion.div
                      key={slide.id}
                      data-slide-id={slide.id}
                      data-slide-index={index}
                      className="relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <div
                        className="absolute -left-12 top-6 text-xs font-medium opacity-40"
                        style={{ color: theme.bodyColor }}
                      >
                        {index + 1}
                      </div>
                      
                      <SlideCanvas
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
            </BlockSelectionProvider>
            
            <DragOverlayWrapper />
          </EditorDndProvider>
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

// Separated DragOverlay to use the context
const DragOverlayWrapper = () => {
  const { activeBlock, isDragging, draggingBlockType } = useEditorDndContext();
  const theme = useEditorTheme();
  
  return (
    <DragOverlay
      dropAnimation={{
        duration: 200,
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
      }}
    >
      {activeBlock && (
        <DragPreview block={activeBlock} theme={theme} />
      )}
      {isDragging && draggingBlockType && (
        <DragPreview blockType={draggingBlockType} theme={theme} />
      )}
    </DragOverlay>
  );
};

export default PresentationEditorPage;
