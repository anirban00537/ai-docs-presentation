import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  DEFAULT_THEME,
  addSlide,
  selectActiveSlideId,
  selectSlides,
  selectTheme,
  setPresentation,
  setSlides,
  setTheme,
} from "@/store/slices/slidesSlice";
import { setPresentationId } from "@/store/middleware/slidesApiMiddleware";
import { detectRowBlockType } from "@/app/(protected)/presentation/[id]/editor/blocks/utils";
import {
  convertApiSlideToRedux,
  convertReduxSlideToApi,
} from "@/lib/editor/adapters";
import { createEditorCommandBus } from "@/lib/editor/commands";
import {
  usePresentation,
  useCreatePresentation,
} from "@/hooks/use-presentation";
import {
  useGenerateAndCreateSlides,
  useOutline,
} from "@/app/(protected)/presentation/[id]/hooks/use-outline";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { useEditorDnd } from "./useEditorDnd";

interface UseEditorPageParams {
  presentationId: string | null;
  outlineId: string | null;
}

export const useEditorPage = ({
  presentationId,
  outlineId,
}: UseEditorPageParams) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const slides = useAppSelector(selectSlides);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeSlideId = useAppSelector(selectActiveSlideId);

  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slideGenerationProgress, setSlideGenerationProgress] = useState<{
    current: number;
    total: number;
    stage?: string;
    message?: string;
    estimatedSeconds?: number;
  } | null>(null);

  const hasLoadedPresentation = useRef(false);
  const hasStartedGeneration = useRef(false);
  const slidesRef = useRef(slides);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  useEffect(() => {
    if (activeSlideId) {
      setTimeout(() => {
        const slideElement = document.querySelector(
          `[data-slide-id="${activeSlideId}"]`
        );
        if (slideElement) {
          slideElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [activeSlideId, slides.length]);

  const { data: presentationResponse, isLoading: isLoadingPresentation } =
    usePresentation(presentationId);
  const createPresentationMutation = useCreatePresentation();
  const generateAndCreateSlidesMutation = useGenerateAndCreateSlides();
  const { data: outlineResponse } = useOutline(outlineId);

  const commandBus = useMemo(
    () => createEditorCommandBus(dispatch),
    [dispatch]
  );

  const {
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
  } = useEditorDnd({ slides, commandBus });

  useEffect(() => {
    setPresentationId(presentationId);
    return () => {
      setPresentationId(null);
    };
  }, [presentationId]);

  const saveAllSlidesToPresentation = useMemo(
    () => async (presId: string) => {
      if (!presId || slides.length === 0) return;
      try {
        const { createSlide } = await import("@/services/presentation");
        for (let i = 0; i < slides.length; i++) {
          const slide = slides[i];
          const apiData = convertReduxSlideToApi(slide);
          await createSlide(presId, {
            ...apiData,
            order: i,
          });
        }
      } catch (error) {
        console.error("Failed to save slides:", error);
        toast.error("Failed to save slides to presentation");
      }
    },
    [slides]
  );

  useEffect(() => {
    hasLoadedPresentation.current = false;
  }, [presentationId]);

  useEffect(() => {
    if (
      presentationResponse?.success &&
      presentationResponse.data?.slides &&
      !hasLoadedPresentation.current
    ) {
      const apiSlides = presentationResponse.data.slides;
      const reduxSlides = apiSlides
        .sort((a: any, b: any) => a.order - b.order)
        .map(convertApiSlideToRedux);
      dispatch(setSlides(reduxSlides));

      if (presentationResponse.data?.globalTheme) {
        dispatch(setTheme(presentationResponse.data.globalTheme as any));
      }

      if (presentationResponse.data) {
        const presentationData = {
          id: presentationResponse.data.id,
          userId: presentationResponse.data.userId,
          title: presentationResponse.data.title || "Untitled Presentation",
          description: presentationResponse.data.description ?? null,
          thumbnail: presentationResponse.data.thumbnail ?? null,
          isPublic: presentationResponse.data.isPublic || false,
          isTemplate: presentationResponse.data.isTemplate || false,
          tags: presentationResponse.data.tags || [],
          version: presentationResponse.data.version || 1,
          parentId: presentationResponse.data.parentId ?? null,
          forkedFrom: presentationResponse.data.forkedFrom ?? null,
          sharedWith: presentationResponse.data.sharedWith || [],
          ownerId:
            presentationResponse.data.ownerId ||
            presentationResponse.data.userId,
          deletedAt: presentationResponse.data.deletedAt ?? null,
          createdAt: presentationResponse.data.createdAt,
          updatedAt: presentationResponse.data.updatedAt,
          lastViewedAt: presentationResponse.data.lastViewedAt ?? null,
        };
        dispatch(setPresentation(presentationData));
      }

      hasLoadedPresentation.current = true;
    } else if (
      presentationResponse?.success &&
      (!presentationResponse.data?.slides ||
        presentationResponse.data.slides.length === 0) &&
      !hasLoadedPresentation.current
    ) {
      dispatch(setSlides([]));

      if (presentationResponse.data?.globalTheme) {
        dispatch(setTheme(presentationResponse.data.globalTheme as any));
      }

      if (presentationResponse.data) {
        const presentationData = {
          id: presentationResponse.data.id,
          userId: presentationResponse.data.userId,
          title: presentationResponse.data.title || "Untitled Presentation",
          description: presentationResponse.data.description ?? null,
          thumbnail: presentationResponse.data.thumbnail ?? null,
          isPublic: presentationResponse.data.isPublic || false,
          isTemplate: presentationResponse.data.isTemplate || false,
          tags: presentationResponse.data.tags || [],
          version: presentationResponse.data.version || 1,
          parentId: presentationResponse.data.parentId ?? null,
          forkedFrom: presentationResponse.data.forkedFrom ?? null,
          sharedWith: presentationResponse.data.sharedWith || [],
          ownerId:
            presentationResponse.data.ownerId ||
            presentationResponse.data.userId,
          deletedAt: presentationResponse.data.deletedAt ?? null,
          createdAt: presentationResponse.data.createdAt,
          updatedAt: presentationResponse.data.updatedAt,
          lastViewedAt: presentationResponse.data.lastViewedAt ?? null,
        };
        dispatch(setPresentation(presentationData));
      }

      hasLoadedPresentation.current = true;

      // If outlineId exists and presentation has no slides, trigger generation
      if (
        outlineId &&
        presentationId &&
        !generateAndCreateSlidesMutation.isPending &&
        !hasStartedGeneration.current &&
        outlineResponse?.success
      ) {
        // Check credits before starting generation
        const outlineItems = outlineResponse.data?.outlines || [];
        const estimatedSlides = outlineItems.length;
        const creditsPerSlide = 1; // Should match backend
        const requiredCredits = estimatedSlides * creditsPerSlide;

        // Note: Backend will also check credits, but we can show a better UX here
        // The backend will return an error if credits are insufficient

        hasStartedGeneration.current = true;
        setIsGeneratingSlides(true);
        dispatch(setSlides([]));
        setTimeout(() => {
          generateAndCreateSlidesMutation.mutate({
            presentationId: presentationId,
            onChunk: (chunk) => {
              if (chunk.type === "start") {
                setSlideGenerationProgress({
                  current: 0,
                  total: chunk.totalSlides || 0,
                });
                dispatch(setSlides([]));
              } else if (chunk.type === "slide-start") {
                setSlideGenerationProgress({
                  current: chunk.slideNumber || 0,
                  total: chunk.totalSlides || 0,
                  stage: chunk.stage,
                  estimatedSeconds: chunk.estimatedSeconds,
                  message: `Starting slide ${chunk.slideNumber}...`,
                });
              } else if (chunk.type === "slide-progress") {
                // NEW: Handle progress updates
                setSlideGenerationProgress(prev => ({
                  current: chunk.slideNumber || prev?.current || 0,
                  total: prev?.total || chunk.totalSlides || 0,
                  stage: chunk.stage,
                  message: chunk.message || 'Processing...',
                  estimatedSeconds: prev?.estimatedSeconds,
                }));
              } else if (chunk.type === "slide" && chunk.data) {
                const slide = {
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
                dispatch(setSlides([...currentSlides, slide]));
              } else if (chunk.type === "complete") {
                setIsGeneratingSlides(false);
                setSlideGenerationProgress(null);
                toast.success("Presentation created successfully!");
              } else if (
                chunk.type === "slide-error" ||
                chunk.type === "error"
              ) {
                console.log("[useEditorPage] Error chunk received:", chunk);
                setIsGeneratingSlides(false);
                setSlideGenerationProgress(null);
                const errorMessage = chunk.message || "Unknown error";

                // Check if it's a credit-related error
                if (
                  errorMessage.toLowerCase().includes("insufficient credits") ||
                  errorMessage.toLowerCase().includes("credits")
                ) {
                  console.log("[useEditorPage] Showing credits error toast");
                  toast.error(errorMessage, {
                    duration: 10000,
                    action: {
                      label: "View Subscription",
                      onClick: () => {
                        window.location.href = "/subscription";
                      },
                    },
                  });
                } else {
                  console.log("[useEditorPage] Showing generic error toast");
                  toast.error(`Error generating slides: ${errorMessage}`, {
                    duration: 10000,
                  });
                }
              }
            },
          });
        }, 100);
      }
    }
  }, [
    presentationResponse,
    dispatch,
    outlineId,
    presentationId,
    outlineResponse,
    generateAndCreateSlidesMutation,
  ]);

  const startSlideGeneration = useMemo(
    () => (presId: string) => {
      dispatch(setSlides([]));
      generateAndCreateSlidesMutation.mutate({
        presentationId: presId,
        onChunk: (chunk) => {
          if (chunk.type === "start") {
            setSlideGenerationProgress({
              current: 0,
              total: chunk.totalSlides || 0,
            });
            dispatch(setSlides([]));
          } else if (chunk.type === "slide-start") {
            setSlideGenerationProgress({
              current: chunk.slideNumber || 0,
              total: chunk.totalSlides || 0,
              stage: chunk.stage,
              estimatedSeconds: chunk.estimatedSeconds,
              message: `Starting slide ${chunk.slideNumber}...`,
            });
          } else if (chunk.type === "slide-progress") {
            // Handle progress updates
            setSlideGenerationProgress(prev => ({
              current: chunk.slideNumber || prev?.current || 0,
              total: prev?.total || chunk.totalSlides || 0,
              stage: chunk.stage,
              message: chunk.message || 'Processing...',
              estimatedSeconds: prev?.estimatedSeconds,
            }));
          } else if (chunk.type === "slide" && chunk.data) {
            const slide = {
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
            dispatch(setSlides([...currentSlides, slide]));
          } else if (chunk.type === "complete") {
            setIsGeneratingSlides(false);
            setSlideGenerationProgress(null);
            toast.success("Presentation created successfully!");
          } else if (chunk.type === "slide-error" || chunk.type === "error") {
            setIsGeneratingSlides(false);
            setSlideGenerationProgress(null);
            toast.error(
              `Error generating slides: ${chunk.message || "Unknown error"}`
            );
          }
        },
      });
    },
    [dispatch, generateAndCreateSlidesMutation]
  );

  useEffect(() => {
    // This effect is a backup that only triggers if the first effect didn't handle it
    // Only run if presentation has been loaded and has no slides in the API response
    if (
      outlineId &&
      presentationId &&
      !generateAndCreateSlidesMutation.isPending &&
      !hasStartedGeneration.current &&
      hasLoadedPresentation.current &&
      outlineResponse?.success &&
      presentationResponse?.success
    ) {
      // IMPORTANT: Only check API response, not Redux state (which might be empty initially)
      const hasNoSlidesInApi =
        !presentationResponse.data?.slides ||
        presentationResponse.data.slides.length === 0;

      if (hasNoSlidesInApi) {
        hasStartedGeneration.current = true;
        setIsGeneratingSlides(true);
        startSlideGeneration(presentationId);
      }
    } else if (
      outlineId &&
      !presentationId &&
      !generateAndCreateSlidesMutation.isPending &&
      !hasStartedGeneration.current &&
      outlineResponse?.success
    ) {
      // Legacy case: if no presentationId, create one from outline
      const outline = outlineResponse.data as any;
      const linkedPresentationId = outline?.presentationId;
      if (!linkedPresentationId) {
        toast.error("Outline does not have a linked presentation");
        return;
      }
      hasStartedGeneration.current = true;
      setTimeout(() => {
        setIsGeneratingSlides(true);
        router.replace(`/presentation/${linkedPresentationId}`);
        startSlideGeneration(linkedPresentationId);
      }, 0);
    }
  }, [
    outlineId,
    presentationId,
    outlineResponse,
    presentationResponse,
    generateAndCreateSlidesMutation,
    router,
    startSlideGeneration,
  ]);

  useEffect(() => {
    if (
      !outlineId &&
      !presentationId &&
      slides.length > 0 &&
      !createPresentationMutation.isPending &&
      !hasLoadedPresentation.current
    ) {
      const hasValidSlides = slides.some(
        (slide) => slide.rows && slide.rows.length > 0
      );
      if (hasValidSlides) {
        createPresentationMutation.mutate(
          { title: "Untitled Presentation" },
          {
            onSuccess: (response) => {
              if (response.success && response.data?.id) {
                const newPresentationId = response.data.id;
                router.replace(`/presentation/${newPresentationId}`);
                saveAllSlidesToPresentation(newPresentationId);
              }
            },
            onError: (error) => {
              console.error("Failed to create presentation:", error);
              toast.error("Failed to create presentation");
            },
          }
        );
      }
    }
  }, [
    slides,
    presentationId,
    outlineId,
    createPresentationMutation,
    router,
    saveAllSlidesToPresentation,
  ]);

  const handleUpdateBlock = (
    slideId: string,
    blockId: string,
    content: any
  ) => {
    commandBus.updateBlock({ slideId, blockId, content });
  };

  const handleDeleteRow = (slideId: string, rowId: string) => {
    commandBus.deleteRow({ slideId, rowId });
  };

  const handleAddColumn = (
    slideId: string,
    rowId: string,
    afterBlockId: string
  ) => {
    const slide = slides.find((s) => s.id === slideId);
    let blockType: string | undefined;
    if (slide) {
      const row = slide.rows.find((r) => r.id === rowId);
      if (row) {
        blockType = detectRowBlockType(row);
      }
    }
    commandBus.addBlockAfter({ slideId, rowId, afterBlockId, blockType });
  };

  const handleAddRowAtTop = (slideId: string) => {
    commandBus.addRowAtTop({ slideId, columnCount: 1 });
  };

  const handleAddRowAtBottom = (slideId: string) => {
    commandBus.addRowWithColumns({
      slideId,
      columnCount: 1,
      blockType: "prosemirror"
    });
  };

  const handleUpdateColumnWidths = (
    slideId: string,
    rowId: string,
    columnWidths: number[]
  ) => {
    commandBus.updateColumnWidths({ slideId, rowId, columnWidths });
  };

  const handleAddSlide = () => {
    dispatch(addSlide({}));
  };

  return {
    // state
    slides,
    theme,
    activeSlideId,
    isGeneratingSlides,
    slideGenerationProgress,
    isLoadingPresentation,

    // dnd
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,

    // actions
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    presentationId,
  };
};
