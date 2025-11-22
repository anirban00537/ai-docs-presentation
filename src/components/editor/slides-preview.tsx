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
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";

export const SlidesPreview = () => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);
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
    <Sidebar
      variant="inset"
      collapsible="icon"
      className="border-r border-border/60"
    >
      <SidebarHeader className="p-4">
        <Button
          onClick={handleAddSlide}
          variant="ghost"
          className="w-full justify-center gap-2 h-11 px-3 bg-muted/50 shadow-sm border border-border/40 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
            <Plus className="w-3 h-3" />
          </div>
          <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            New Slide
          </span>
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <div
          ref={scrollContainerRef}
          className="slides-scroll-container flex-1 overflow-y-auto py-2 px-4 space-y-4"
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
                  <button
                    onClick={() => handleSlideClick(slide.id)}
                    className={cn(
                      "relative flex-1 aspect-video rounded-xl overflow-hidden transition-all duration-200 outline-none group/btn",
                      "ring-1 shadow-sm bg-background",
                      isActive
                        ? "ring-2 ring-primary shadow-md shadow-primary/10"
                        : "ring-border/40 hover:ring-primary/40 hover:shadow-md"
                    )}
                  >
                    {/* Delete button */}
                    {slides.length > 1 && (
                      <div
                        className={cn(
                          "absolute right-1.5 top-1.5 z-20 opacity-0 transition-all duration-200 transform translate-y-1",
                          "group-hover/btn:opacity-100 group-hover/btn:translate-y-0"
                        )}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(removeSlide(slide.id));
                          }}
                          className="h-6 w-6 flex items-center justify-center rounded-full bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border/50 hover:bg-destructive hover:text-destructive-foreground hover:ring-destructive transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
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
                        />
                      </div>
                    </div>

                    {/* Active Overlay */}
                    {!isActive && (
                      <div className="absolute inset-0 bg-background/10 group-hover/btn:bg-transparent transition-colors duration-300" />
                    )}
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};
