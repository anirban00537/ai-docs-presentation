"use client";

import React, { useState, useEffect, useRef } from "react";

import { useSearchParams, useParams } from "next/navigation";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { DndContext, DragOverlay } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  SlideCard,
  SlidesSidebar,
  PresentationTopBar,
} from "@/app/(protected)/presentation/[id]/editor";
import { BlockFocusProvider } from "@/app/(protected)/presentation/[id]/editor/BlockFocusContext";
import { LoadingScreen } from "@/app/(protected)/presentation/[id]/editor/LoadingScreen";
import { useEditorPage } from "./hooks/useEditorPage";
import { useAppSelector } from "@/store/hooks";
import { selectPresentation, selectActiveSlideId } from "@/store/slices/slidesSlice";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconTimeline,
  IconChevronLeft,
  IconChevronRight,
  IconX,
} from "@tabler/icons-react";
import { FloatingSidebar } from "./editor/FloatingSidebar";
import { useUndoRedoKeyboardShortcuts } from "@/hooks/useUndoRedo";

// Block type icon mapping
const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case "number-card":
      return <IconHash size={16} />;
    case "testimonial":
      return <IconMessageCircle size={16} />;
    case "cta":
      return <IconTarget size={16} />;
    case "quote":
      return <IconQuote size={16} />;
    case "timeline":
      return <IconTimeline size={16} />;
    default:
      return <IconFileText size={16} />;
  }
};

const getBlockTypeLabel = (type: string) => {
  switch (type) {
    case "number-card":
      return "Number Card";
    case "testimonial":
      return "Testimonial";
    case "cta":
      return "CTA Banner";
    case "quote":
      return "Quote";
    case "timeline":
      return "Timeline";
    case "prosemirror":
      return "Text Block";
    default:
      return type;
  }
};

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

  useEffect(() => {
    if (presentationContainerRef.current) {
      presentationContainerRef.current.scrollTop = 0;
    }
  }, [currentSlideIndex]);

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

  // Only show loading screen during initial presentation load (not during streaming)
  // During streaming, show slides as they come in
  const showLoading = isLoadingPresentation && !isGeneratingSlides;

  if (showLoading) {
    return (
      <>
        <GoogleFontsLoader />
        <LoadingScreen 
          isGenerating={false} 
          progress={null} 
        />
      </>
    );
  }


  return (
    <>
      <GoogleFontsLoader />

      {/* Presentation Mode Overlay */}
      <AnimatePresence>
        {isPresenting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            ref={presentationContainerRef}
            className="fixed inset-0 z-[100] overflow-y-auto"
            style={{
              backgroundColor: theme.pageBackground,
            }}
          >
            {/* Minimal gradient overlay */}
            <div
              className="fixed inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 50% 0%, ${theme.primary}08 0%, transparent 50%)`,
              }}
            />

            {/* Minimal Navigation Controls */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl"
                style={{
                  backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)",
                }}
              >
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentSlideIndex === 0}
                  className="p-1.5 rounded-full transition-all disabled:opacity-30"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  <IconChevronLeft size={18} />
                </button>
                
                <span
                  className="text-sm font-medium tabular-nums min-w-[3rem] text-center"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  {currentSlideIndex + 1} / {slides.length}
                </span>
                
                <button
                  onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, slides.length - 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="p-1.5 rounded-full transition-all disabled:opacity-30"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  <IconChevronRight size={18} />
                </button>

                <div
                  className="w-px h-4 mx-1"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)" }}
                />

                <button
                  onClick={() => setIsPresenting(false)}
                  className="p-1.5 rounded-full transition-all hover:opacity-70"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  <IconX size={18} />
                </button>
              </motion.div>
            </div>

            {/* Current Slide */}
            <div
              className="min-h-screen w-full flex items-center justify-center p-8"
              style={{ fontFamily: `${theme.fontFamily}, sans-serif` }}
            >
              <AnimatePresence mode="wait">
                {slides[currentSlideIndex] && (
                  <motion.div
                    key={currentSlideIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                  >
                    <SlideCard
                      slide={slides[currentSlideIndex]}
                      onUpdateBlock={handleUpdateBlock}
                      onDeleteRow={handleDeleteRow}
                      onAddColumn={handleAddColumn}
                      onAddRowAtTop={handleAddRowAtTop}
                      onAddRowAtBottom={handleAddRowAtBottom}
                      onUpdateColumnWidths={handleUpdateColumnWidths}
                      enableDragHints={false}
                      readOnly={true}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                
                {/* Generating indicator - shows during streaming */}
                {isGeneratingSlides && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-3 py-8"
                  >
                    <div 
                      className="w-5 h-5 border-2 rounded-full animate-spin"
                      style={{ 
                        borderColor: `${theme.primary}30`,
                        borderTopColor: theme.primary 
                      }}
                    />
                    <span 
                      className="text-sm font-medium"
                      style={{ color: theme.bodyColor }}
                    >
                      {slideGenerationProgress 
                        ? `Generating slide ${slideGenerationProgress.current} of ${slideGenerationProgress.total}...`
                        : "Generating slides..."}
                    </span>
                  </motion.div>
                )}
              </div>
            </BlockFocusProvider>

            {/* Minimal Drag Overlay */}
            <DragOverlay
              dropAnimation={{
                duration: 200,
                easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
              }}
            >
              {activeBlock && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0.8 }}
                  animate={{ scale: 1, opacity: 0.95 }}
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(30, 30, 35, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    maxWidth: "280px",
                  }}
                >
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: `${theme.primary}15`,
                        color: theme.primary,
                      }}
                    >
                      {getBlockTypeIcon(activeBlock.type || "prosemirror")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
                      >
                        {getBlockTypeLabel(activeBlock.type || "prosemirror")}
                      </div>
                    </div>
                  </div>
                  {/* Subtle accent line */}
                  <div
                    className="h-0.5 w-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                </motion.div>
              )}
              {isBlockDragging && draggingBlockType && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.95 }}
                  className="rounded-lg overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(30, 30, 35, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div className="px-3 py-2.5 flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-md flex items-center justify-center"
                      style={{
                        backgroundColor: `${theme.primary}15`,
                        color: theme.primary,
                      }}
                    >
                      {getBlockTypeIcon(draggingBlockType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-medium"
                        style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
                      >
                        {getBlockTypeLabel(draggingBlockType)}
                      </div>
                    </div>
                  </div>
                  <div
                    className="h-0.5 w-full"
                    style={{ backgroundColor: theme.primary }}
                  />
                </motion.div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  );
};

export default GammaPage;
