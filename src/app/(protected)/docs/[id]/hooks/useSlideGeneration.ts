"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { setSlides, Slide } from "@/store/slices/slidesSlice";
import { useGenerateAndCreateSlides } from "./use-outline";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { parse as parsePartialJson } from "partial-json";

interface SlideGenerationProgress {
  current: number;
  total: number;
  stage?: string;
  message?: string;
  estimatedSeconds?: number;
}

interface UseSlideGenerationParams {
  presentationId: string | null;
  slidesRef: React.MutableRefObject<Slide[]>;
}

/**
 * Hook for managing slide generation from outlines.
 * Handles streaming slide generation with progress tracking, 
 * partial JSON parsing, and auto-scrolling.
 */
export function useSlideGeneration({
  presentationId,
  slidesRef,
}: UseSlideGenerationParams) {
  const dispatch = useAppDispatch();
  const generateAndCreateSlidesMutation = useGenerateAndCreateSlides();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<SlideGenerationProgress | null>(null);
  const [generationSpeed, setGenerationSpeed] = useState(0);

  const lastContentLengthRef = useRef(0);
  const lastUpdateTimestampRef = useRef(Date.now());

  // Decay speed effect
  useEffect(() => {
    if (!isGenerating) {
        setGenerationSpeed(0);
        return;
    }
    const interval = setInterval(() => {
        const now = Date.now();
        if (now - lastUpdateTimestampRef.current > 150) {
             setGenerationSpeed(prev => Math.max(0, prev * 0.8)); 
        }
    }, 100);
    return () => clearInterval(interval);
  }, [isGenerating]);

  /**
   * Handles individual chunks from the streaming SSE
   */
  const handleGenerationChunk = useCallback(
    (chunk: any) => {
      if (chunk.type === "start") {
        setProgress({
          current: 0,
          total: chunk.totalSlides || 0,
          message: "Starting generation...",
        });
        setGenerationSpeed(0);
        lastContentLengthRef.current = 0;
        lastUpdateTimestampRef.current = Date.now();
        // dispatch(setSlides([])); // Don't clear slides to allow appending/resuming
      } 
      
      else if (chunk.type === "slide-start") {
        lastContentLengthRef.current = 0; // Reset for new slide
        setProgress({
          current: chunk.slideNumber || 0,
          total: chunk.totalSlides || progress?.total || 0,
          stage: chunk.stage,
          estimatedSeconds: chunk.estimatedSeconds,
          message: `Starting slide ${chunk.slideNumber}...`,
        });
      } 
      
      else if (chunk.type === "slide-progress") {
        setProgress(prev => ({
          current: chunk.slideNumber || prev?.current || 0,
          total: prev?.total || chunk.totalSlides || 0,
          stage: chunk.stage,
          message: chunk.message || 'Processing...',
          estimatedSeconds: prev?.estimatedSeconds,
        }));
      } 
      
      else if (chunk.type === "slide-streaming") {
        if (chunk.accumulatedText && chunk.slideNumber) {
          // Speed calc
          const now = Date.now();
          const deltaChars = chunk.accumulatedText.length - lastContentLengthRef.current;
          const timeDiff = now - lastUpdateTimestampRef.current;
          
          if (timeDiff > 0 && deltaChars >= 0) {
             const instantSpeed = (deltaChars / Math.max(timeDiff, 1)) * 1000;
             setGenerationSpeed(prev => (prev * 0.3) + (instantSpeed * 0.7));
          }
          lastContentLengthRef.current = chunk.accumulatedText.length;
          lastUpdateTimestampRef.current = now;
          
          const slideIndex = chunk.slideNumber - 1;
          const currentSlides = slidesRef.current;

          try {
            const partialData = parsePartialJson(chunk.accumulatedText);
            if (partialData && partialData.rows && Array.isArray(partialData.rows)) {
              const validRows = partialData.rows.filter((row: any) => row && (row.id || row.blocks));
              
              if (validRows.length > 0) {
                const partialSlide: Slide = {
                  id: `temp-${chunk.slideNumber}`,
                  rows: validRows.map((row: any) => ({
                    id: row.id || nanoid(),
                    columnWidths: row.columnWidths,
                    blocks: (row.blocks || [])
                      .filter((block: any) => block && block.type)
                      .map((block: any) => ({
                        id: block.id || nanoid(),
                        type: block.type,
                        content: block.content || {},
                      })),
                  })),
                  accent: partialData.accent,
                  isStreaming: true,
                } as any;
                
                const newSlides = [...currentSlides];
                if (newSlides[slideIndex]) {
                  newSlides[slideIndex] = partialSlide;
                } else {
                  newSlides.push(partialSlide);
                }
                dispatch(setSlides(newSlides));
              }
            }
          } catch (e) {
            // Partial JSON might be mid-token, ignore parse errors
          }

          setProgress(prev => ({
            ...prev!,
            message: `Building slide ${chunk.slideNumber}... (${chunk.accumulatedText?.length || 0} chars)`,
          }));
        }
      } 
      
      else if (chunk.type === "slide" && chunk.data) {
        const slide: Slide = {
          id: chunk.slideId || nanoid(),
          rows: chunk.data.rows.map((row: any) => ({
            id: row.id || nanoid(),
            columnWidths: row.columnWidths,
            blocks: row.blocks.map((block: any) => ({
              id: block.id || nanoid(),
              type: block.type,
              content: block.content,
            })),
          })),
          accent: chunk.data.accent,
        };
        const currentSlides = slidesRef.current;
        const slideIndex = chunk.slideNumber ? chunk.slideNumber - 1 : currentSlides.length;
        
        const newSlides = [...currentSlides];
        if (slideIndex < newSlides.length && newSlides[slideIndex]?.id?.startsWith('temp-')) {
          newSlides[slideIndex] = slide;
          dispatch(setSlides(newSlides));
        } else {
          dispatch(setSlides([...currentSlides, slide]));
        }
      } 
      
      else if (chunk.type === "complete") {
        setIsGenerating(false);
        setProgress(null);
        toast.success("Presentation created successfully!");
      } 
      
      else if (chunk.type === "slide-error") {
        toast.error(`Slide ${chunk.slideNumber} failed: ${chunk.message || "Unknown error"}`);
      } 
      
      else if (chunk.type === "error") {
        setIsGenerating(false);
        setProgress(null);
        toast.error(`Generation failed: ${chunk.message || "Unknown error"}`);
      }
    },
    [dispatch, slidesRef, progress?.total]
  );

  const startGeneration = useCallback(
    (presId: string) => {
      if (!presId) return;
      setIsGenerating(true);
      generateAndCreateSlidesMutation.mutate({
        presentationId: presId,
        onChunk: handleGenerationChunk,
      });
    },
    [generateAndCreateSlidesMutation, handleGenerationChunk]
  );

  return {
    isGenerating,
    progress,
    generationSpeed,
    startGeneration,
    isPending: generateAndCreateSlidesMutation.isPending,
  };
}
