"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface UsePresentationModeProps {
  slidesCount: number;
}

interface UsePresentationModeReturn {
  isPresenting: boolean;
  currentSlideIndex: number;
  presentationContainerRef: React.RefObject<HTMLDivElement | null>;
  startPresentation: () => void;
  stopPresentation: () => void;
  goToNextSlide: () => void;
  goToPrevSlide: () => void;
  setCurrentSlideIndex: React.Dispatch<React.SetStateAction<number>>;
}

/**
 * Custom hook to manage presentation mode state and navigation.
 * Handles keyboard navigation, smart scrolling within slides, and slide transitions.
 */
export function usePresentationMode({
  slidesCount,
}: UsePresentationModeProps): UsePresentationModeReturn {
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const presentationContainerRef = useRef<HTMLDivElement>(null);

  const startPresentation = useCallback(() => {
    setIsPresenting(true);
    setCurrentSlideIndex(0);
  }, []);

  const stopPresentation = useCallback(() => {
    setIsPresenting(false);
  }, []);

  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, slidesCount - 1));
  }, [slidesCount]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  // Lock body scroll during presentation
  useEffect(() => {
    if (isPresenting) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isPresenting]);

  // Reset scroll position on slide change
  useEffect(() => {
    if (presentationContainerRef.current) {
      presentationContainerRef.current.scrollTop = 0;
    }
  }, [currentSlideIndex]);

  // Keyboard navigation for presentation mode with smart scrolling
  useEffect(() => {
    if (!isPresenting) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const container = presentationContainerRef.current;
      if (!container) return;

      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.min(prev + 1, slidesCount - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleScrollDown(container);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScrollUp(container);
      } else if (e.key === "Escape") {
        setIsPresenting(false);
      }
    };

    const handleScrollDown = (container: HTMLDivElement) => {
      const viewportHeight = window.innerHeight;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const maxScroll = scrollHeight - viewportHeight;
      const remainingScroll = maxScroll - scrollTop;

      // If content fits in viewport OR we're truly at the bottom (less than 100px remaining), go to next slide
      if (maxScroll <= 10 || remainingScroll < 100) {
        if (currentSlideIndex < slidesCount - 1) {
          setCurrentSlideIndex((prev) => prev + 1);
        }
        return;
      }

      // Scroll 90% of viewport height (keeping 10% overlap for context)
      const idealScrollAmount = Math.floor(viewportHeight * 0.9);

      // If scrolling down would leave less than 100px at the bottom, go to maxScroll
      const targetScroll =
        remainingScroll - idealScrollAmount < 100
          ? maxScroll
          : scrollTop + idealScrollAmount;

      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    };

    const handleScrollUp = (container: HTMLDivElement) => {
      const viewportHeight = window.innerHeight;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const maxScroll = scrollHeight - viewportHeight;

      // If we're at the top (less than 100px scrolled), go to previous slide
      if (maxScroll <= 10 || scrollTop < 100) {
        if (currentSlideIndex > 0) {
          setCurrentSlideIndex((prev) => prev - 1);
          // Scroll to bottom of previous slide after transition
          setTimeout(() => {
            const newContainer = presentationContainerRef.current;
            if (newContainer) {
              const newMaxScroll =
                newContainer.scrollHeight - window.innerHeight;
              if (newMaxScroll > 10) {
                newContainer.scrollTo({
                  top: newMaxScroll,
                  behavior: "smooth",
                });
              }
            }
          }, 150);
        }
        return;
      }

      // Scroll 90% of viewport height (keeping 10% overlap for context)
      const idealScrollAmount = Math.floor(viewportHeight * 0.9);

      // If scrolling up would leave less than 100px at the top, just go to 0
      const targetScroll =
        scrollTop - idealScrollAmount < 100 ? 0 : scrollTop - idealScrollAmount;

      container.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresenting, slidesCount, currentSlideIndex]);

  return {
    isPresenting,
    currentSlideIndex,
    presentationContainerRef,
    startPresentation,
    stopPresentation,
    goToNextSlide,
    goToPrevSlide,
    setCurrentSlideIndex,
  };
}
