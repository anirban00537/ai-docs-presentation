import { useEffect, useRef, useCallback } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setActiveSlide } from "@/store/slices/slidesSlice";

/**
 * Hook to detect which slide is currently visible in the viewport
 * and automatically set it as the active slide
 */
export function useSlideIntersection(
  slides: Array<{ id: string }>,
  scrollContainerRef: React.RefObject<HTMLDivElement | null>,
  isEnabled: boolean = true
) {
  const dispatch = useAppDispatch();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const slideRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());
  const isProgrammaticScrollRef = useRef(false);
  const lastActiveSlideRef = useRef<string | null>(null);
  // Store intersection ratios for each slide
  const intersectionRatiosRef = useRef<Map<string, number>>(new Map());

  // Register a slide element
  const registerSlide = useCallback(
    (slideId: string, element: HTMLDivElement | null) => {
      if (element) {
        slideRefsRef.current.set(slideId, element);
        // Immediately observe if observer is ready
        if (observerRef.current) {
          observerRef.current.observe(element);
        }
      } else {
        const existingElement = slideRefsRef.current.get(slideId);
        if (existingElement && observerRef.current) {
          observerRef.current.unobserve(existingElement);
        }
        slideRefsRef.current.delete(slideId);
        intersectionRatiosRef.current.delete(slideId);
      }
    },
    []
  );

  // Function to find the most visible slide based on stored intersection ratios
  const checkVisibleSlide = useCallback(() => {
    if (isProgrammaticScrollRef.current) {
      return;
    }

    let maxRatio = 0;
    let mostVisibleId: string | null = null;

    intersectionRatiosRef.current.forEach((ratio, id) => {
      if (ratio > maxRatio) {
        maxRatio = ratio;
        mostVisibleId = id;
      }
    });

    // Only update if we have a clear winner (e.g. > 50% visible or significantly more visible than others)
    if (mostVisibleId && mostVisibleId !== lastActiveSlideRef.current) {
      // If the ratio is very low, we might be scrolling fast or between slides,
      // but if it's the *most* visible one, it's usually the best candidate.
      // We can add a threshold if needed, e.g. ratio > 0.3
      if (maxRatio > 0.2) {
        lastActiveSlideRef.current = mostVisibleId;
        dispatch(setActiveSlide(mostVisibleId));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isEnabled || slides.length === 0 || !scrollContainerRef.current) {
      return;
    }

    const container = scrollContainerRef.current;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        // Update ratios for all changed entries
        entries.forEach((entry) => {
          // Find the slide ID for this element
          // We can't easily get the key from the value in the Map, so we rely on the data attribute
          const slideId = entry.target.getAttribute("data-slide-id");
          if (slideId) {
            intersectionRatiosRef.current.set(slideId, entry.intersectionRatio);
          }
        });

        // Check which is most visible now
        checkVisibleSlide();
      },
      {
        root: container,
        // Thresholds: check every 10% to get smooth updates
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      }
    );

    observerRef.current = observer;

    // Observe all registered slides
    slideRefsRef.current.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [slides, scrollContainerRef, isEnabled, checkVisibleSlide]);

  // Update observer when slides change (re-observe new elements if needed)
  useEffect(() => {
    if (!observerRef.current) return;

    // Re-observe all slides to ensure we track everything
    slideRefsRef.current.forEach((element) => {
      observerRef.current?.observe(element);
    });
  }, [slides]);

  // Expose function to mark programmatic scrolling
  const setProgrammaticScroll = useCallback((isProgrammatic: boolean) => {
    isProgrammaticScrollRef.current = isProgrammatic;
    // If we just finished programmatic scrolling, we might want to do a final check
    // after a small delay to sync up
    if (!isProgrammatic) {
      setTimeout(() => {
        checkVisibleSlide();
      }, 100);
    }
  }, [checkVisibleSlide]);

  return { registerSlide, setProgrammaticScroll };
}


