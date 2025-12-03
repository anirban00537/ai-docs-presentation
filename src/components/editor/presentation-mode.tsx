"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Slide from "@/components/editor/slide";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlideModel, GlobalTheme } from "@/store/slices/slidesSlice";

type PresentationModeProps = {
  slides: SlideModel[];
  initialSlideIndex: number;
  globalTheme?: GlobalTheme;
  onExit: () => void;
};

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  initialSlideIndex,
  globalTheme,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isExiting, setIsExiting] = useState(false);

  const currentSlide = slides[currentIndex];
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;

  const backgroundColor = useMemo(() => {
    // Use surface color from globalTheme as the main background
    return globalTheme?.surface ?? "#0f172a";
  }, [globalTheme]);

  const goToNext = useCallback(() => {
    if (!isLastSlide) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [isLastSlide]);

  const goToPrevious = useCallback(() => {
    if (!isFirstSlide) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [isFirstSlide]);

  const handleExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onExit();
    }, 200);
  }, [onExit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          handleExit();
          break;
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          goToNext();
          break;
        case "ArrowLeft":
        case "PageUp":
          e.preventDefault();
          goToPrevious();
          break;
        case "Home":
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentIndex(slides.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, handleExit, slides.length]);

  if (!currentSlide) {
    return null;
  }

  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] transition-opacity duration-300 ease-out",
        isExiting ? "opacity-0" : "opacity-100"
      )}
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "absolute top-6 right-6 z-50 h-11 w-11 rounded-full transition-all duration-200",
          "backdrop-blur-md border shadow-lg",
          isDarkTheme
            ? "bg-black/40 text-white hover:bg-black/60 border-white/20 hover:border-white/30"
            : "bg-white/80 text-gray-900 hover:bg-white border-gray-200/50 hover:border-gray-300",
          "hover:scale-105 active:scale-95"
        )}
        onClick={handleExit}
        aria-label="Exit presentation mode"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Slide Counter */}
      <div
        className={cn(
          "absolute top-6 left-6 z-50 px-4 py-2 rounded-full text-sm font-semibold",
          "backdrop-blur-md border shadow-lg transition-all duration-200",
          isDarkTheme
            ? "bg-black/40 text-white border-white/20"
            : "bg-white/80 text-gray-900 border-gray-200/50"
        )}
      >
        <span className="tabular-nums">
          {currentIndex + 1} / {slides.length}
        </span>
      </div>

      {/* Main Slide Area */}
      <div className="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
        <div
          className={cn(
            "w-full h-full max-w-[95vw] max-h-[95vh] transition-all duration-500 ease-out",
            isExiting ? "scale-95 opacity-0" : "scale-100 opacity-100"
          )}
        >
          <Slide
            slide={currentSlide}
            selectedId={null}
            editingId={null}
            liveOverrides={{}}
            onSelectWidget={() => {}}
            onSetLiveOverride={() => {}}
            onClearLiveOverride={() => {}}
            globalTheme={globalTheme}
            showSnapLines={false}
            padding={0}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-4 py-3 rounded-full backdrop-blur-md border shadow-xl transition-all duration-200"
        style={{
          backgroundColor: isDarkTheme ? "rgba(0, 0, 0, 0.4)" : "rgba(255, 255, 255, 0.8)",
          borderColor: isDarkTheme ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-11 w-11 rounded-full transition-all duration-200",
            "hover:scale-110 active:scale-95",
            isFirstSlide && "opacity-30 cursor-not-allowed hover:scale-100",
            isDarkTheme
              ? "text-white hover:bg-white/20"
              : "text-gray-900 hover:bg-gray-200/80"
          )}
          onClick={goToPrevious}
          disabled={isFirstSlide}
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-2 px-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={cn(
                "rounded-full transition-all duration-300 ease-out",
                "hover:scale-110 active:scale-95",
                index === currentIndex
                  ? isDarkTheme
                    ? "w-8 h-2.5 bg-white shadow-lg"
                    : "w-8 h-2.5 bg-gray-900 shadow-lg"
                  : isDarkTheme
                  ? "w-2 h-2 bg-white/40 hover:bg-white/60"
                  : "w-2 h-2 bg-gray-400 hover:bg-gray-600"
              )}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-11 w-11 rounded-full transition-all duration-200",
            "hover:scale-110 active:scale-95",
            isLastSlide && "opacity-30 cursor-not-allowed hover:scale-100",
            isDarkTheme
              ? "text-white hover:bg-white/20"
              : "text-gray-900 hover:bg-gray-200/80"
          )}
          onClick={goToNext}
          disabled={isLastSlide}
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Click areas for navigation */}
      <button
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1/3 focus:outline-none transition-opacity duration-200",
          "hover:bg-black/5 dark:hover:bg-white/5",
          isFirstSlide && "cursor-default opacity-0"
        )}
        onClick={goToPrevious}
        disabled={isFirstSlide}
        aria-label="Previous slide"
      />
      <button
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1/3 focus:outline-none transition-opacity duration-200",
          "hover:bg-black/5 dark:hover:bg-white/5",
          isLastSlide && "cursor-default opacity-0"
        )}
        onClick={goToNext}
        disabled={isLastSlide}
        aria-label="Next slide"
      />
    </div>
  );
};
