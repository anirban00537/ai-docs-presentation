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
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import { YooptaEditorWrapper } from "@/components/editor/yoopta-editor";

// --- Types ---
interface Block {
  id: string;
  content: any;
}

interface Row {
  id: string;
  blocks: Block[];
}

// --- Default Yoopta content structure ---
const createDefaultContent = () => {
  const blockId = nanoid();
  return {
    [blockId]: {
      id: blockId,
      type: "Paragraph",
      value: [
        {
          id: nanoid(),
          type: "paragraph",
          children: [{ text: "" }],
        },
      ],
      meta: { order: 0, depth: 0 },
    },
  };
};

// --- Initial Data ---
const createBlock = (): Block => ({ id: nanoid(), content: createDefaultContent() });
const createRow = (blocks?: Block[]): Row => ({
  id: nanoid(),
  blocks: blocks || [createBlock()],
});

// --- Draggable Block Component ---
const DraggableBlock = ({
  block,
  onUpdate,
  onAddRight,
  isOnly,
}: {
  block: Block;
  onUpdate: (id: string, content: any) => void;
  onAddRight: () => void;
  isOnly: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { type: "block", block },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    minWidth: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative min-w-0 flex-1"
    >
      {/* Block Container */}
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

      {/* Add Column Button (Right) */}
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
  onUpdateBlock,
  onAddBlockRight,
  onAddRowBelow,
  onDeleteRow,
  rowCount,
}: {
  row: Row;
  onUpdateBlock: (id: string, content: any) => void;
  onAddBlockRight: (rowId: string, afterBlockId: string) => void;
  onAddRowBelow: (rowId: string) => void;
  onDeleteRow: (rowId: string) => void;
  rowCount: number;
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-drop-${row.id}`,
    data: { type: "row", rowId: row.id },
  });

  return (
    <div className="group/row relative">
      {/* Row Container */}
      <div
        ref={setNodeRef}
        className={`flex gap-4 p-2 rounded-lg transition-all items-start ${
          isOver
            ? "bg-green-50 ring-2 ring-dashed ring-green-400"
            : "hover:bg-gray-50/30"
        }`}
      >
        <SortableContext
          items={row.blocks.map((b) => b.id)}
          strategy={horizontalListSortingStrategy}
        >
          {row.blocks.map((block, index) => (
            <DraggableBlock
              key={block.id}
              block={block}
              onUpdate={onUpdateBlock}
              onAddRight={() => onAddBlockRight(row.id, block.id)}
              isOnly={row.blocks.length === 1}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Row Button (Bottom) */}
      <button
        onClick={() => onAddRowBelow(row.id)}
        className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-6 px-3 rounded-full bg-blue-500 text-white opacity-0 group-hover/row:opacity-100 hover:bg-blue-600 hover:scale-105 transition-all z-20 flex items-center justify-center text-xs font-medium shadow-md gap-1"
        title="Add row below"
      >
        <span>+</span>
        <span>Row</span>
      </button>

      {/* Delete Row Button (only if more than one row and row is empty or hovered) */}
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

// --- Main Page Component ---
const GammaPage = () => {
  const [rows, setRows] = useState<Row[]>([createRow()]);
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- Handlers ---

  const handleUpdateBlock = (blockId: string, content: any) => {
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        blocks: row.blocks.map((block) =>
          block.id === blockId ? { ...block, content } : block
        ),
      }))
    );
  };

  const handleAddBlockRight = (rowId: string, afterBlockId: string) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const index = row.blocks.findIndex((b) => b.id === afterBlockId);
        const newBlocks = [...row.blocks];
        newBlocks.splice(index + 1, 0, createBlock());
        return { ...row, blocks: newBlocks };
      })
    );
  };

  const handleAddRowBelow = (afterRowId: string) => {
    setRows((prev) => {
      const index = prev.findIndex((r) => r.id === afterRowId);
      const newRows = [...prev];
      newRows.splice(index + 1, 0, createRow());
      return newRows;
    });
  };

  const handleDeleteRow = (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
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

    const activeBlockId = String(active.id);
    const overData = over.data.current;

    // Find the source row and block
    let sourceRowId: string | null = null;
    let sourceBlock: Block | null = null;

    for (const row of rows) {
      const block = row.blocks.find((b) => b.id === activeBlockId);
      if (block) {
        sourceRowId = row.id;
        sourceBlock = block;
        break;
      }
    }

    if (!sourceRowId || !sourceBlock) return;

    // Case 1: Dropped on a row (different from source) - Add as new column
    if (overData?.type === "row") {
      const targetRowId = overData.rowId;
      if (targetRowId === sourceRowId) return; // Same row, no action

      setRows((prev) => {
        // Remove from source
        const newRows = prev.map((row) => {
          if (row.id === sourceRowId) {
            return {
              ...row,
              blocks: row.blocks.filter((b) => b.id !== activeBlockId),
            };
          }
          return row;
        });

        // Add to target row as new column
        return newRows
          .map((row) => {
            if (row.id === targetRowId) {
              return {
                ...row,
                blocks: [...row.blocks, sourceBlock!],
              };
            }
            return row;
          })
          .filter((row) => row.blocks.length > 0); // Remove empty rows
      });
      return;
    }

    // Case 2: Dropped on another block - Reorder within/across rows
    if (overData?.type === "block") {
      const targetBlockId = String(over.id);
      if (activeBlockId === targetBlockId) return;

      // Find target row
      let targetRowId: string | null = null;
      let targetIndex: number = -1;

      for (const row of rows) {
        const idx = row.blocks.findIndex((b) => b.id === targetBlockId);
        if (idx !== -1) {
          targetRowId = row.id;
          targetIndex = idx;
          break;
        }
      }

      if (!targetRowId) return;

      // Same row - just reorder
      if (sourceRowId === targetRowId) {
        setRows((prev) =>
          prev.map((row) => {
            if (row.id !== sourceRowId) return row;
            const blocks = [...row.blocks];
            const oldIndex = blocks.findIndex((b) => b.id === activeBlockId);
            const newIndex = blocks.findIndex((b) => b.id === targetBlockId);
            const [removed] = blocks.splice(oldIndex, 1);
            blocks.splice(newIndex, 0, removed);
            return { ...row, blocks };
          })
        );
      } else {
        // Different row - move block
        setRows((prev) => {
          // Remove from source
          let movedBlock: Block | null = null;
          const newRows = prev.map((row) => {
            if (row.id === sourceRowId) {
              movedBlock = row.blocks.find((b) => b.id === activeBlockId)!;
              return {
                ...row,
                blocks: row.blocks.filter((b) => b.id !== activeBlockId),
              };
            }
            return row;
          });

          // Add to target row at specific position
          return newRows
            .map((row) => {
              if (row.id === targetRowId && movedBlock) {
                const blocks = [...row.blocks];
                const insertIndex = blocks.findIndex(
                  (b) => b.id === targetBlockId
                );
                blocks.splice(insertIndex, 0, movedBlock);
                return { ...row, blocks };
              }
              return row;
            })
            .filter((row) => row.blocks.length > 0);
        });
      }
    }
  };

  // Custom collision detection that prefers blocks over rows
  const customCollisionDetection = (args: any) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      // Prefer block collisions over row collisions
      const blockCollision = pointerCollisions.find(
        (c: any) => c.data?.droppableContainer?.data?.current?.type === "block"
      );
      if (blockCollision) return [blockCollision];
      return pointerCollisions;
    }
    return closestCenter(args);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="max-w-[1200px] mx-auto mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Flexible Layout Editor</h1>
        <p className="text-gray-500 text-sm mt-1">
          Drag blocks between rows • Click + to add columns or rows
        </p>
      </div>

      {/* Editor Canvas */}
      <div className="max-w-[1200px] mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 px-6 py-4">
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-6">
            {rows.map((row) => (
              <DroppableRow
                key={row.id}
                row={row}
                onUpdateBlock={handleUpdateBlock}
                onAddBlockRight={handleAddBlockRight}
                onAddRowBelow={handleAddRowBelow}
                onDeleteRow={handleDeleteRow}
                rowCount={rows.length}
              />
            ))}
          </div>

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
          </DragOverlay>
        </DndContext>
      </div>

      {/* JSON Control Panel */}
      <div className="max-w-[1200px] mx-auto mt-8 bg-gray-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-medium">Layout JSON</h3>
          <div className="flex gap-2">
            {/* Export Button */}
            <button
              onClick={() => {
                const dataStr = JSON.stringify(rows, null, 2);
                const blob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'layout.json';
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export JSON
            </button>
            {/* Import Button */}
            <label className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1.5 cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Import JSON
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (Array.isArray(data)) {
                          setRows(data);
                        }
                      } catch (err) {
                        console.error('Invalid JSON file');
                      }
                    };
                    reader.readAsText(file);
                  }
                  e.target.value = '';
                }}
              />
            </label>
            {/* Copy Button */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
              }}
              className="px-3 py-1.5 bg-gray-700 text-white text-xs font-medium rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy
            </button>
          </div>
        </div>
        <pre className="text-green-400 text-xs overflow-auto max-h-[300px] bg-gray-950 rounded-lg p-4">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default GammaPage;
