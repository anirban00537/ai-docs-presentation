"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setSlides, Slide } from "@/store/slices/slidesSlice";
import { useGenerateAndCreateSlides } from "./use-outline";
import { toast } from "sonner";
import { nanoid } from "nanoid";

interface SlideGenerationProgress {
  current: number;
  total: number;
}

interface RowData {
  id?: string;
  columnWidths?: number[];
  blocks: BlockData[];
}

interface BlockData {
  id?: string;
  type: string;
  content: unknown;
}

interface SlideData {
  rows: RowData[];
}

interface StreamChunk {
  type: "start" | "slide-start" | "slide" | "complete" | "slide-error" | "error";
  totalSlides?: number;
  slideNumber?: number;
  slideId?: string;
  data?: SlideData;
  message?: string;
}

interface UseSlideGenerationParams {
  presentationId: string | null;
  slidesRef: React.MutableRefObject<Slide[]>;
}

/**
 * Hook for managing slide generation from outlines.
 * Handles streaming slide generation with progress tracking.
 */
export function useSlideGeneration({
  presentationId,
  slidesRef,
}: UseSlideGenerationParams) {
  const dispatch = useAppDispatch();
  const generateAndCreateSlidesMutation = useGenerateAndCreateSlides();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<SlideGenerationProgress | null>(null);
  const hasStartedGeneration = useRef(false);

  /**
   * Handles a chunk from the streaming slide generation
   */
  const handleGenerationChunk = useCallback(
    (chunk: StreamChunk) => {
      switch (chunk.type) {
        case "start":
          setProgress({
            current: 0,
            total: chunk.totalSlides || 0,
          });
          dispatch(setSlides([]));
          break;

        case "slide-start":
          setProgress({
            current: chunk.slideNumber || 0,
            total: chunk.totalSlides || 0,
          });
          break;

        case "slide":
          if (chunk.data) {
            const slide = {
              id: chunk.slideId || nanoid(),
              rows: chunk.data.rows.map((row) => ({
                id: row.id || nanoid(),
                columnWidths: row.columnWidths,
                blocks: row.blocks.map((block) => ({
                  id: block.id || nanoid(),
                  type: block.type,
                  content: block.content,
                })),
              })),
            } as Slide;
            const currentSlides = slidesRef.current;
            dispatch(setSlides([...currentSlides, slide]));
          }
          break;

        case "complete":
          setIsGenerating(false);
          setProgress(null);
          toast.success("Presentation created successfully!");
          break;

        case "slide-error":
        case "error":
          setIsGenerating(false);
          setProgress(null);
          const errorMessage = chunk.message || "Unknown error";

          // Check if it's a credit-related error
          if (
            errorMessage.toLowerCase().includes("insufficient credits") ||
            errorMessage.toLowerCase().includes("credits")
          ) {
            toast.error(errorMessage, {
              action: {
                label: "View Subscription",
                onClick: () => {
                  window.location.href = "/subscription";
                },
              },
            });
          } else {
            toast.error(`Error generating slides: ${errorMessage}`);
          }
          break;
      }
    },
    [dispatch, slidesRef]
  );

  /**
   * Start generating slides for a presentation
   */
  const startGeneration = useCallback(
    (presId: string) => {
      if (!presId) return;
      
      dispatch(setSlides([]));
      setIsGenerating(true);
      
      generateAndCreateSlidesMutation.mutate({
        presentationId: presId,
        onChunk: handleGenerationChunk,
      });
    },
    [dispatch, generateAndCreateSlidesMutation, handleGenerationChunk]
  );

  /**
   * Mark generation as started (for deduplication)
   */
  const markGenerationStarted = useCallback(() => {
    hasStartedGeneration.current = true;
  }, []);

  /**
   * Check if generation has already started
   */
  const hasStarted = useCallback(() => {
    return hasStartedGeneration.current;
  }, []);

  /**
   * Reset generation state (for component remount)
   */
  const resetGeneration = useCallback(() => {
    hasStartedGeneration.current = false;
  }, []);

  return {
    isGenerating,
    progress,
    isPending: generateAndCreateSlidesMutation.isPending,
    startGeneration,
    markGenerationStarted,
    hasStarted,
    resetGeneration,
  };
}
