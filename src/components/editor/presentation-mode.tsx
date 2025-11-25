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

  const meshBackground = useMemo(() => {
    const backgroundStops =
      globalTheme?.background && globalTheme.background.length > 0
        ? globalTheme.background
        : ["#0f172a", "#1e293b", "#111827"];
    const surfaceColor = globalTheme?.surface ?? "rgba(15,23,42,0.92)";
    const accentColor = globalTheme?.accent ?? "#6366f1";

    const baseGradient =
      backgroundStops.length === 1
        ? `linear-gradient(135deg, ${backgroundStops[0]}, ${backgroundStops[0]})`
        : `linear-gradient(135deg, ${backgroundStops.join(", ")})`;

    return [
      baseGradient,
      `radial-gradient(at 25% 25%, ${surfaceColor} 0%, transparent 55%)`,
      `radial-gradient(at 70% 65%, ${surfaceColor} 0%, transparent 60%)`,
      `radial-gradient(at 85% 20%, ${accentColor} 0%, transparent 45%)`,
      `radial-gradient(at 15% 80%, ${accentColor}33 0%, transparent 50%)`,
    ].join(", ");
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

  return (
    <div
      className={cn(
        "fixed inset-0 z-9999 transition-opacity duration-200",
        isExiting ? "opacity-0" : "opacity-100"
      )}
      style={{
        backgroundImage: meshBackground,
      }}
    >
      {/* Exit Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all"
        onClick={handleExit}
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Slide Counter */}
      <div className="absolute top-4 left-4 z-50 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-sm">
        {currentIndex + 1} / {slides.length}
      </div>

      {/* Main Slide Area */}
      <div className="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-10 sm:py-10 md:px-16 md:py-12">
        <div
          className={cn(
            "w-full h-full transition-transform duration-300",
            isExiting && "scale-95"
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
            theme={globalTheme}
            showSnapLines={false}
            padding={0}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all",
            isFirstSlide && "opacity-30 cursor-not-allowed"
          )}
          onClick={goToPrevious}
          disabled={isFirstSlide}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-white"
                  : "w-2 bg-white/40 hover:bg-white/60"
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
            "h-12 w-12 rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm transition-all",
            isLastSlide && "opacity-30 cursor-not-allowed"
          )}
          onClick={goToNext}
          disabled={isLastSlide}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Click areas for navigation */}
      <button
        className="absolute left-0 top-0 bottom-0 w-1/3 cursor-w-resize focus:outline-none"
        onClick={goToPrevious}
        disabled={isFirstSlide}
        aria-label="Previous slide"
      />
      <button
        className="absolute right-0 top-0 bottom-0 w-1/3 cursor-e-resize focus:outline-none"
        onClick={goToNext}
        disabled={isLastSlide}
        aria-label="Next slide"
      />
    </div>
  );
};
