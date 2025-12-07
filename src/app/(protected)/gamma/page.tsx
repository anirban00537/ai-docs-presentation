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
  useDraggable,
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
  addRowWithColumns,
  addBlockToRow,
  deleteRow,
  moveBlock,
  Block,
  Row,
  Slide,
} from "@/store/slices/slidesSlice";

// --- Layout Option Icons ---
const TwoColumnIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="16" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="22" y="2" width="16" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const ThreeColumnIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="15" y="2" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="28" y="2" width="10" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const FourColumnIcon = () => (
  <svg width="40" height="28" viewBox="0 0 40 28" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="7" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="12" y="2" width="7" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="22" y="2" width="7" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="32" y="2" width="6" height="24" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
  </svg>
);

const SmartLayoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
  </svg>
);

// --- Draggable Layout Option ---
const DraggableLayoutOption = ({
  id,
  columnCount,
  icon,
  label,
}: {
  id: string;
  columnCount: number;
  icon: React.ReactNode;
  label: string;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: "layout-option", columnCount },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl cursor-grab active:cursor-grabbing transition-all border-2 ${
        isDragging
          ? "border-blue-400 bg-blue-50 shadow-lg scale-105"
          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
      }`}
    >
      <div className="text-gray-600">{icon}</div>
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
  );
};

// --- Slide Drop Zone ---
const SlideDropZone = ({
  slideId,
  isOver,
}: {
  slideId: string;
  isOver: boolean;
}) => {
  return (
    <div
      className={`w-full h-16 mt-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center ${
        isOver
          ? "border-blue-400 bg-blue-50"
          : "border-gray-300 bg-gray-50/50"
      }`}
    >
      <span className={`text-sm font-medium ${isOver ? "text-blue-600" : "text-gray-400"}`}>
        {isOver ? "Drop to add row" : "Drag layout here"}
      </span>
    </div>
  );
};

// --- Draggable Block Component ---
const DraggableBlock = ({
  block,
  slideId,
  rowId,
  onUpdate,
  onAddColumn,
}: {
  block: Block;
  slideId: string;
  rowId: string;
  onUpdate: (blockId: string, content: any) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
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
        className={`relative p-2 rounded-lg transition-all border-2 ${
          isDragging 
            ? "bg-blue-50 border-blue-300" 
            : "border-transparent hover:border-gray-300 hover:bg-gray-50/30"
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

        {/* Add Column Button - Right Side */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddColumn(rowId, block.id);
          }}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-blue-500 text-white opacity-0 group-hover:opacity-100 hover:bg-blue-600 hover:scale-110 transition-all z-20 flex items-center justify-center shadow-md"
          title="Add column"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </button>

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
    </div>
  );
};

// --- Droppable Row Component ---
const DroppableRow = ({
  row,
  slideId,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  rowCount,
}: {
  row: Row;
  slideId: string;
  onUpdateBlock: (blockId: string, content: any) => void;
  onDeleteRow: (rowId: string) => void;
  onAddColumn: (rowId: string, afterBlockId: string) => void;
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
              rowId={row.id}
              onUpdate={onUpdateBlock}
              onAddColumn={onAddColumn}
            />
          ))}
        </SortableContext>
      </div>

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
  onDeleteRow,
  onAddColumn,
  onDeleteSlide,
  isLayoutDragging,
  activeLayoutSlideId,
}: {
  slide: Slide;
  index: number;
  totalSlides: number;
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  onDeleteSlide: (slideId: string) => void;
  isLayoutDragging: boolean;
  activeLayoutSlideId: string | null;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `slide-drop-${slide.id}`,
    data: { type: "slide-drop-zone", slideId: slide.id },
  });

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
            onDeleteRow={(rowId) => onDeleteRow(slide.id, rowId)}
            onAddColumn={(rowId, afterBlockId) => onAddColumn(slide.id, rowId, afterBlockId)}
            rowCount={slide.rows.length}
          />
        ))}
      </div>

      {/* Drop Zone for Layout */}
      {isLayoutDragging && (
        <div ref={setNodeRef}>
          <SlideDropZone slideId={slide.id} isOver={isOver} />
        </div>
      )}
    </div>
  );
};

// --- Smart Layout Panel ---
const SmartLayoutPanel = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-14 top-0 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Smart Layout</h3>
        <button
          onClick={onClose}
          className="w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          ×
        </button>
      </div>
      <p className="text-xs text-gray-500 mb-4">
        Drag a layout to add a new row
      </p>
      <div className="flex flex-col gap-3">
        <DraggableLayoutOption
          id="layout-2-col"
          columnCount={2}
          icon={<TwoColumnIcon />}
          label="2 Columns"
        />
        <DraggableLayoutOption
          id="layout-3-col"
          columnCount={3}
          icon={<ThreeColumnIcon />}
          label="3 Columns"
        />
        <DraggableLayoutOption
          id="layout-4-col"
          columnCount={4}
          icon={<FourColumnIcon />}
          label="4 Columns"
        />
      </div>
    </div>
  );
};

// --- Floating Sidebar ---
const FloatingSidebar = ({
  isLayoutPanelOpen,
  onToggleLayoutPanel,
}: {
  isLayoutPanelOpen: boolean;
  onToggleLayoutPanel: () => void;
}) => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40">
      <div className="relative">
        <SmartLayoutPanel isOpen={isLayoutPanelOpen} onClose={onToggleLayoutPanel} />
        <div className="flex flex-col gap-2 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80">
          <button
            onClick={onToggleLayoutPanel}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              isLayoutPanelOpen
                ? "bg-blue-500 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
            }`}
            title="Smart Layout"
          >
            <SmartLayoutIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
const GammaPage = () => {
  const dispatch = useAppDispatch();
  const slides = useAppSelector(selectSlides);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [isLayoutPanelOpen, setIsLayoutPanelOpen] = useState(false);
  const [isLayoutDragging, setIsLayoutDragging] = useState(false);
  const [draggingLayoutColumnCount, setDraggingLayoutColumnCount] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Handlers ---
  const handleUpdateBlock = (slideId: string, blockId: string, content: any) => {
    dispatch(updateBlockContent({ slideId, blockId, content }));
  };

  const handleDeleteRow = (slideId: string, rowId: string) => {
    dispatch(deleteRow({ slideId, rowId }));
  };

  const handleDeleteSlide = (slideId: string) => {
    dispatch(deleteSlide(slideId));
  };

  const handleAddColumn = (slideId: string, rowId: string, afterBlockId: string) => {
    dispatch(addBlockToRow({ slideId, rowId, afterBlockId }));
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
    
    // Reset layout dragging state
    if (isLayoutDragging) {
      setIsLayoutDragging(false);
      
      // Handle layout drop
      if (over && draggingLayoutColumnCount) {
        const overData = over.data.current;
        if (overData?.type === "slide-drop-zone") {
          const slideId = overData.slideId as string;
          dispatch(addRowWithColumns({ slideId, columnCount: draggingLayoutColumnCount }));
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
      // Prioritize slide drop zones when dragging layouts
      if (isLayoutDragging) {
        const slideDropZone = pointerCollisions.find(
          (c: any) => c.data?.droppableContainer?.data?.current?.type === "slide-drop-zone"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
      <div className="max-w-[1200px] mx-auto p-8 pr-20">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Flexible Layout Editor</h1>
            <p className="text-gray-500 text-sm mt-1">
              Drag blocks between rows • Use Smart Layout to add columns
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
                onDeleteRow={handleDeleteRow}
                onAddColumn={handleAddColumn}
                onDeleteSlide={handleDeleteSlide}
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
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <span className="text-sm font-medium">{draggingLayoutColumnCount} Columns</span>
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
