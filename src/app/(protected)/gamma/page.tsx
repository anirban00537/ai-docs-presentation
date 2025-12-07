"use client";

import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";

// --- Types ---
export type BlockType = "text" | "image" | "video";

export interface Block {
  id: string;
  type: BlockType;
  content: string;
}

export interface Column {
  id: string;
  blocks: Block[];
  width?: number; // Flex grow/shrink factor or percentage
}

export interface Row {
  id: string;
  columns: Column[];
}

// --- Initial Data ---
const initialData: Row[] = [
  {
    id: "row-1",
    columns: [
      {
        id: "col-1",
        width: 1.5,
        blocks: [
          { id: "block-1", type: "text", content: "## Gamma-Like Layout Engine" },
          { id: "block-2", type: "text", content: "This is a prototype of a fluid grid layout engine." },
        ],
      },
      {
        id: "col-2",
        width: 1,
        blocks: [
          { id: "block-3", type: "text", content: "Try dragging blocks between columns!" },
          { id: "block-img-1", type: "image", content: "🖼️ Placeholder Image" },
        ],
      },
    ],
  },
  {
    id: "row-2",
    columns: [
      {
        id: "col-3",
        width: 1,
        blocks: [
          { id: "block-4", type: "text", content: "### Implementation Plan" },
        ],
      },
    ],
  },
  {
      id: "row-3",
      columns: [
          {
              id: "col-4",
              width: 1,
              blocks: [
                  { id: "block-5", type: "text", content: "1. Data Structure (Rows > Cols > Blocks) ✅" },
                  { id: "block-6", type: "text", content: "2. Drag & Drop Reordering ✅" },
                  { id: "block-7", type: "text", content: "3. Column Resizing ✅" },
              ]
          },
          {
              id: "col-5",
              width: 1,
              blocks: [
                  { id: "block-8", type: "text", content: "4. Content Rendering" },
                  { id: "block-9", type: "text", content: "5. Polish & Animations" },
              ]
          }
      ]
  }
];

// --- Components ---

const SortableBlock = ({ block }: { block: Block }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, data: { type: "block", block } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-blue-400 cursor-grab active:cursor-grabbing group item-block"
    >
      <div className="text-sm text-gray-800">{block.content}</div>
    </div>
  );
};

const ResizeHandle = ({ onResize }: { onResize: (delta: number) => void }) => {
  const [isResizing, setIsResizing] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    
    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = moveEvent.clientX - startX;
      onResize(delta);
    };

    const handlePointerUp = () => {
      setIsResizing(false);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      className={`absolute right-0 top-0 bottom-0 w-1 cursor-col-resize z-50 hover:bg-blue-400 transition-colors ${
        isResizing ? "bg-blue-600" : "bg-transparent"
      }`}
    />
  );
};

const SortableColumn = ({
  column,
  onResize,
  onAddBlock,
  isLast,
}: {
  column: Column;
  onResize?: (delta: number) => void;
  onAddBlock?: (colId: string) => void;
  isLast?: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id, data: { type: "column", column } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : "flex 0.1s ease-out", // Smooth resize, instant drag
    flex: column.width || 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-2 p-2 rounded-lg border border-transparent hover:border-dashed hover:border-gray-300 hover:bg-gray-50/50 min-h-[100px] group/col transition-all ${
        isDragging ? "border-dashed border-gray-300 bg-gray-50/50" : ""
      }`}
    >
      <div
        className="text-xs font-mono text-gray-300 opacity-0 group-hover/col:opacity-100 mb-2 cursor-grab flex justify-between items-center transition-opacity"
        {...attributes}
        {...listeners}
      >
        <span>COL</span>
        <div className="w-4 h-4 rounded hover:bg-gray-200" />
      </div>

      <SortableContext
        items={column.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[50px]">
          {column.blocks.map((block) => (
            <SortableBlock key={block.id} block={block} />
          ))}
        </div>
      </SortableContext>
      
      {onAddBlock && (
        <button 
           onClick={() => onAddBlock(column.id)}
           className="mt-2 text-xs text-gray-400 hover:text-blue-500 py-1 px-2 rounded hover:bg-blue-50 w-full text-center border border-transparent hover:border-blue-200 transition-all opacity-0 group-hover/col:opacity-100"
        >
          + Add Block
        </button>
      )}
      
      {!isLast && onResize && <ResizeHandle onResize={onResize} />}
    </div>
  );
};

const SortableRow = ({ row, onResizeColumn, onAddBlock, onAddColumn }: { 
    row: Row; 
    onResizeColumn: (colId: string, delta: number) => void; 
    onAddBlock: (colId: string) => void;
    onAddColumn: (rowId: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id, data: { type: "row", row } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex gap-4 p-2 pl-8 rounded-xl transition-all min-h-[120px] border border-transparent hover:border-gray-200 hover:bg-white hover:shadow-sm ${
          isDragging ? "bg-gray-50 border-gray-200" : ""
      }`}
    >
      {/* Row Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-12 flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <div className="w-1.5 h-6 bg-gray-200 hover:bg-gray-400 rounded-full transition-colors" />
      </div>

      <SortableContext
        items={row.columns.map((c) => c.id)}
        strategy={horizontalListSortingStrategy}
      >
        {row.columns.map((column, index) => (
          <SortableColumn
            key={column.id}
            column={column}
            isLast={index === row.columns.length - 1}
            onResize={(delta) => onResizeColumn(column.id, delta)}
            onAddBlock={onAddBlock}
          />
        ))}
      </SortableContext>

      {/* Add Column Button */}
      <div className="flex items-center justify-center w-8 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
            onClick={() => onAddColumn(row.id)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-blue-100 text-gray-400 hover:text-blue-500 transition-colors"
            title="Add Column"
         >
            +
         </button>
      </div>
    </div>
  );
};

const Page = () => {
  const [layout, setLayout] = useState<Row[]>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Helpers ---

  const findContainer = (id: string, layout: Row[]) => {
    // Check if it's a block
    for (const row of layout) {
      for (const col of row.columns) {
        if (col.blocks.find((b) => b.id === id)) {
          return col.id;
        }
        if (col.id === id) {
          // It's a column, so its container is a row.
          // BUT for sortable context of blocks, sometimes we return the column id itself if we are looking for where a block belongs.
          return col.id;
        }
      }
    }
    return null;
  };
  
  const handleResizeColumn = (rowId: string, colId: string, delta: number) => {
     setLayout(prev => {
        // Correct immutable update
        return prev.map(row => {
            if (row.id !== rowId) return row;
            
            const colIndex = row.columns.findIndex(c => c.id === colId);
            if (colIndex === -1 || colIndex === row.columns.length - 1) return row;
            
            const newColumns = [...row.columns];
            const col = { ...newColumns[colIndex] };
            const nextCol = { ...newColumns[colIndex + 1] };
            
            const sensitivity = 0.005; 
            const flexDelta = delta * sensitivity;
            
            const newColWidth = Math.max(0.2, (col.width || 1) + flexDelta);
            const newNextColWidth = Math.max(0.2, (nextCol.width || 1) - flexDelta);
            
            if ((col.width || 1) + flexDelta > 0.2 && (nextCol.width || 1) - flexDelta > 0.2) {
                 col.width = newColWidth;
                 nextCol.width = newNextColWidth;
                 
                 newColumns[colIndex] = col;
                 newColumns[colIndex + 1] = nextCol;
                 
                 return { ...row, columns: newColumns };
            }
            
            return row;
        });
     });
  };

  const handleAddBlock = (colId: string) => {
      setLayout(prev => {
          return prev.map(row => {
             const col = row.columns.find(c => c.id === colId);
             if (!col) return row;
             
             return {
                 ...row,
                 columns: row.columns.map(c => {
                     if (c.id !== colId) return c;
                     return {
                         ...c,
                         blocks: [...c.blocks, {
                             id: nanoid(),
                             type: 'text' as BlockType,
                             content: 'New Block'
                         }]
                     };
                 })
             };
          });
      });
  };
  
  const handleAddColumn = (rowId: string) => {
      setLayout(prev => {
          return prev.map(row => {
              if (row.id !== rowId) return row;
              return {
                  ...row,
                  columns: [...row.columns, {
                      id: nanoid(),
                      width: 1,
                      blocks: [{ id: nanoid(), type: 'text' as BlockType, content: 'New Column Content' }]
                  }]
              };
          });
      });
  };
  
  const handleAddRow = () => {
      setLayout(prev => [
          ...prev, 
          {
              id: nanoid(),
              columns: [
                  { id: nanoid(), width: 1, blocks: [{ id: nanoid(), type: 'text' as BlockType, content: 'New Row Content' }]}
              ]
          }
      ]);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // We only care about Block-level drag over here for moving between columns
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "block" && (overType === "block" || overType === "column")) {
      // Find source and dest columns
      const activeContainerId = findContainer(String(active.id), layout);
      const overContainerId =
        overType === "column"
          ? String(over.id)
          : findContainer(String(over.id), layout);

      if (
        !activeContainerId ||
        !overContainerId ||
        activeContainerId === overContainerId
      ) {
        return;
      }

      // Move logic during drag (visual update)
      setLayout((prev) => {
        const activeRow = prev.find((r) =>
          r.columns.find((c) => c.id === activeContainerId)
        );
        const overRow = prev.find((r) =>
          r.columns.find((c) => c.id === overContainerId)
        );

        if (!activeRow || !overRow) return prev;

        // Need deep clone to avoid mutation issues in strict mode
        // Though for dragOver visual feedback, we often accept some mutation for perf, 
        // let's do it cleaner to be safe.
        const newLayout = prev.map(r => ({
            ...r,
            columns: r.columns.map(c => ({
                ...c,
                blocks: [...c.blocks]
            }))
        }));

        const srcRowIdx = newLayout.findIndex((r) => r.id === activeRow.id);
        const dstRowIdx = newLayout.findIndex((r) => r.id === overRow.id);

        const srcCol = newLayout[srcRowIdx].columns.find(
          (c) => c.id === activeContainerId
        )!;
        const dstCol = newLayout[dstRowIdx].columns.find(
          (c) => c.id === overContainerId
        )!;
        
        const activeIndex = srcCol.blocks.findIndex(b => b.id === active.id);
        if (activeIndex === -1) return prev; // Should not trigger

        const [movedBlock] = srcCol.blocks.splice(activeIndex, 1);
        
        const overIndex =
          overType === "column"
            ? dstCol.blocks.length // Add to end if over column
            : dstCol.blocks.findIndex((b) => b.id === over.id);

        let newIndex;
         if (overType === "block") {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          newIndex =
            overIndex >= 0 ? overIndex + modifier : dstCol.blocks.length;
        } else {
          newIndex = dstCol.blocks.length;
        }

        dstCol.blocks.splice(newIndex, 0, movedBlock);

        return newLayout;
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;
    const overType = over?.data.current?.type;

    setActiveId(null);

    if (!over) return;

    if (active.id === over.id) return;

    // 1. Row Reordering
    if (activeType === "row" && overType === "row") {
      setLayout((prev) => {
        const oldIndex = prev.findIndex((r) => r.id === active.id);
        const newIndex = prev.findIndex((r) => r.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
      return;
    }

    // 2. Column Reordering
    if (activeType === "column" && overType === "column") {
      const activeRowId = layout.find((r) =>
        r.columns.find((c) => c.id === active.id)
      )?.id;
      const overRowId = layout.find((r) =>
        r.columns.find((c) => c.id === over.id)
      )?.id;

      if (activeRowId && activeRowId === overRowId) {
        setLayout((prev) => {
          // deep clone Row specifically or map
          return prev.map(row => {
              if (row.id !== activeRowId) return row;
              
              const oldIndex = row.columns.findIndex(c => c.id === active.id);
              const newIndex = row.columns.findIndex(c => c.id === over.id);
              
              return {
                  ...row,
                  columns: arrayMove(row.columns, oldIndex, newIndex)
              };
          });
        });
      }
      return;
    }

    // 3. Block Reordering (Same Column)
    if (activeType === "block" && overType === "block") {
      const activeContainerId = findContainer(String(active.id), layout);
      const overContainerId = findContainer(String(over.id), layout);

      if (activeContainerId && activeContainerId === overContainerId) {
        setLayout((prev) => {
           return prev.map(row => {
               const col = row.columns.find(c => c.id === activeContainerId);
               if (!col) return row;
               
               return {
                   ...row,
                   columns: row.columns.map(c => {
                       if (c.id !== activeContainerId) return c;
                       
                       const oldIndex = c.blocks.findIndex(b => b.id === active.id);
                       const newIndex = c.blocks.findIndex(b => b.id === over.id);
                       
                       return {
                           ...c,
                           blocks: arrayMove(c.blocks, oldIndex, newIndex)
                       }
                   })
               }
           });
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white p-12 font-sans text-gray-900 overflow-y-auto">
      <div className="max-w-5xl mx-auto pb-40">
        <header className="mb-12 border-b pb-8">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">
            Gamma Layout Engine
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl">
            A flexible, fluid grid system. Drag the handle on the left to
            reorder rows. Drag column headers to reorder columns. Drag blocks to
            move content.
          </p>
        </header>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col gap-4 min-h-[500px]">
            <SortableContext
              items={layout.map((r) => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {layout.map((row) => (
                <SortableRow 
                    key={row.id} 
                    row={row} 
                    onResizeColumn={(colId, delta) => handleResizeColumn(row.id, colId, delta)}
                    onAddBlock={handleAddBlock}
                    onAddColumn={handleAddColumn}
                />
              ))}
            </SortableContext>
            
            <button 
                onClick={handleAddRow}
                className="py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all font-medium"
            >
                + Add New Row
            </button>
          </div>

          <DragOverlay>
            {activeId ? (
              <div className="p-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl opacity-90 w-[300px]">
                Dragging Item...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default Page;
