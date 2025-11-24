"use client";

import React, { useEffect, useRef } from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectSlides,
  selectActiveSlideId,
  selectGlobalTheme,
  setActiveSlide,
  addSlide,
  removeSlide,
} from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import {
  EditorSidebarShell,
  useEditorSidebar,
} from "@/components/editor/editor-sidebar-shell";

export const LeftSidebar = () => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { collapsed } = useEditorSidebar();

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
    <EditorSidebarShell>
      <div
        className={cn(
          "border-b border-border/50 p-4 pb-3 transition-all duration-200",
          collapsed && "px-2"
        )}
      >
        <Button
          onClick={handleAddSlide}
          variant="default"
          className={cn(
            "w-full gap-2.5 h-11 px-4 bg-primary shadow-md hover:shadow-lg border-0 hover:bg-primary/95 hover:text-primary-foreground transition-all duration-200 active:scale-[0.98] group justify-center",
            collapsed && "px-0"
          )}
        >
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-foreground/15 text-primary-foreground group-hover:bg-primary-foreground/25 transition-colors duration-200">
            <Plus className="w-4 h-4" />
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-primary-foreground transition-colors tracking-tight whitespace-nowrap">
              New Slide
            </span>
          )}
        </Button>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          "slides-scroll-container flex-1 overflow-y-auto py-3 px-4 space-y-3 transition-all duration-200",
          collapsed && "px-2"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          .slides-scroll-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <AnimatePresence initial={false} mode="popLayout">
          {slides.map((slide) => {
            const isActive = slide.id === activeSlideId;
            return (
              <motion.div
                key={slide.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="group relative flex items-center"
                data-slide-id={slide.id}
              >
                {/* Slide Thumbnail */}
                <div
                  onClick={() => handleSlideClick(slide.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSlideClick(slide.id);
                    }
                  }}
                  className={cn(
                    "relative flex-1 aspect-video rounded-xl overflow-hidden transition-all duration-300 outline-none group/btn cursor-pointer",
                    "ring-1 shadow-md bg-background",
                    isActive
                      ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
                      : "ring-border/50 hover:ring-primary/60 hover:shadow-lg hover:scale-[1.01]",
                    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  )}
                >
                  {/* Delete button */}
                  {slides.length > 1 && (
                    <div
                      className={cn(
                        "absolute right-2 top-2 z-20 opacity-0 transition-all duration-200 transform translate-y-1 scale-95",
                        "group-hover/btn:opacity-100 group-hover/btn:translate-y-0 group-hover/btn:scale-100"
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(removeSlide(slide.id));
                        }}
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-background/95 backdrop-blur-sm text-muted-foreground shadow-lg ring-1 ring-border/60 hover:bg-destructive hover:text-destructive-foreground hover:ring-destructive transition-all duration-200 active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Slide Content Preview */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <Slide
                        slide={slide}
                        selectedId={null}
                        editingId={null}
                        liveOverrides={{}}
                        onSelectWidget={() => {}}
                        onSetLiveOverride={() => {}}
                        onClearLiveOverride={() => {}}
                        theme={globalTheme}
                        padding={0}
                        showSnapLines={false}
                      />
                    </div>
                  </div>

                  {/* Active Overlay */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-background/5 group-hover/btn:bg-transparent transition-colors duration-300" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </EditorSidebarShell>
  );
};
