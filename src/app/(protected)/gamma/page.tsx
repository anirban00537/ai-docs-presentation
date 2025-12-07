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
export type BlockType = "block"; // Simplified from "text" | "image" | "video"

export interface Block {
  id: string;
  type: BlockType;
  content: any; // Checked: Yoopta JSON
}

export interface Column {
  id: string;
  blocks: Block[];
  width?: number;
}

export interface Row {
  id: string;
  columns: Column[];
}

// --- Initial Data ---
// --- Initial Data ---
// --- Initial Data ---
const initialData: Row[] = [
  {
    id: nanoid(),
    columns: [
      {
        id: nanoid(),
        width: 1,
        blocks: [
          {
            id: nanoid(),
            type: "block",
            content: undefined,
          },
        ],
      },
    ],
  },
];

// --- Components ---
import { YooptaEditorWrapper } from "@/components/editor/yoopta-editor";

const SortableBlock = ({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (id: string, content: any) => void;
}) => {
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
      className="group relative border border-transparent rounded-sm item-block min-h-[24px] hover:bg-gray-50/50 transition-colors"
    >
      {/* Drag Handle - Visible on Hover - Minimal */}
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-3 top-0 bottom-0 w-3 cursor-grab flex items-start pt-[6px] justify-center opacity-0 group-hover:opacity-100 z-10 text-gray-300 hover:text-gray-500 transition-all"
      >
        ⋮
      </div>

      <YooptaEditorWrapper
        value={block.content}
        onChange={(val) => onUpdate(block.id, val)}
        placeholder="Type '/' for commands..."
        className="min-h-[20px] px-1 py-1"
      />
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
      onResize(moveEvent.clientX - startX);
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
  onUpdateBlock,
  isLast,
}: {
  column: Column;
  onResize?: (delta: number) => void;
  onUpdateBlock: (id: string, content: string) => void;
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
    transition: isDragging ? undefined : "flex 0.1s ease-out",
    flex: column.width || 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col p-0 min-h-[50px] min-w-0 group/col transition-all border border-transparent hover:border-dashed hover:border-gray-300 ${
        isDragging ? "bg-gray-50/50" : ""
      }`}
    >
      {/* Column Drag Handle - Top Pill on Hover */}
      <div
        className="h-1.5 w-8 cursor-grab opacity-0 group-hover/col:opacity-100 bg-gray-200 hover:bg-gray-400 absolute top-0 left-1/2 -translate-x-1/2 z-10 rounded-b-sm transition-all"
        {...attributes}
        {...listeners}
      />

      <SortableContext
        items={column.blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col min-h-[40px] pt-3 pb-2">
          {column.blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              onUpdate={onUpdateBlock}
            />
          ))}
        </div>
      </SortableContext>

      {!isLast && onResize && <ResizeHandle onResize={onResize} />}
    </div>
  );
};

const SortableRow = ({
  row,
  onResizeColumn,
  onAddColumn,
  onUpdateBlock,
}: {
  row: Row;
  onResizeColumn: (colId: string, delta: number) => void;
  onAddColumn: (rowId: string) => void;
  onUpdateBlock: (id: string, content: string) => void;
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
      className={`group relative flex gap-4 p-1 pl-6 transition-all min-h-[50px] border border-transparent hover:border-gray-100 ${
        isDragging ? "bg-gray-50" : ""
      }`}
    >
      {/* Row Drag Handle - Minimal strip on left */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 bottom-0 w-4 cursor-grab flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-gray-50 transition-all z-10"
      >
        <div className="w-1 h-4 bg-gray-300 rounded-full" />
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
            onUpdateBlock={onUpdateBlock}
          />
        ))}
      </SortableContext>

      {/* Add Column Button - On Right Border */}
      <div className="absolute right-0 top-0 bottom-0 w-0 group-hover:w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-20 translate-x-1/2">
        <button
          onClick={() => onAddColumn(row.id)}
          className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 shadow-sm text-xs transition-transform hover:scale-110"
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
    setLayout((prev) => {
      // Correct immutable update
      return prev.map((row) => {
        if (row.id !== rowId) return row;

        const colIndex = row.columns.findIndex((c) => c.id === colId);
        if (colIndex === -1 || colIndex === row.columns.length - 1) return row;

        const newColumns = [...row.columns];
        const col = { ...newColumns[colIndex] };
        const nextCol = { ...newColumns[colIndex + 1] };

        const sensitivity = 0.005;
        const flexDelta = delta * sensitivity;

        const newColWidth = Math.max(0.2, (col.width || 1) + flexDelta);
        const newNextColWidth = Math.max(0.2, (nextCol.width || 1) - flexDelta);

        if (
          (col.width || 1) + flexDelta > 0.2 &&
          (nextCol.width || 1) - flexDelta > 0.2
        ) {
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

  const handleAddColumn = (rowId: string) => {
    setLayout((prev) => {
      return prev.map((row) => {
        if (row.id !== rowId) return row;
        if (row.columns.length >= 3) return row; // Max 3 columns

        return {
          ...row,
          columns: [
            ...row.columns,
            {
              id: nanoid(),
              width: 1,
              blocks: [
                { id: nanoid(), type: "block" as BlockType, content: "" },
              ],
            },
          ],
        };
      });
    });
  };

  const handleUpdateBlock = (id: string, content: any) => {
    setLayout((prev) => {
      return prev.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          blocks: col.blocks.map((block) => {
            if (block.id !== id) return block;
            return { ...block, content };
          }),
        })),
      }));
    });
  };

  const handleAddRow = () => {
    setLayout((prev) => [
      ...prev,
      {
        id: nanoid(),
        columns: [
          {
            id: nanoid(),
            width: 1,
            blocks: [{ id: nanoid(), type: "block" as BlockType, content: "" }],
          },
        ],
      },
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

    if (
      activeType === "block" &&
      (overType === "block" || overType === "column")
    ) {
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
        const newLayout = prev.map((r) => ({
          ...r,
          columns: r.columns.map((c) => ({
            ...c,
            blocks: [...c.blocks],
          })),
        }));

        const srcRowIdx = newLayout.findIndex((r) => r.id === activeRow.id);
        const dstRowIdx = newLayout.findIndex((r) => r.id === overRow.id);

        const srcCol = newLayout[srcRowIdx].columns.find(
          (c) => c.id === activeContainerId
        )!;
        const dstCol = newLayout[dstRowIdx].columns.find(
          (c) => c.id === overContainerId
        )!;

        const activeIndex = srcCol.blocks.findIndex((b) => b.id === active.id);
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
          return prev.map((row) => {
            if (row.id !== activeRowId) return row;

            const oldIndex = row.columns.findIndex((c) => c.id === active.id);
            const newIndex = row.columns.findIndex((c) => c.id === over.id);

            return {
              ...row,
              columns: arrayMove(row.columns, oldIndex, newIndex),
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
          return prev.map((row) => {
            const col = row.columns.find((c) => c.id === activeContainerId);
            if (!col) return row;

            return {
              ...row,
              columns: row.columns.map((c) => {
                if (c.id !== activeContainerId) return c;

                const oldIndex = c.blocks.findIndex((b) => b.id === active.id);
                const newIndex = c.blocks.findIndex((b) => b.id === over.id);

                return {
                  ...c,
                  blocks: arrayMove(c.blocks, oldIndex, newIndex),
                };
              }),
            };
          });
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans text-gray-900 overflow-y-auto">
      <div className="w-full max-w-[1200px] mx-auto bg-white shadow-2xl border border-gray-200 rounded-xl px-16 py-12 min-h-[600px]">
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
                  onResizeColumn={(colId, delta) =>
                    handleResizeColumn(row.id, colId, delta)
                  }
                  onAddColumn={handleAddColumn}
                  onUpdateBlock={handleUpdateBlock}
                />
              ))}
            </SortableContext>

            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
              <button
                onClick={handleAddRow}
                className="flex-1 py-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium"
              >
                + Add New Row
              </button>
            </div>

            {/* JSON Data Editor */}
            <div className="mt-12 border-t pt-8">
              <h3 className="text-xl font-bold mb-4">Layout Data (JSON)</h3>
              <p className="text-sm text-gray-500 mb-2">
                Edit this JSON to update the layout instantly.
              </p>
              <textarea
                className="w-full h-[300px] p-4 font-mono text-xs bg-gray-900 text-green-400 rounded-xl"
                value={JSON.stringify(layout, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    if (Array.isArray(parsed)) {
                      setLayout(parsed);
                    }
                  } catch (e) {
                    // Ignore parse errors while typing
                  }
                }}
              />
            </div>
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
