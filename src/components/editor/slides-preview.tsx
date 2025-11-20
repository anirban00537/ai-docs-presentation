"use client";

import React from "react";
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

export const SlidesPreview = () => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();

  const handleSlideClick = (slideId: string) => {
    dispatch(setActiveSlide(slideId));
  };

  const handleAddSlide = () => {
    dispatch(addSlide());
  };

  return (
    <div className="border-r border-border/50 bg-background/80 backdrop-blur-sm flex flex-col">
      <div className="p-3 border-b border-border/50">
        <button
          onClick={handleAddSlide}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-3 py-2.5",
            "rounded-lg border border-border/50 bg-background/50",
            "hover:bg-background hover:border-border hover:shadow-sm",
            "transition-all duration-200 group",
            "text-sm font-medium text-foreground/80 hover:text-foreground"
          )}
        >
          <Plus className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
          <span>Add Slide</span>
        </button>
      </div>
      <div
        className="flex flex-col gap-2 p-2 overflow-y-auto flex-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "var(--border) transparent",
        }}
      >
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          return (
            <button
              key={slide.id}
              onClick={() => handleSlideClick(slide.id)}
              className={cn(
                "group relative shrink-0 transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg"
              )}
            >
              <div
                className={cn(
                  "relative overflow-hidden rounded-md transition-all duration-200",
                  "shadow-sm hover:shadow-md",
                  isActive
                    ? "border-2 border-primary shadow-md shadow-primary/20 scale-105"
                    : "border border-border/50 hover:border-border"
                )}
                style={{
                  width: "140px",
                  height: "78px",
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                  <Slide
                    slide={slide}
                    selectedId={null}
                    editingId={null}
                    liveOverrides={{}}
                    onSelectWidget={() => {}}
                    onSetLiveOverride={() => {}}
                    onClearLiveOverride={() => {}}
                    scale={0.11}
                  />
                </div>
                {isActive && (
                  <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                )}
                <div
                  className={cn(
                    "absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background/95 to-transparent",
                    "flex items-center justify-center"
                  )}
                >
                  <span
                    className={cn(
                      "text-[9px] font-medium px-1.5 py-0.5 rounded",
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    )}
                  >
                    {index + 1}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
