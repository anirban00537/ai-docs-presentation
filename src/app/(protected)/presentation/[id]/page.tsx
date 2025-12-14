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
} from "@/app/(protected)/presentation/[id]/editor";
import { BlockFocusProvider } from "@/app/(protected)/presentation/[id]/editor/BlockFocusContext";
import { useEditorPage } from "./hooks/useEditorPage";
import { useAppSelector } from "@/store/hooks";
import { selectPresentation } from "@/store/slices/slidesSlice";
import { Button } from "@/components/ui/button";
import { IconDownload, IconLoader2 } from "@tabler/icons-react";
import {
  IconFileText,
  IconHash,
  IconMessageCircle,
  IconTarget,
  IconQuote,
  IconTimeline,
  IconGripVertical,
} from "@tabler/icons-react";
import { FloatingSidebar } from "./editor/FloatingSidebar";

// Block type icon mapping
const getBlockTypeIcon = (type: string) => {
  switch (type) {
    case "number-card":
      return <IconHash size={18} />;
    case "testimonial":
      return <IconMessageCircle size={18} />;
    case "cta":
      return <IconTarget size={18} />;
    case "quote":
      return <IconQuote size={18} />;
    case "timeline":
      return <IconTimeline size={18} />;
    default:
      return <IconFileText size={18} />;
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
  } = useEditorPage({ presentationId, outlineId });

  const presentation = useAppSelector(selectPresentation);

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
      if (e.key === "ArrowRight" || e.key === "Space") {
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

  return (
    <>
      <GoogleFontsLoader />

      {/* Presentation Mode Overlay */}
      {isPresenting && (
        <div
          ref={presentationContainerRef}
          className="fixed inset-0 z-[100] overflow-y-auto bg-black text-white"
        >
          {/* Slide Content Container */}
          <div
            className="min-h-screen w-full flex flex-col items-center justify-center py-10"
            style={{
              backgroundColor: theme.pageBackground,
              backgroundImage: `radial-gradient(circle at 20% 18%, ${theme.primary}14, transparent 32%), radial-gradient(circle at 80% 12%, ${theme.primary}10, transparent 28%)`,
              backgroundAttachment: "fixed",
              fontFamily: `${theme.fontFamily}, sans-serif`,
            }}
          >
            {/* Navigation Controls (Floating) */}
            <div className="fixed bottom-8 right-8 flex gap-2 z-50">
              <Button
                variant="secondary"
                size="icon"
                onClick={() =>
                  setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))
                }
                disabled={currentSlideIndex === 0}
                className="rounded-full shadow-lg bg-black/50 hover:bg-black/70 text-white border-none"
              >
                ←
              </Button>
              <span className="bg-black/50 text-white px-3 py-2 rounded-full text-sm font-medium tabular-nums shadow-lg backdrop-blur-sm">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="secondary"
                size="icon"
                onClick={() =>
                  setCurrentSlideIndex((prev) =>
                    Math.min(prev + 1, slides.length - 1)
                  )
                }
                disabled={currentSlideIndex === slides.length - 1}
                className="rounded-full shadow-lg bg-black/50 hover:bg-black/70 text-white border-none"
              >
                →
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPresenting(false)}
                className="ml-4 rounded-full shadow-lg bg-black/50 hover:bg-black/70 text-white border-none px-4"
              >
                Exit
              </Button>
            </div>

            {/* Current Slide */}
            <div className="w-full px-8 animate-in fade-in duration-300 relative">
              {slides[currentSlideIndex] && (
                <div className="transform origin-top transition-all duration-300">
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
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <PresentationTopBar onPresentClick={handlePresentClick} />
      {/* Fixed background layer */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundColor: theme.pageBackground,
          backgroundImage: `radial-gradient(circle at 20% 18%, ${theme.primary}14, transparent 32%), radial-gradient(circle at 80% 12%, ${theme.primary}10, transparent 28%)`,
          backgroundAttachment: "fixed",
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

        <div className="w-full mx-auto p-8 pr-20">
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

              <div className="flex flex-col gap-8">
                {slides
                  .filter(
                    (slide) => slide && slide.rows && Array.isArray(slide.rows)
                  )
                  .map((slide) => (
                    <div
                      key={slide.id}
                      data-slide-id={slide.id}
                      className="group relative"
                    >
                      <SlideCard
                        slide={slide}
                        onUpdateBlock={handleUpdateBlock}
                        onDeleteRow={handleDeleteRow}
                        onAddColumn={handleAddColumn}
                        onAddRowAtTop={handleAddRowAtTop}
                        onAddRowAtBottom={handleAddRowAtBottom}
                        onUpdateColumnWidths={handleUpdateColumnWidths}
                      />
                    </div>
                  ))}
              </div>
            </BlockFocusProvider>

            {/* Enhanced Drag Overlay with better ghosting */}
            <DragOverlay
              dropAnimation={{
                duration: 250,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeBlock && (
                <motion.div
                  initial={{ scale: 1, opacity: 1, rotate: 0 }}
                  animate={{ scale: 1.02, opacity: 0.95, rotate: 1 }}
                  className="rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(30, 30, 35, 0.98)"
                      : "rgba(255, 255, 255, 0.98)",
                    border: `2px solid ${theme.primary}`,
                    boxShadow: `0 20px 60px -10px rgba(0,0,0,0.3), 0 0 0 1px ${theme.primary}20`,
                    maxWidth: "320px",
                  }}
                >
                  {/* Drag ghost header */}
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                      borderBottom: `1px solid ${theme.primary}20`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: theme.primary,
                        color: "#fff",
                      }}
                    >
                      {getBlockTypeIcon(activeBlock.type || "prosemirror")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          color: isDark ? "#e5e7eb" : "#1f2937",
                        }}
                      >
                        {getBlockTypeLabel(activeBlock.type || "prosemirror")}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.5)",
                        }}
                      >
                        Drop to reposition
                      </div>
                    </div>
                    <IconGripVertical
                      size={20}
                      style={{
                        color: isDark
                          ? "rgba(255,255,255,0.4)"
                          : "rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                  {/* Animated drop indicator */}
                  <div className="h-1 w-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: theme.primary }}
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
                </motion.div>
              )}
              {isBlockDragging && draggingBlockType && (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(30, 30, 35, 0.98)"
                      : "rgba(255, 255, 255, 0.98)",
                    border: `2px solid ${theme.primary}`,
                    boxShadow: `0 20px 60px -10px rgba(0,0,0,0.3)`,
                  }}
                >
                  <div
                    className="px-4 py-3 flex items-center gap-3"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{
                        backgroundColor: theme.primary,
                        color: "#fff",
                      }}
                    >
                      {getBlockTypeIcon(draggingBlockType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className="text-sm font-semibold"
                        style={{
                          color: isDark ? "#e5e7eb" : "#1f2937",
                        }}
                      >
                        {getBlockTypeLabel(draggingBlockType)}
                      </div>
                      <div
                        className="text-xs"
                        style={{
                          color: isDark
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.5)",
                        }}
                      >
                        Drop to add block
                      </div>
                    </div>
                  </div>
                  {/* Animated shimmer */}
                  <div className="h-1 w-full overflow-hidden">
                    <motion.div
                      className="h-full"
                      style={{ backgroundColor: theme.primary }}
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </div>
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
