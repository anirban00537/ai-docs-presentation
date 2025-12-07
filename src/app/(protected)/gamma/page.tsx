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
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { YooptaEditorWrapper } from "@/components/yoopta-editor";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectSlides,
  addSlide,
  deleteSlide,
  updateBlockContent,
  addBlockToRow,
  addRowToSlide,
  deleteRow,
  moveBlock,
  Block,
  Row,
  Slide,
} from "@/store/slices/slidesSlice";

// --- Draggable Block Component ---
const DraggableBlock = ({
  block,
  slideId,
  onUpdate,
  onAddRight,
}: {
  block: Block;
  slideId: string;
  onUpdate: (blockId: string, content: any) => void;
  onAddRight: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `${slideId}-${block.id}`,
    data: { type: "block", block, slideId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    minWidth: 0,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative min-w-0 flex-1">
      <div
        className={`relative p-1 rounded-lg transition-all ${
          isDragging ? "bg-blue-50 ring-2 ring-blue-300" : "hover:bg-gray-50/50"
        }`}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-8 cursor-grab opacity-0 group-hover:opacity-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all z-10"
        >
          <svg width="6" height="14" viewBox="0 0 6 14" fill="currentColor">
            <circle cx="1.5" cy="1.5" r="1.5" />
            <circle cx="4.5" cy="1.5" r="1.5" />
            <circle cx="1.5" cy="7" r="1.5" />
            <circle cx="4.5" cy="7" r="1.5" />
            <circle cx="1.5" cy="12.5" r="1.5" />
            <circle cx="4.5" cy="12.5" r="1.5" />
          </svg>
        </div>

        {/* Editor */}
        <YooptaEditorWrapper
          key={block.id}
          blockId={block.id}
          value={block.content}
          onChange={(val) => onUpdate(block.id, val)}
          placeholder="Type '/' for commands..."
          className=""
        />
      </div>

      {/* Add Column Button */}
      <button
        onClick={onAddRight}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:scale-110 transition-all z-20 flex items-center justify-center text-sm font-medium shadow-md"
        title="Add block to right"
      >
        +
      </button>
    </div>
  );
};

// --- Droppable Row Component ---
const DroppableRow = ({
  row,
  slideId,
  onUpdateBlock,
  onAddBlockRight,
  onAddRowBelow,
  onDeleteRow,
  rowCount,
}: {
  row: Row;
  slideId: string;
  onUpdateBlock: (blockId: string, content: any) => void;
  onAddBlockRight: (rowId: string, afterBlockId: string) => void;
  onAddRowBelow: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void;
  rowCount: number;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-drop-${slideId}-${row.id}`,
    data: { type: "row", rowId: row.id, slideId },
  });

  return (
    <div className="group/row relative">
      <div
        ref={setNodeRef}
        className={`flex gap-4 p-2 rounded-lg transition-all items-start ${
          isOver ? "bg-green-50 ring-2 ring-dashed ring-green-400" : "hover:bg-gray-50/30"
        }`}
      >
        <SortableContext
          items={row.blocks.map((b) => `${slideId}-${b.id}`)}
          strategy={horizontalListSortingStrategy}
        >
          {row.blocks.map((block) => (
            <DraggableBlock
              key={block.id}
              block={block}
              slideId={slideId}
              onUpdate={onUpdateBlock}
              onAddRight={() => onAddBlockRight(row.id, block.id)}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Row Button */}
      <button
        onClick={() => onAddRowBelow(row.id)}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 px-3 rounded-full bg-blue-500 text-white opacity-0 group-hover/row:opacity-100 hover:bg-blue-600 hover:scale-105 transition-all z-20 flex items-center justify-center text-xs font-medium shadow-md gap-1"
        title="Add row below"
      >
        <span>+</span>
        <span>Row</span>
      </button>

      {/* Delete Row Button */}
      {rowCount > 1 && (
        <button
          onClick={() => onDeleteRow(row.id)}
          className="absolute -right-2 top-2 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover/row:opacity-100 hover:bg-red-600 transition-all z-20 flex items-center justify-center text-xs"
          title="Delete row"
        >
          ×
        </button>
      )}
    </div>
  );
};

// --- Single Slide Component ---
const SlideCard = ({
  slide,
  index,
  totalSlides,
  onUpdateBlock,
  onAddBlockRight,
  onAddRowBelow,
  onDeleteRow,
  onDeleteSlide,
}: {
  slide: Slide;
  index: number;
  totalSlides: number;
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
  onAddBlockRight: (slideId: string, rowId: string, afterBlockId: string) => void;
  onAddRowBelow: (slideId: string, afterRowId: string) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onDeleteSlide: (slideId: string) => void;
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 px-6 py-4">

      {/* Slide Content */}
      <div className="flex flex-col gap-6">
        {slide.rows.map((row) => (
          <DroppableRow
            key={row.id}
            row={row}
            slideId={slide.id}
            onUpdateBlock={(blockId, content) => onUpdateBlock(slide.id, blockId, content)}
            onAddBlockRight={(rowId, afterBlockId) => onAddBlockRight(slide.id, rowId, afterBlockId)}
            onAddRowBelow={(afterRowId) => onAddRowBelow(slide.id, afterRowId)}
            onDeleteRow={(rowId) => onDeleteRow(slide.id, rowId)}
            rowCount={slide.rows.length}
          />
        ))}
      </div>
    </div>
  );
};

// --- Main Page Component ---
const GammaPage = () => {
  const dispatch = useAppDispatch();
  const slides = useAppSelector(selectSlides);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Handlers ---
  const handleUpdateBlock = (slideId: string, blockId: string, content: any) => {
    dispatch(updateBlockContent({ slideId, blockId, content }));
  };

  const handleAddBlockRight = (slideId: string, rowId: string, afterBlockId: string) => {
    dispatch(addBlockToRow({ slideId, rowId, afterBlockId }));
  };

  const handleAddRowBelow = (slideId: string, afterRowId: string) => {
    dispatch(addRowToSlide({ slideId, afterRowId }));
  };

  const handleDeleteRow = (slideId: string, rowId: string) => {
    dispatch(deleteRow({ slideId, rowId }));
  };

  const handleDeleteSlide = (slideId: string) => {
    dispatch(deleteSlide(slideId));
  };

  // --- Drag and Drop ---
  const handleDragStart = (event: DragStartEvent) => {
    const block = event.active.data.current?.block as Block;
    if (block) {
      setActiveBlock(block);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBlock(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;
    const sourceSlideId = activeData?.slideId as string;
    const sourceBlockId = activeData?.block?.id as string;

    if (!sourceSlideId || !sourceBlockId) return;

    // Find source row
    let sourceRowId: string | null = null;
    const sourceSlide = slides.find((s) => s.id === sourceSlideId);
    if (sourceSlide) {
      for (const row of sourceSlide.rows) {
        if (row.blocks.find((b) => b.id === sourceBlockId)) {
          sourceRowId = row.id;
          break;
        }
      }
    }

    if (!sourceRowId) return;

    // Case 1: Dropped on a row
    if (overData?.type === "row") {
      const targetRowId = overData.rowId as string;
      const targetSlideId = overData.slideId as string;

      if (targetRowId === sourceRowId && targetSlideId === sourceSlideId) return;

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

      let targetRowId: string | null = null;
      const targetSlide = slides.find((s) => s.id === targetSlideId);
      if (targetSlide) {
        for (const row of targetSlide.rows) {
          if (row.blocks.find((b) => b.id === targetBlockId)) {
            targetRowId = row.id;
            break;
          }
        }
      }

      if (!targetRowId) return;

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
      const blockCollision = pointerCollisions.find(
        (c: any) => c.data?.droppableContainer?.data?.current?.type === "block"
      );
      if (blockCollision) return [blockCollision];
      return pointerCollisions;
    }
    return closestCenter(args);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Flexible Layout Editor</h1>
            <p className="text-gray-500 text-sm mt-1">
              Drag blocks between rows • Click + to add columns or rows
            </p>
          </div>
          <button
            onClick={() => dispatch(addSlide({}))}
            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
          >
            <span>+</span>
            <span>Add Slide</span>
          </button>
        </div>

        {/* All Slides */}
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-8">
            {slides.map((slide, index) => (
              <SlideCard
                key={slide.id}
                slide={slide}
                index={index}
                totalSlides={slides.length}
                onUpdateBlock={handleUpdateBlock}
                onAddBlockRight={handleAddBlockRight}
                onAddRowBelow={handleAddRowBelow}
                onDeleteRow={handleDeleteRow}
                onDeleteSlide={handleDeleteSlide}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeBlock && (
              <div className="bg-white border-2 border-blue-400 rounded-lg p-4 shadow-2xl opacity-90 max-w-[300px]">
                <div className="flex items-center gap-2 text-blue-600">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="9" y1="3" x2="9" y2="21" />
                  </svg>
                  <span className="text-sm font-medium">Moving block...</span>
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
