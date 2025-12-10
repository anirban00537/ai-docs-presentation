"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSlides,
  selectTheme,
  selectActiveSlideId,
  DEFAULT_THEME,
  addSlide,
  updateBlockContent,
  addRowWithColumns,
  addRowAtTop,
  addBlockToRow,
  deleteRow,
  moveBlock,
  reorderBlocksInRow,
  setSlides,
  setTheme,
  setPresentation,
  Block,
  Slide as ReduxSlide,
} from "@/store/slices/slidesSlice";
import {
  SlideCard,
  FloatingSidebar,
  SmartLayoutIcon,
  SlidesSidebar,
  PresentationTopBar,
} from "@/components/editor";
import { NumberCardIcon } from "@/components/editor/icons/layout-icons";
import { AppleButton } from "@/components/apple-button";
import {
  usePresentation,
  useCreatePresentation,
} from "@/hooks/use-presentation";
import { useGenerateAndCreateSlides, useOutline } from "@/hooks/use-outline";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { setPresentationId } from "@/store/middleware/slidesApiMiddleware";
import { detectRowBlockType } from "@/components/editor/blocks/utils";

// Utility functions to convert between Redux and API formats
const convertApiSlideToRedux = (apiSlide: any): ReduxSlide => {
  // API slide has: { id, data: { rows: [...] }, order }
  // Redux slide has: { id, rows: [...] }
  return {
    id: apiSlide.id,
    rows: apiSlide.data?.rows || [],
  };
};

const convertReduxSlideToApi = (reduxSlide: ReduxSlide): any => {
  // Redux slide has: { id, rows: [...] }
  // API slide needs: { data: { rows: [...] } }
  return {
    data: {
      rows: reduxSlide.rows,
    },
  };
};

// --- Main Page Component ---
const GammaPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const presentationId = searchParams.get("id");
  const outlineId = searchParams.get("outlineId");

  const slides = useAppSelector(selectSlides);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [isLayoutPanelOpen, setIsLayoutPanelOpen] = useState(false);
  const [isLayoutDragging, setIsLayoutDragging] = useState(false);
  const [draggingLayoutColumnCount, setDraggingLayoutColumnCount] = useState<
    number | null
  >(null);
  const [draggingLayoutBlockType, setDraggingLayoutBlockType] = useState<
    string | undefined
  >(undefined);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(
    null
  );
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slideGenerationProgress, setSlideGenerationProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const hasLoadedPresentation = useRef(false);
  const hasStartedGeneration = useRef(false);
  const slidesRef = useRef(slides);

  // Keep slidesRef in sync with slides
  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  // Scroll to active slide when it changes
  useEffect(() => {
    if (activeSlideId) {
      // Use a small timeout to ensure DOM is updated
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

  // TanStack Query hooks - use presentationId from URL directly
  const { data: presentationResponse, isLoading: isLoadingPresentation } =
    usePresentation(presentationId);
  const createPresentationMutation = useCreatePresentation();
  const generateAndCreateSlidesMutation = useGenerateAndCreateSlides();

  // Set presentation ID in middleware for API calls
  useEffect(() => {
    setPresentationId(presentationId);
    return () => {
      setPresentationId(null);
    };
  }, [presentationId]);

  // Fetch outline if outlineId is present to get presentationId
  const { data: outlineResponse } = useOutline(outlineId);

  // Save all slides to presentation (using service directly for bulk operations)
  const saveAllSlidesToPresentation = React.useCallback(
    async (presId: string) => {
      if (!presId || slides.length === 0) return;

      try {
        const { createSlide } = await import("@/services/presentation");
        // Create all slides
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

  // Reset loaded flag when presentationId changes
  useEffect(() => {
    hasLoadedPresentation.current = false;
  }, [presentationId]);

  // Convert API presentation slides to Redux format when loaded
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

      // Set slides (empty array if no slides, otherwise the loaded slides)
      dispatch(setSlides(reduxSlides));

      // Load theme from presentation if available
      if (presentationResponse.data?.globalTheme) {
        dispatch(setTheme(presentationResponse.data.globalTheme as any));
      }

      // Load presentation metadata
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
      // If presentation exists but has no slides, clear the slides array
      dispatch(setSlides([]));

      // Load theme from presentation if available
      if (presentationResponse.data?.globalTheme) {
        dispatch(setTheme(presentationResponse.data.globalTheme as any));
      }

      // Load presentation metadata
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
    }
  }, [presentationResponse, dispatch]);

  // Helper function to generate and create slides from presentation
  const startSlideGeneration = React.useCallback(
    (presId: string) => {
      // Clear existing slides before starting generation
      dispatch(setSlides([]));

      generateAndCreateSlidesMutation.mutate({
        presentationId: presId,
        onChunk: (chunk) => {
          if (chunk.type === "start") {
            setSlideGenerationProgress({
              current: 0,
              total: chunk.totalSlides || 0,
            });
            // Clear slides at the start
            dispatch(setSlides([]));
          } else if (chunk.type === "slide-start") {
            setSlideGenerationProgress({
              current: chunk.slideNumber || 0,
              total: chunk.totalSlides || 0,
            });
          } else if (chunk.type === "slide" && chunk.data) {
            // Convert API slide format to Redux format
            // Use slideId from backend if available, otherwise generate one
            const slide: ReduxSlide = {
              id: chunk.slideId || nanoid(),
              rows: chunk.data.rows.map((row: any) => ({
                id: row.id || nanoid(),
                blocks: row.blocks.map((block: any) => ({
                  id: block.id || nanoid(),
                  content: block.content,
                })),
              })),
            };

            // Add slide to Redux immediately (streaming update)
            // Use ref to get current slides to avoid stale closure
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
    [generateAndCreateSlidesMutation, dispatch]
  );

  // Handle outlineId: Use linked presentation and generate slides
  useEffect(() => {
    if (
      outlineId &&
      !presentationId &&
      !generateAndCreateSlidesMutation.isPending &&
      !hasStartedGeneration.current &&
      outlineResponse?.success
    ) {
      // Get linked presentation from outline
      const outline = outlineResponse.data as any;
      const linkedPresentationId = outline?.presentationId;

      if (!linkedPresentationId) {
        toast.error("Outline does not have a linked presentation");
        return;
      }

      // Use the linked presentation
      hasStartedGeneration.current = true;

      // Defer state updates to avoid synchronous setState in effect
      setTimeout(() => {
        setIsGeneratingSlides(true);
        router.replace(`/editor?id=${linkedPresentationId}`);
        startSlideGeneration(linkedPresentationId);
      }, 0);
    }
  }, [
    outlineId,
    presentationId,
    outlineResponse,
    generateAndCreateSlidesMutation,
    router,
    startSlideGeneration,
  ]);

  // Create presentation if slides exist but no presentationId (fallback for non-outline flow)
  useEffect(() => {
    if (
      !outlineId &&
      !presentationId &&
      slides.length > 0 &&
      !createPresentationMutation.isPending &&
      !hasLoadedPresentation.current
    ) {
      // Check if slides were just generated (they have rows with blocks)
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
                // Update URL with new presentation ID
                router.replace(`/editor?id=${newPresentationId}`);
                // Save all slides to the new presentation
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Handlers ---
  const handleUpdateBlock = (
    slideId: string,
    blockId: string,
    content: any
  ) => {
    // Middleware will handle the API call
    dispatch(updateBlockContent({ slideId, blockId, content }));
  };

  const handleDeleteRow = (slideId: string, rowId: string) => {
    dispatch(deleteRow({ slideId, rowId }));
  };

  const handleAddColumn = (
    slideId: string,
    rowId: string,
    afterBlockId: string
  ) => {
    // Detect block type from the row to maintain consistency
    const slide = slides.find((s) => s.id === slideId);
    let blockType: string | undefined;

    if (slide) {
      const row = slide.rows.find((r) => r.id === rowId);
      if (row) {
        blockType = detectRowBlockType(row);
      }
    }

    dispatch(addBlockToRow({ slideId, rowId, afterBlockId, blockType }));
  };

  const handleDuplicateBlock = (
    slideId: string,
    rowId: string,
    afterBlockId: string,
    blockType: string
  ) => {
    // Add a new block of the same type after the current block
    dispatch(addBlockToRow({ slideId, rowId, afterBlockId, blockType }));
  };

  const handleAddRowAtTop = (slideId: string) => {
    dispatch(addRowAtTop({ slideId, columnCount: 1 }));
  };

  const handleAddRowAtBottom = (slideId: string) => {
    // Middleware will handle the API call
    dispatch(addRowWithColumns({ slideId, columnCount: 1 }));
  };

  const handleAddSlide = () => {
    // Middleware will handle the API call
    dispatch(addSlide({}));
  };

  // --- Drag and Drop ---
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;

    // Check if it's a layout option being dragged
    if (data?.type === "layout-option") {
      setIsLayoutDragging(true);
      setDraggingLayoutColumnCount(data.columnCount);
      setDraggingLayoutBlockType(data.blockType);
      return;
    }

    // Check if it's a block option being dragged
    if (data?.type === "block-option") {
      setIsBlockDragging(true);
      setDraggingBlockType(data.blockType);
      return;
    }

    // Regular block dragging
    const block = data?.block as Block;
    if (block) {
      setActiveBlock(block);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    console.log("=== DRAG END ===");
    console.log("Active:", active.id, active.data.current);
    console.log("Over:", over?.id, over?.data.current);

    // Reset layout dragging state
    if (isLayoutDragging) {
      setIsLayoutDragging(false);

      // Handle layout drop
      if (over && draggingLayoutColumnCount !== null) {
        const overData = over.data.current;

        if (overData?.type === "slide-drop-zone") {
          const slideId = overData.slideId as string;
          dispatch(
            addRowWithColumns({
              slideId,
              columnCount: draggingLayoutColumnCount,
              blockType: draggingLayoutBlockType,
            })
          );
        }
      }

      setDraggingLayoutColumnCount(null);
      setDraggingLayoutBlockType(undefined);
      return;
    }

    // Handle block-type dragging
    if (isBlockDragging) {
      setIsBlockDragging(false);

      if (over && draggingBlockType) {
        const overData = over.data.current;

        // Case 1: Dropped on a row
        if (overData?.type === "row") {
          const rowId = overData.rowId as string;
          const slideId = overData.slideId as string;
          // Find the last block in the row to insert after
          const slide = slides.find((s) => s.id === slideId);
          if (slide) {
            const row = slide.rows.find((r) => r.id === rowId);
            if (row && row.blocks.length > 0) {
              const lastBlockId = row.blocks[row.blocks.length - 1].id;
              dispatch(
                addBlockToRow({
                  slideId,
                  rowId,
                  afterBlockId: lastBlockId,
                  blockType: draggingBlockType,
                })
              );
            } else if (row) {
              // Empty row - add block directly (no afterBlockId needed)
              dispatch(
                addBlockToRow({
                  slideId,
                  rowId,
                  blockType: draggingBlockType,
                })
              );
            }
          }
        }
        // Case 2: Dropped on a block
        else if (overData?.type === "block") {
          const targetBlockId = overData.block?.id as string;
          const targetSlideId = overData.slideId as string;
          // Find the row containing the target block
          const slide = slides.find((s) => s.id === targetSlideId);
          if (slide) {
            for (const row of slide.rows) {
              const blockIndex = row.blocks.findIndex(
                (b) => b.id === targetBlockId
              );
              if (blockIndex !== -1) {
                dispatch(
                  addBlockToRow({
                    slideId: targetSlideId,
                    rowId: row.id,
                    afterBlockId: targetBlockId,
                    blockType: draggingBlockType,
                  })
                );
                break;
              }
            }
          }
        }
      }

      setDraggingBlockType(null);
      return;
    }

    setActiveBlock(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    const sourceSlideId = activeData?.slideId as string;
    const sourceBlockId = activeData?.block?.id as string;

    console.log("Source:", { sourceSlideId, sourceBlockId });
    console.log("Over data type:", overData?.type);

    if (!sourceSlideId || !sourceBlockId) {
      console.log("❌ Missing source slide or block ID");
      return;
    }

    // Find source row and block index
    let sourceRowId: string | null = null;
    let sourceBlockIndex: number = -1;
    const sourceSlide = slides.find((s) => s.id === sourceSlideId);
    if (sourceSlide) {
      for (const row of sourceSlide.rows) {
        const blockIdx = row.blocks.findIndex((b) => b.id === sourceBlockId);
        if (blockIdx !== -1) {
          sourceRowId = row.id;
          sourceBlockIndex = blockIdx;
          break;
        }
      }
    }

    console.log("Source found:", { sourceRowId, sourceBlockIndex });

    if (!sourceRowId || sourceBlockIndex === -1) {
      console.log("❌ Could not find source row or block index");
      return;
    }

    // Case 1: Dropped on a row (different row)
    if (overData?.type === "row") {
      const targetRowId = overData.rowId as string;
      const targetSlideId = overData.slideId as string;

      if (targetRowId === sourceRowId && targetSlideId === sourceSlideId)
        return;

      dispatch(
        moveBlock({
          slideId: sourceSlideId,
          sourceRowId,
          targetRowId,
          blockId: sourceBlockId,
        })
      );
      return;
    }

    // Case 2: Dropped on another block
    if (overData?.type === "block") {
      const targetBlockId = overData.block?.id as string;
      const targetSlideId = overData.slideId as string;

      if (sourceBlockId === targetBlockId) return;

      // Find target row and block index
      let targetRowId: string | null = null;
      let targetBlockIndex: number = -1;
      const targetSlide = slides.find((s) => s.id === targetSlideId);
      if (targetSlide) {
        for (const row of targetSlide.rows) {
          const blockIdx = row.blocks.findIndex((b) => b.id === targetBlockId);
          if (blockIdx !== -1) {
            targetRowId = row.id;
            targetBlockIndex = blockIdx;
            break;
          }
        }
      }

      if (!targetRowId || targetBlockIndex === -1) return;

      // Same row reordering - use sortable item indices for accurate positioning
      if (sourceRowId === targetRowId && sourceSlideId === targetSlideId) {
        console.log("🔄 SAME ROW REORDERING");
        console.log("Source block index:", sourceBlockIndex);
        console.log("Target block index:", targetBlockIndex);
        console.log(
          "Row blocks before:",
          sourceSlide?.rows
            .find((r) => r.id === sourceRowId)
            ?.blocks.map((b, i) => `${i}:${b.id}`)
        );

        // Verify sourceSlide exists (TypeScript guard)
        if (!sourceSlide) {
          console.log("❌ Source slide not found");
          return;
        }

        // Get the source row to access the blocks array
        const sourceRow = sourceSlide.rows.find((r) => r.id === sourceRowId);
        if (!sourceRow) {
          console.log("❌ Source row not found");
          return;
        }

        console.log("Dispatching reorderBlocksInRow:", {
          slideId: sourceSlideId,
          rowId: sourceRowId,
          oldIndex: sourceBlockIndex,
          newIndex: targetBlockIndex,
        });

        // The sortable items array matches the blocks array order
        // Sortable items are: row.blocks.map((b) => `${slideId}-${b.id}`)
        // We need to find the correct insertion position based on sortable semantics

        // When dragging within the same row using SortableContext,
        // the targetBlockIndex is where we're dropping
        // We want to move the source to that position (insert before target)

        // The reorderBlocksInRow function will handle the index adjustment
        // based on whether we're moving left-to-right or right-to-left
        dispatch(
          reorderBlocksInRow({
            slideId: sourceSlideId,
            rowId: sourceRowId,
            oldIndex: sourceBlockIndex,
            newIndex: targetBlockIndex,
          })
        );
        return;
      }

      // Different row - move block
      dispatch(
        moveBlock({
          slideId: sourceSlideId,
          sourceRowId,
          targetRowId,
          blockId: sourceBlockId,
          targetBlockId,
        })
      );
    }
  };

  const customCollisionDetection = (args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prioritize slide drop zones when dragging layouts
      if (isLayoutDragging) {
        const slideDropZone = pointerCollisions.find(
          (c: any) =>
            c.data?.droppableContainer?.data?.current?.type ===
            "slide-drop-zone"
        );
        if (slideDropZone) return [slideDropZone];
      }

      // Prioritize rows and blocks when dragging block types
      if (isBlockDragging) {
        const rowCollision = pointerCollisions.find(
          (c: any) => c.data?.droppableContainer?.data?.current?.type === "row"
        );
        if (rowCollision) return [rowCollision];
        const blockCollision = pointerCollisions.find(
          (c: any) =>
            c.data?.droppableContainer?.data?.current?.type === "block"
        );
        if (blockCollision) return [blockCollision];
      }

      const blockCollision = pointerCollisions.find(
        (c: any) => c.data?.droppableContainer?.data?.current?.type === "block"
      );
      if (blockCollision) return [blockCollision];
      return pointerCollisions;
    }
    return closestCenter(args);
  };

  return (
    <>
      <GoogleFontsLoader />
      <PresentationTopBar />
      <div
        className="min-h-screen overflow-y-auto pt-16"
        style={{
          backgroundColor: theme.pageBackground,
        }}
      >
        {/* Slides Sidebar */}
        <SlidesSidebar
          slides={slides.filter(
            (slide) => slide && slide.rows && Array.isArray(slide.rows)
          )}
          onUpdateBlock={handleUpdateBlock}
          onDeleteRow={handleDeleteRow}
          onAddColumn={handleAddColumn}
          onAddRowAtTop={handleAddRowAtTop}
          onAddRowAtBottom={handleAddRowAtBottom}
        />

        <div className="max-w-[1200px] mx-auto p-8 pr-20">
          {/* All Slides */}
          <DndContext
            sensors={sensors}
            collisionDetection={customCollisionDetection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col gap-8">
              {slides
                .filter(
                  (slide) => slide && slide.rows && Array.isArray(slide.rows)
                )
                .map((slide, index) => (
                  <div key={slide.id} data-slide-id={slide.id}>
                    <SlideCard
                      slide={slide}
                      index={index}
                      totalSlides={slides.length}
                      onUpdateBlock={handleUpdateBlock}
                      onDeleteRow={handleDeleteRow}
                      onAddColumn={handleAddColumn}
                      onDuplicateBlock={handleDuplicateBlock}
                      onAddRowAtTop={handleAddRowAtTop}
                      onAddRowAtBottom={handleAddRowAtBottom}
                      onDeleteSlide={() => {}}
                      isLayoutDragging={isLayoutDragging}
                      activeLayoutSlideId={null}
                    />
                  </div>
                ))}
            </div>

            {/* Floating Sidebar */}
            <FloatingSidebar
              isLayoutPanelOpen={isLayoutPanelOpen}
              onToggleLayoutPanel={() =>
                setIsLayoutPanelOpen(!isLayoutPanelOpen)
              }
              presentationId={presentationId}
            />

            {/* Drag Overlay */}
            <DragOverlay>
              {activeBlock && (
                <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-2xl opacity-90 max-w-[300px]">
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                    <span className="text-sm font-medium">Moving block...</span>
                  </div>
                </div>
              )}
              {isLayoutDragging && draggingLayoutColumnCount && (
                <div className="bg-white border-2 border-blue-400 rounded-xl p-4 shadow-2xl opacity-90">
                  <div className="flex items-center gap-2 text-blue-600">
                    <SmartLayoutIcon />
                    <span className="text-sm font-medium">
                      {draggingLayoutColumnCount} Columns
                    </span>
                  </div>
                </div>
              )}
              {isBlockDragging && draggingBlockType && (
                <div className="bg-white border-2 border-blue-400 rounded-xl p-4 shadow-2xl opacity-90">
                  <div className="flex items-center gap-2 text-blue-600">
                    {draggingBlockType === "number-card" && <NumberCardIcon />}
                    <span className="text-sm font-medium">
                      {draggingBlockType === "number-card"
                        ? "Number Card"
                        : draggingBlockType}
                    </span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </>
  );
};

export default GammaPage;
