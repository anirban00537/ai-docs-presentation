"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
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

  // Animation variants for slide transitions
  const slideVariants = {
    enter: (direction: SlideDirection) => ({
      x: direction === "next" ? "100%" : direction === "prev" ? "-100%" : 0,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: SlideDirection) => ({
      x: direction === "next" ? "-100%" : direction === "prev" ? "100%" : 0,
      opacity: 0,
      scale: 0.95,
    }),
  };

  const slideTransition = {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  };

  const currentSlide = slides[currentIndex];
  const isFirstSlide = currentIndex === 0;
  const isLastSlide = currentIndex === slides.length - 1;
  const progressPercentage = ((currentIndex + 1) / slides.length) * 100;

  const backgroundColor = useMemo(() => {
    // Use surface color from globalTheme as the main background
    return globalTheme?.surface ?? "#0f172a";
  }, [globalTheme]);

  const primaryColor = useMemo(() => {
    // Use accent color from globalTheme as the primary color
    return globalTheme?.accent ?? "#8b5cf6";
  }, [globalTheme]);

  const goToNext = useCallback(() => {
    if (!isLastSlide && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection("next");
      previousIndexRef.current = currentIndex;
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }
  }, [isLastSlide, isTransitioning, currentIndex]);

  const goToPrevious = useCallback(() => {
    if (!isFirstSlide && !isTransitioning) {
      setIsTransitioning(true);
      setSlideDirection("prev");
      previousIndexRef.current = currentIndex;
      setCurrentIndex((prev) => prev - 1);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }
  }, [isFirstSlide, isTransitioning, currentIndex]);

  const goToSlide = useCallback(
    (index: number) => {
      if (index !== currentIndex && !isTransitioning) {
        setIsTransitioning(true);
        setSlideDirection(index > currentIndex ? "next" : "prev");
        previousIndexRef.current = currentIndex;
        setCurrentIndex(index);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 600);
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
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden"
      style={{
        backgroundColor: backgroundColor,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Vertical Progress Bar - Left Side */}
      <div className="absolute left-0 top-0 bottom-0 w-1 z-50 flex flex-col items-center justify-center">
        <div
          className={cn(
            "w-full h-full relative overflow-hidden rounded-full",
            isDarkTheme ? "bg-white/10" : "bg-black/10"
          )}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 rounded-full"
            style={{
              backgroundColor: primaryColor,
              boxShadow: isDarkTheme
                ? `0 0 20px ${primaryColor}80`
                : `0 0 10px ${primaryColor}40`,
            }}
            initial={{ height: 0 }}
            animate={{ height: `${progressPercentage}%` }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white/20 blur-sm"
            initial={{ height: 0 }}
            animate={{ height: `${progressPercentage}%` }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
          />
        </div>
      </div>

      {/* Slide Indicators - Left Side */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => goToSlide(index)}
            className="relative focus:outline-none"
            disabled={isTransitioning}
            aria-label={`Go to slide ${index + 1}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <motion.div
              className="rounded-full"
              style={{
                backgroundColor:
                  index === currentIndex
                    ? primaryColor
                    : isDarkTheme
                    ? "rgba(255, 255, 255, 0.3)"
                    : "rgba(0, 0, 0, 0.2)",
                boxShadow:
                  index === currentIndex
                    ? `0 0 10px ${primaryColor}80`
                    : undefined,
              }}
              animate={{
                width: index === currentIndex ? 12 : 8,
                height: index === currentIndex ? 12 : 8,
                scale: index === currentIndex ? 1.25 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            />
            {index === currentIndex && (
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  backgroundColor: isDarkTheme
                    ? "rgba(255, 255, 255, 0.4)"
                    : "rgba(0, 0, 0, 0.4)",
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.button>
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
          className="relative w-full h-full max-w-[95vw] max-h-[95vh]"
        >
          {/* Current Slide with Smooth Framer Motion Transitions */}
          <AnimatePresence mode="wait" custom={slideDirection}>
            <motion.div
              key={currentIndex}
              custom={slideDirection}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={slideTransition}
              className="absolute inset-0"
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
            </motion.div>
          </AnimatePresence>
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
    </motion.div>
  );
};
