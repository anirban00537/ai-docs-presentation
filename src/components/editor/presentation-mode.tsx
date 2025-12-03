"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Slide from "@/components/editor/slide";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlideModel, GlobalTheme } from "@/store/slices/slidesSlice";

type PresentationModeProps = {
  slides: SlideModel[];
  initialSlideIndex: number;
  globalTheme?: GlobalTheme;
  onExit: () => void;
};

type SlideDirection = "next" | "prev" | "none";

export const PresentationMode: React.FC<PresentationModeProps> = ({
  slides,
  initialSlideIndex,
  globalTheme,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [isExiting, setIsExiting] = useState(false);
  const [slideDirection, setSlideDirection] = useState<SlideDirection>("none");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const previousIndexRef = useRef(initialSlideIndex);

  const currentSlide = slides[currentIndex];
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;
  const progressPercentage = ((currentIndex + 1) / slides.length) * 100;

  const backgroundColor = useMemo(() => {
    // Use surface color from globalTheme as the main background
    return globalTheme?.surface ?? "#0f172a";
  }, [globalTheme]);

  const goToNext = useCallback(() => {
    if (!isLastSlide && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection("next");
      setTimeout(() => {
        setCurrentIndex((prev) => {
          previousIndexRef.current = prev;
          return prev + 1;
        });
        setTimeout(() => {
          setIsTransitioning(false);
          setSlideDirection("none");
        }, 50);
      }, 10);
    }
  }, [isLastSlide, isTransitioning]);

  const goToPrevious = useCallback(() => {
    if (!isFirstSlide && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection("prev");
      setTimeout(() => {
        setCurrentIndex((prev) => {
          previousIndexRef.current = prev;
          return prev - 1;
        });
        setTimeout(() => {
          setIsTransitioning(false);
          setSlideDirection("none");
        }, 50);
      }, 10);
    }
  }, [isFirstSlide, isTransitioning]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index !== currentIndex && !isTransitioning) {
        setIsTransitioning(true);
        setSlideDirection(index > currentIndex ? "next" : "prev");
        setTimeout(() => {
          previousIndexRef.current = currentIndex;
          setCurrentIndex(index);
          setTimeout(() => {
            setIsTransitioning(false);
            setSlideDirection("none");
          }, 50);
        }, 10);
      }
    },
    [currentIndex, isTransitioning]
  );

  const handleExit = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onExit();
    }, 300);
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
          goToSlide(0);
          break;
        case "End":
          e.preventDefault();
          goToSlide(slides.length - 1);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrevious, goToSlide, handleExit, slides.length]);

  if (!currentSlide) {
    return null;
  }

  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-500 ease-out",
        isExiting ? "opacity-0" : "opacity-100"
      )}
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      {/* Vertical Progress Bar - Left Side */}
      <div className="absolute left-0 top-0 bottom-0 w-1 z-50 flex flex-col items-center justify-center">
        <div
          className={cn(
            "w-full h-full relative overflow-hidden rounded-full",
            isDarkTheme ? "bg-white/10" : "bg-black/10"
          )}
        >
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out rounded-full",
              "bg-gradient-to-t from-blue-500 via-purple-500 to-pink-500",
              isDarkTheme && "shadow-[0_0_20px_rgba(147,51,234,0.5)]"
            )}
            style={{
              height: `${progressPercentage}%`,
            }}
          />
          <div
            className={cn(
              "absolute bottom-0 left-0 right-0 transition-all duration-700 ease-out",
              "bg-white/20 blur-sm"
            )}
            style={{
              height: `${progressPercentage}%`,
            }}
          />
        </div>
      </div>

      {/* Slide Indicators - Left Side */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "relative transition-all duration-300 ease-out group",
              "focus:outline-none"
            )}
            disabled={isTransitioning}
            aria-label={`Go to slide ${index + 1}`}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300 ease-out",
                index === currentIndex
                  ? isDarkTheme
                    ? "w-3 h-3 bg-white shadow-lg shadow-purple-500/50 scale-125"
                    : "w-3 h-3 bg-gray-900 shadow-lg scale-125"
                  : isDarkTheme
                  ? "bg-white/30 hover:bg-white/50 hover:scale-110"
                  : "bg-gray-400/50 hover:bg-gray-600 hover:scale-110"
              )}
            />
            {index === currentIndex && (
              <div
                className={cn(
                  "absolute inset-0 rounded-full animate-ping",
                  isDarkTheme ? "bg-white/40" : "bg-gray-900/40"
                )}
              />
            )}
          </button>
        ))}
      </div>

      {/* Top Bar - Slide Counter & Exit */}
      <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
        {/* Slide Counter */}
        <div
          className={cn(
            "px-5 py-2.5 rounded-full text-sm font-semibold backdrop-blur-xl border transition-all duration-300",
            "shadow-lg hover:shadow-xl",
            isDarkTheme
              ? "bg-black/30 text-white border-white/20 hover:bg-black/40 hover:border-white/30"
              : "bg-white/60 text-gray-900 border-gray-200/50 hover:bg-white/80 hover:border-gray-300"
          )}
        >
          <span className="tabular-nums tracking-wide">
            {currentIndex + 1}{" "}
            <span className="opacity-60">/ {slides.length}</span>
          </span>
        </div>

        {/* Exit Button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-12 w-12 rounded-full transition-all duration-300 backdrop-blur-xl border shadow-lg",
            "hover:scale-110 active:scale-95",
            isDarkTheme
              ? "bg-black/30 text-white hover:bg-black/50 border-white/20 hover:border-white/30"
              : "bg-white/60 text-gray-900 hover:bg-white/80 border-gray-200/50 hover:border-gray-300"
          )}
          onClick={handleExit}
          aria-label="Exit presentation mode"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Slide Area with Beautiful Transitions */}
      <div className="relative flex h-full w-full items-center justify-center px-4 py-6 sm:px-8 sm:py-8 md:px-12 md:py-12 lg:px-16 lg:py-16">
        <div
          ref={slideContainerRef}
          className={cn(
            "relative w-full h-full max-w-[95vw] max-h-[95vh]",
            "transition-all duration-700 ease-in-out"
          )}
        >
          {/* Current Slide with Smooth Transitions */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-700 ease-in-out",
              isTransitioning
                ? slideDirection === "next"
                  ? "-translate-x-full opacity-0 scale-95"
                  : slideDirection === "prev"
                  ? "translate-x-full opacity-0 scale-95"
                  : "translate-x-0 opacity-100 scale-100"
                : "translate-x-0 opacity-100 scale-100",
              isExiting && "scale-95 opacity-0"
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
      </div>

      {/* Click areas for navigation - Full Screen */}
      <button
        className={cn(
          "absolute left-0 top-0 bottom-0 w-1/3 focus:outline-none transition-all duration-200",
          "hover:bg-gradient-to-r from-transparent",
          isDarkTheme ? "hover:to-white/5" : "hover:to-black/5",
          isFirstSlide && "cursor-default opacity-0 pointer-events-none"
        )}
        onClick={goToPrevious}
        disabled={isFirstSlide || isTransitioning}
        aria-label="Previous slide"
      />
      <button
        className={cn(
          "absolute right-0 top-0 bottom-0 w-1/3 focus:outline-none transition-all duration-200",
          "hover:bg-gradient-to-l from-transparent",
          isDarkTheme ? "hover:to-white/5" : "hover:to-black/5",
          isLastSlide && "cursor-default opacity-0 pointer-events-none"
        )}
        onClick={goToNext}
        disabled={isLastSlide || isTransitioning}
        aria-label="Next slide"
      />
    </div>
  );
};
