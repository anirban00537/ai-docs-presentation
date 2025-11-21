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
      className="w-48 h-full flex flex-col border-r bg-muted border-border/40 backdrop-blur-xl fixed left-0 top-0 bottom-0"
      onWheel={handleWheel}
    >
      {/* Header / Toolbar */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b bg-muted border-border/40 backdrop-blur-md z-10 shrink-0">
        <Button
          onClick={handleAddSlide}
          variant="outline"
          size="sm"
          className="text-[10px] w-full h-7 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border-primary/10"
        >
          <Plus className="h-3 w-3 text-primary" />
          New Slide
        </Button>
      </div>

      {/* Slides List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto py-3 px-2 space-y-2.5"
        style={{
          scrollbarWidth: "none", // Hide scrollbar for cleaner look
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          div::-webkit-scrollbar {
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
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 group"
                data-slide-id={slide.id}
              >
                {/* Slide Number */}
                <div className="pt-1.5 w-4 flex justify-end">
                  <span
                    className={cn(
                      "text-[9px] font-medium transition-colors duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground/50 group-hover:text-muted-foreground"
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
                    "ring-1 ring-border/50 shadow-sm",
                    isActive
                      ? "ring-2 ring-primary shadow-md scale-[1.02]"
                      : "hover:ring-primary/40 hover:shadow-md hover:scale-[1.01]"
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
                      className="absolute right-1.5 top-1.5 z-20 h-5 w-5 rounded-full bg-background/90 text-destructive opacity-0 shadow-sm ring-1 ring-border/60 transition-opacity hover:bg-destructive hover:text-destructive-foreground hover:ring-destructive group-hover:opacity-100"
                    >
                      <span className="block text-[9px] leading-none font-medium">
                        ×
                      </span>
                    </button>
                  )}

                  {/* Slide Content Preview */}
                  <div className="absolute inset-0 bg-background pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-900">
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
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
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
