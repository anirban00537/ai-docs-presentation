"use client";

import React, { useEffect, useRef } from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectSlides,
  selectActiveSlideId,
  setActiveSlide,
  addSlide,
} from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <div className="w-48 h-full flex flex-col border-r border-border/40 bg-muted/10 backdrop-blur-xl fixed left-0 top-0 bottom-0">
      {/* Header / Toolbar */}
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border/40 bg-background/50 backdrop-blur-md z-10 shrink-0">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Slides
        </span>
        <button
          onClick={handleAddSlide}
          className={cn(
            "p-1 rounded-md transition-all duration-200",
            "hover:bg-primary/10 hover:text-primary active:scale-95",
            "text-muted-foreground"
          )}
          title="Add New Slide"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
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
                    "relative flex-1 aspect-video rounded-md overflow-hidden transition-all duration-200 outline-none",
                    "ring-1 ring-border/50 shadow-sm",
                    isActive
                      ? "ring-2 ring-primary shadow-md scale-[1.02]"
                      : "hover:ring-primary/40 hover:shadow-md hover:scale-[1.01]"
                  )}
                >
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
                        scale={0.15}
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
