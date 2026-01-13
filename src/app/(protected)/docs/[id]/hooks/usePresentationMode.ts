"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface UsePresentationModeProps {
  slidesCount: number;
  slides: Array<{ id: string }>;
  presentationId: string;
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
 * Handles keyboard navigation, smart scrolling within slides, slide transitions, and URL synchronization.
 */
export function usePresentationMode({
  slidesCount,
  slides,
  presentationId,
}: UsePresentationModeProps): UsePresentationModeReturn {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const presentationContainerRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  /**
   * Update URL with presentation mode parameters
   */
  const updateUrl = useCallback(
    (slideIndex: number, isPresenting: boolean) => {
      if (isPresenting && slides[slideIndex]) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('mode', 'present');
        params.set('slideId', slides[slideIndex].id);
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('mode');
        params.delete('slideId');
        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;
        router.replace(newUrl, { scroll: false });
      }
    },
    [router, pathname, searchParams, slides],
  );

  /**
   * Start presentation mode and update URL
   */
  const startPresentation = useCallback(() => {
    setIsPresenting(true);
    setCurrentSlideIndex(0);
    if (slides[0]) {
      updateUrl(0, true);
    }
  }, [slides, updateUrl]);

  /**
   * Stop presentation mode and clean URL
   */
  const stopPresentation = useCallback(() => {
    setIsPresenting(false);
    updateUrl(0, false);
  }, [updateUrl]);

  /**
   * Navigate to next slide and update URL
   */
  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      const nextIndex = Math.min(prev + 1, slidesCount - 1);
      if (isPresenting && slides[nextIndex]) {
        updateUrl(nextIndex, true);
      }
      return nextIndex;
    });
  }, [slidesCount, slides, isPresenting, updateUrl]);

  /**
   * Navigate to previous slide and update URL
   */
  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      const prevIndex = Math.max(prev - 1, 0);
      if (isPresenting && slides[prevIndex]) {
        updateUrl(prevIndex, true);
      }
      return prevIndex;
    });
  }, [slides, isPresenting, updateUrl]);

  /**
   * Initialize presentation mode from URL parameters
   */
  useEffect(() => {
    if (isInitializedRef.current) return;
    if (slidesCount === 0 || slides.length === 0) return;

    const mode = searchParams.get('mode');
    const slideId = searchParams.get('slideId');

    if (mode === 'present' && slideId) {
      const slideIndex = slides.findIndex((slide) => slide.id === slideId);
      if (slideIndex !== -1) {
        setIsPresenting(true);
        setCurrentSlideIndex(slideIndex);
        isInitializedRef.current = true;
      }
    }
  }, [searchParams, slides, slidesCount]);

  /**
   * Lock body scroll during presentation
   */
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
        const nextIndex = Math.min(currentSlideIndex + 1, slidesCount - 1);
        setCurrentSlideIndex(nextIndex);
        if (slides[nextIndex]) {
          updateUrl(nextIndex, true);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prevIndex = Math.max(currentSlideIndex - 1, 0);
        setCurrentSlideIndex(prevIndex);
        if (slides[prevIndex]) {
          updateUrl(prevIndex, true);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleScrollDown(container);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        handleScrollUp(container);
      } else if (e.key === "Escape") {
        stopPresentation();
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
          const nextIndex = currentSlideIndex + 1;
          setCurrentSlideIndex(nextIndex);
          if (slides[nextIndex]) {
            updateUrl(nextIndex, true);
          }
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
          const prevIndex = currentSlideIndex - 1;
          setCurrentSlideIndex(prevIndex);
          if (slides[prevIndex]) {
            updateUrl(prevIndex, true);
          }
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
  }, [isPresenting, slidesCount, currentSlideIndex, slides, updateUrl, stopPresentation]);

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
