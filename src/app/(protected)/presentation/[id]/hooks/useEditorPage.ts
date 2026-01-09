"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  DEFAULT_THEME,
  selectActiveSlideId,
  selectSlides,
  selectTheme,
  setPresentation,
  setSlides,
  setTheme,
} from "@/store/slices/slidesSlice";
import { convertApiSlideToRedux } from "@/lib/editor/adapters";
import { createEditorCommandBus } from "@/lib/editor/commands";
import { usePresentation } from "@/hooks/use-presentation";
import { useOutline } from "@/app/(protected)/presentation/[id]/hooks/use-outline";
import { useEditorDnd } from "./useEditorDnd";
import { useSlideGeneration } from "./useSlideGeneration";
import { useEditorSync } from "./useEditorSync";
import { useSlideActions } from "./useSlideActions";
import { detectRowBlockType } from "@/app/(protected)/presentation/[id]/editor/blocks/utils";

interface UseEditorPageParams {
  presentationId: string | null;
  outlineId: string | null;
}

export const useEditorPage = ({ presentationId, outlineId }: UseEditorPageParams) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const slides = useAppSelector(selectSlides);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const slidesRef = useRef(slides);

  useEffect(() => { slidesRef.current = slides; }, [slides]);

  // --- Sub-Hooks (The Logic Layers) ---
  const { data: presentationResponse, isLoading: isLoadingPresentation } = usePresentation(presentationId);
  const { data: outlineResponse } = useOutline(outlineId);
  
  // 1. Generation Logic
  const { isGenerating, progress, startGeneration, generationSpeed } = useSlideGeneration({ 
    presentationId, 
    slidesRef 
  });

  // 2. Sync Logic (Auto-save)
  useEditorSync(presentationId);

  // 4. Slide Actions (Add/Delete)
  const { handleAddSlide, handleDeleteSlide } = useSlideActions(presentationId);

  const commandBus = useMemo(() => createEditorCommandBus(dispatch), [dispatch]);

  // 3. Interaction Logic (DnD)
  const dnd = useEditorDnd({ slides, commandBus });

  // --- Initialization Logic ---
  const hasLoaded = useRef(false);

  // Load presentation from DB
  useEffect(() => {
    if (presentationResponse?.success && presentationResponse.data && !hasLoaded.current) {
      const apiSlides = presentationResponse.data.slides || [];
      const reduxSlides = [...apiSlides]
        .sort((a: any, b: any) => a.order - b.order)
        .map(convertApiSlideToRedux);
      
      dispatch(setSlides(reduxSlides));
      if (presentationResponse.data.globalTheme) {
        dispatch(setTheme(presentationResponse.data.globalTheme as any));
      }
      dispatch(setPresentation(presentationResponse.data as any));
      
      hasLoaded.current = true;

      // Auto-trigger generation if presentation is empty and outline exists
      if (reduxSlides.length === 0 && outlineId && outlineResponse?.success) {
        startGeneration(presentationId!);
      }
    }
  }, [presentationResponse, outlineResponse, outlineId, presentationId, dispatch, startGeneration]);

  // --- Action Handlers ---
  const handleUpdateBlock = (slideId: string, blockId: string, content: any) => 
    commandBus.updateBlock({ slideId, blockId, content });

  const handleDeleteRow = (slideId: string, rowId: string) => 
    commandBus.deleteRow({ slideId, rowId });

  const handleAddColumn = (slideId: string, rowId: string, afterBlockId: string) => {
    const slide = slides.find((s) => s.id === slideId);
    const row = slide?.rows.find((r) => r.id === rowId);
    const blockType = row ? detectRowBlockType(row) : undefined;
    commandBus.addBlockAfter({ slideId, rowId, afterBlockId, blockType });
  };

  const handleAddRowAtTop = (slideId: string) => 
    commandBus.addRowAtTop({ slideId, columnCount: 1 });

  const handleAddRowAtBottom = (slideId: string) => 
    commandBus.addRowWithColumns({ slideId, columnCount: 1, blockType: "prosemirror" });

  const handleUpdateColumnWidths = (slideId: string, rowId: string, columnWidths: number[]) => 
    commandBus.updateColumnWidths({ slideId, rowId, columnWidths });

  const handleAddSlideAtOrder = (afterSlideId?: string) => 
    handleAddSlide(afterSlideId);

  return {
    // state
    slides,
    theme,
    activeSlideId,
    isGeneratingSlides: isGenerating,
    slideGenerationProgress: progress,
    slideGenerationSpeed: generationSpeed,
    isLoadingPresentation,
    presentationId,

    // dnd
    ...dnd,

    // actions
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleAddSlide: handleAddSlideAtOrder,
    handleDeleteSlide,
    
    // internals
    commandBus, 
  };
};
