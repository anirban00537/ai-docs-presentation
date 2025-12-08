"use client";

import React, { useState } from "react";
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
  DEFAULT_THEME,
  addSlide,
  updateBlockContent,
  addRowWithColumns,
  addRowAtTop,
  addBlockToRow,
  deleteRow,
  moveBlock,
  reorderBlocksInRow,
  Block,
} from "@/store/slices/slidesSlice";
import {
  SlideCard,
  FloatingSidebar,
  SmartLayoutIcon,
} from "@/components/editor";
import { AppleButton } from "@/components/apple-button";

// --- Main Page Component ---
const GammaPage = () => {
  const dispatch = useAppDispatch();
  const slides = useAppSelector(selectSlides);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [isLayoutPanelOpen, setIsLayoutPanelOpen] = useState(false);
  const [isLayoutDragging, setIsLayoutDragging] = useState(false);
  const [draggingLayoutColumnCount, setDraggingLayoutColumnCount] = useState<
    number | null
  >(null);

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
    dispatch(addBlockToRow({ slideId, rowId, afterBlockId }));
  };

  const handleAddRowAtTop = (slideId: string) => {
    dispatch(addRowAtTop({ slideId, columnCount: 1 }));
  };

  const handleAddRowAtBottom = (slideId: string) => {
    dispatch(addRowWithColumns({ slideId, columnCount: 1 }));
  };

  // --- Drag and Drop ---
  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;

    // Check if it's a layout option being dragged
    if (data?.type === "layout-option") {
      setIsLayoutDragging(true);
      setDraggingLayoutColumnCount(data.columnCount);
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
      if (over && draggingLayoutColumnCount) {
        const overData = over.data.current;
        if (overData?.type === "slide-drop-zone") {
          const slideId = overData.slideId as string;
          dispatch(
            addRowWithColumns({
              slideId,
              columnCount: draggingLayoutColumnCount,
            })
          );
        }
      }

      setDraggingLayoutColumnCount(null);
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

      const blockCollision = pointerCollisions.find(
        (c: any) => c.data?.droppableContainer?.data?.current?.type === "block"
      );
      if (blockCollision) return [blockCollision];
      return pointerCollisions;
    }
    return closestCenter(args);
  };

  return (
    <div
      className="min-h-screen overflow-y-auto"
      style={{
        backgroundColor: theme.pageBackground,
        fontFamily: theme.fontFamily,
      }}
    >
      <div className="max-w-[1200px] mx-auto p-8 pr-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Flexible Layout Editor
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Drag blocks between rows • Use Smart Layout to add columns
            </p>
          </div>
          <AppleButton
            onClick={() => dispatch(addSlide({}))}
            variant="primary"
            size="default"
            style={{
              backgroundColor: theme.primary,
            }}
          >
            <span>+</span>
            <span>Add Slide</span>
          </AppleButton>
        </div>

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
                <SlideCard
                  key={slide.id}
                  slide={slide}
                  index={index}
                  totalSlides={slides.length}
                  onUpdateBlock={handleUpdateBlock}
                  onDeleteRow={handleDeleteRow}
                  onAddColumn={handleAddColumn}
                  onAddRowAtTop={handleAddRowAtTop}
                  onAddRowAtBottom={handleAddRowAtBottom}
                  onDeleteSlide={() => {}}
                  isLayoutDragging={isLayoutDragging}
                  activeLayoutSlideId={null}
                />
              ))}
          </div>

          {/* Floating Sidebar */}
          <FloatingSidebar
            isLayoutPanelOpen={isLayoutPanelOpen}
            onToggleLayoutPanel={() => setIsLayoutPanelOpen(!isLayoutPanelOpen)}
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
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default GammaPage;
