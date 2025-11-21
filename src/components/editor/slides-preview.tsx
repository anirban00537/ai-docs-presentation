"use client";

import React, { useEffect, useRef } from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectSlides,
  selectActiveSlideId,
  setActiveSlide,
  addSlide,
  removeSlide,
} from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SlidesPreview = () => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to active slide when it changes
  useEffect(() => {
    if (activeSlideId && scrollContainerRef.current) {
      const activeElement = scrollContainerRef.current.querySelector(
        `[data-slide-id="${activeSlideId}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeSlideId]);

  const handleSlideClick = (slideId: string) => {
    dispatch(setActiveSlide(slideId));
  };

  const handleAddSlide = () => {
    dispatch(addSlide());
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!activeSlideId || slides.length === 0) return;

    // Only react to vertical scrolling
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return;

    event.preventDefault();

    const currentIndex = slides.findIndex(
      (slide) => slide.id === activeSlideId
    );
    if (currentIndex === -1) return;

    const direction = event.deltaY > 0 ? 1 : -1; // down = next, up = previous
    const nextIndex = currentIndex + direction;

    if (nextIndex < 0 || nextIndex >= slides.length) return;

    dispatch(setActiveSlide(slides[nextIndex].id));
  };

  return (
    <div
      className="w-56 max-h-[80vh] flex flex-col border bg-linear-to-b from-background/95 via-background/90 to-background/95 border-border/60 backdrop-blur-2xl rounded-xl"
      onWheel={handleWheel}
    >
      {/* Header / Toolbar */}
      <div className="px-3.5 py-2.5 flex items-center justify-between border-b bg-linear-to-r from-background/80 via-background/60 to-background/80 border-border/60 backdrop-blur-md z-10 shrink-0">
        <div className="flex flex-col gap-0.5">
          <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-muted-foreground/70">
            Slides
          </span>
        </div>

        <Button
          onClick={handleAddSlide}
          variant="outline"
          size="icon"
          className="h-7 w-7 rounded-full border-border/70 bg-background/80 hover:bg-muted/80 hover:border-border shadow-sm"
          aria-label="Add slide"
        >
          <Plus className="h-3 w-3 text-foreground/70" />
        </Button>
      </div>

      {/* Slides List */}
      <div
        ref={scrollContainerRef}
        className="slides-scroll-container flex-1 overflow-y-auto py-3 px-2.5 space-y-2.5"
        style={{
          scrollbarWidth: "none", // Hide scrollbar for cleaner look
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          .slides-scroll-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <AnimatePresence initial={false}>
          {slides.map((slide, index) => {
            const isActive = slide.id === activeSlideId;
            return (
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="flex items-start gap-2.5 group"
                data-slide-id={slide.id}
              >
                {/* Slide Number */}
                <div className="pt-1.5 w-5 flex justify-end">
                  <span
                    className={cn(
                      "inline-flex h-4 min-w-4 items-center justify-center rounded-full text-[9px] font-medium transition-all duration-200",
                      isActive
                        ? "bg-muted/80 text-foreground shadow-[0_0_0_1px_rgba(148,163,184,0.6)]"
                        : "text-muted-foreground/60 group-hover:text-muted-foreground/80"
                    )}
                  >
                    {index + 1}
                  </span>
                </div>

                {/* Slide Thumbnail */}
                <button
                  onClick={() => handleSlideClick(slide.id)}
                  className={cn(
                    "relative flex-1 aspect-video overflow-hidden transition-all duration-200 outline-none",
                    "ring-1 ring-border/60 bg-linear-to-b from-background/95 via-background/90 to-background/95",
                    isActive
                      ? "ring-2 ring-foreground/20 scale-[1.02]"
                      : "hover:ring-foreground/15 hover:scale-[1.01]"
                  )}
                >
                  {/* Delete button (shown on hover) */}
                  {slides.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(removeSlide(slide.id));
                      }}
                      className="absolute right-2 top-2 z-20 h-5 w-5 rounded-full bg-background/95 text-destructive opacity-0 shadow-sm ring-1 ring-border/60 transition-all duration-150 hover:bg-destructive hover:text-destructive-foreground hover:ring-destructive group-hover:opacity-90 group-hover:translate-y-px"
                    >
                      <span className="block text-[9px] leading-none font-medium">
                        ×
                      </span>
                    </button>
                  )}

                  {/* Slide Content Preview */}
                  <div className="absolute inset-0 bg-linear-to-br from-muted/80 via-background/90 to-muted/60 pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-white/95 dark:bg-neutral-900/95">
                      <Slide
                        slide={slide}
                        selectedId={null}
                        editingId={null}
                        liveOverrides={{}}
                        onSelectWidget={() => {}}
                        onSetLiveOverride={() => {}}
                        onClearLiveOverride={() => {}}
                        padding={0}
                      />
                    </div>
                  </div>

                  {/* Active Overlay (Subtle) */}
                  {isActive && (
                    <div className="absolute inset-0 bg-muted/40 pointer-events-none" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
