"use client";

import { useEffect, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectSlides, selectTheme, Slide } from "@/store/slices/slidesSlice";
import { useUpdateSlide, useUpdatePresentation, useReorderSlides } from "@/hooks/use-presentation";
import { convertReduxSlideToApi } from "@/lib/editor/adapters";

/**
 * Hook to automatically sync Redux state changes to the backend.
 * Replaces the slidesApiMiddleware with a cleaner, React-native implementation.
 */
export function useEditorSync(presentationId: string | null) {
  const slides = useAppSelector(selectSlides);
  const theme = useAppSelector(selectTheme);
  
  const updateSlideMutation = useUpdateSlide();
  const updatePresentationMutation = useUpdatePresentation();
  const reorderSlidesMutation = useReorderSlides();
  
  const prevSlidesRef = useRef<Slide[]>([]);
  const prevThemeRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!presentationId || slides.length === 0) return;

    // Detect what changed
    const changedSlides = slides.filter(slide => {
      const prev = prevSlidesRef.current.find(ps => ps.id === slide.id);
      if (!prev) return false; // Creation is handled by separate actions
      return JSON.stringify(prev) !== JSON.stringify(slide);
    });

    const themeChanged = JSON.stringify(prevThemeRef.current) !== JSON.stringify(theme);

    // Detect reordering
    const slidesReordered = slides.length > 0 && 
      prevSlidesRef.current.length === slides.length && 
      slides.some((s, i) => prevSlidesRef.current[i] && s.id !== prevSlidesRef.current[i].id);

    if (changedSlides.length > 0 || themeChanged || slidesReordered) {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      debounceTimerRef.current = setTimeout(async () => {
        // Sync slides content
        for (const slide of changedSlides) {
          const apiData = convertReduxSlideToApi(slide);
          updateSlideMutation.mutate({
            presentationId,
            slideId: slide.id,
            payload: apiData,
          });
        }

        // Sync reordering
        if (slidesReordered) {
          const slideOrders = slides.map((s, i) => ({ slideId: s.id, order: i }));
          reorderSlidesMutation.mutate({
            presentationId,
            slideOrders,
          });
        }

        // Sync theme
        if (themeChanged) {
          updatePresentationMutation.mutate({
            id: presentationId,
            payload: { globalTheme: theme },
          });
        }

        // Update refs
        prevSlidesRef.current = JSON.parse(JSON.stringify(slides));
        prevThemeRef.current = JSON.parse(JSON.stringify(theme));
      }, 1000);
    }

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [slides, theme, presentationId, updateSlideMutation, updatePresentationMutation]);

  // Initial ref set
  useEffect(() => {
    if (slides.length > 0 && prevSlidesRef.current.length === 0) {
      prevSlidesRef.current = JSON.parse(JSON.stringify(slides));
    }
    if (theme && !prevThemeRef.current) {
      prevThemeRef.current = JSON.parse(JSON.stringify(theme));
    }
  }, [slides, theme]);
}
