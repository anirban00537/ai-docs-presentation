import { useState, useCallback } from "react";
import {
  DragStartEvent,
  DragEndEvent,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import {
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Block, BlockContent, Row, SlideAccent, Theme } from "@/types/presentation";
import { DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createRow, createBlockInstance } from "../../presentation/[id]/editor/blocks/factories";
import { toast } from "sonner";
import { layoutsService, type LayoutTemplate } from "@/services/layouts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface LayoutData {
  rows: Row[];
  accent?: SlideAccent;
}

export interface CreateLayoutPayload {
  name: string;
  description?: string;
  thumbnail?: string;
  data: LayoutData;
  tags?: string[];
  type?: string;
}

export interface UpdateLayoutPayload extends CreateLayoutPayload {
  id: string;
}

// ============================================================================
// TANSTACK QUERY - QUERY KEYS
// ============================================================================

export const layoutKeys = {
  all: ["layouts"] as const,
  lists: () => [...layoutKeys.all, "list"] as const,
  list: (filters?: any) => [...layoutKeys.lists(), filters] as const,
  details: () => [...layoutKeys.all, "detail"] as const,
  detail: (id: string) => [...layoutKeys.details(), id] as const,
};

// ============================================================================
// TANSTACK QUERY - HOOKS
// ============================================================================

// Fetch all layouts
export function useLayouts() {
  return useQuery({
    queryKey: layoutKeys.list(),
    queryFn: async () => {
      const response = await layoutsService.getUserLayouts();
      // Handle both { success: true, data: [...] } and direct array response
      if (Array.isArray(response)) {
        return response as LayoutTemplate[];
      }
      return (response?.data || []) as LayoutTemplate[];
    },
  });
}

// Fetch single layout
export function useLayout(id: string | undefined) {
  return useQuery({
    queryKey: layoutKeys.detail(id!),
    queryFn: async () => {
      if (!id) throw new Error("Layout ID is required");
      const response = await layoutsService.getLayout(id);
      // Handle both { success: true, data: {...} } and direct object response
      if (response?.data) {
        return response.data as LayoutTemplate;
      }
      return response as LayoutTemplate;
    },
    enabled: !!id,
  });
}

// Create layout mutation
export function useCreateLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLayoutPayload) => {
      const response = await layoutsService.createLayout(payload);
      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.lists() });
      toast.success("Layout created successfully!");
      return data;
    },
    onError: (error: any) => {
      console.error("Error creating layout:", error);
      toast.error(error?.message || "Failed to create layout");
    },
  });
}

// Update layout mutation
export function useUpdateLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateLayoutPayload) => {
      const response = await layoutsService.updateLayout(id, payload);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.lists() });
      queryClient.invalidateQueries({ queryKey: layoutKeys.detail(variables.id) });
      toast.success("Layout updated successfully!");
      return data;
    },
    onError: (error: any) => {
      console.error("Error updating layout:", error);
      toast.error(error?.message || "Failed to update layout");
    },
  });
}

// Delete layout mutation
export function useDeleteLayout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await layoutsService.deleteLayout(id);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: layoutKeys.lists() });
      toast.success("Layout deleted successfully!");
    },
    onError: (error: any) => {
      console.error("Error deleting layout:", error);
      toast.error(error?.message || "Failed to delete layout");
    },
  });
}

// ============================================================================
// LAYOUT EDITOR HOOK
// ============================================================================

export interface LayoutMetadata {
  id?: string;
  name: string;
  description: string;
  thumbnail?: string;
  tags: string[];
  type: "admin" | "user";
  icon?: string;
}

interface UseLayoutEditorReturn {
  // State
  layoutData: LayoutData;
  layoutMetadata: LayoutMetadata;
  theme: Theme;
  isLoading: boolean;
  isSaving: boolean;

  // Drag and Drop
  sensors: ReturnType<typeof useSensors>;
  activeBlock: Block | null;
  isBlockDragging: boolean;
  draggingBlockType: string | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  customCollisionDetection: CollisionDetection;

  // Layout Operations
  handleUpdateBlock: (slideId: string, blockId: string, content: BlockContent) => void;
  handleDeleteRow: (slideId: string, rowId: string) => void;
  handleAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  handleAddRowAtTop: (slideId: string) => void;
  handleAddRowAtBottom: (slideId: string) => void;
  handleUpdateColumnWidths: (slideId: string, rowId: string, columnWidths: number[]) => void;
  handleUpdateAccent: (slideId: string, accent: SlideAccent | undefined) => void;

  // Metadata & Persistence
  handleUpdateMetadata: (updates: Partial<LayoutMetadata>) => void;
  handleSaveLayout: () => Promise<void>;
  handleLoadLayout: (layoutId: string) => Promise<void>;
  handleResetLayout: () => void;
}

const DEFAULT_METADATA: LayoutMetadata = {
  name: "Untitled Layout",
  description: "",
  tags: [],
  type: "admin",
  icon: "IconLayout",
};

export function useLayoutEditor(): UseLayoutEditorReturn {
  // State
  const [layoutData, setLayoutData] = useState<LayoutData>({
    rows: [createRow()],
  });
  const [layoutMetadata, setLayoutMetadata] = useState<LayoutMetadata>(DEFAULT_METADATA);
  const [theme] = useState<Theme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(false);

  // TanStack Query mutations
  const createLayoutMutation = useCreateLayout();
  const updateLayoutMutation = useUpdateLayout();

  const isSaving = createLayoutMutation.isPending || updateLayoutMutation.isPending;

  // Drag and Drop State
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(null);

  // Drag and Drop Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor)
  );

  // Custom Collision Detection
  const customCollisionDetection: CollisionDetection = useCallback((args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) return pointerCollisions;

    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) return rectCollisions;

    return closestCenter(args);
  }, []);

  // Drag Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;

    if (active.data.current?.type === "block") {
      setActiveBlock(active.data.current.block);
      setIsBlockDragging(false);
    } else if (active.data.current?.type === "block-type") {
      setIsBlockDragging(true);
      setDraggingBlockType(active.data.current.blockType);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) {
        setActiveBlock(null);
        setIsBlockDragging(false);
        setDraggingBlockType(null);
        return;
      }

      // Handle block type drag (from toolbar)
      if (active.data.current?.type === "block-type") {
        const blockType = active.data.current.blockType;

        if (over.data.current?.type === "row-insert") {
          const { insertIndex } = over.data.current;
          const newBlock = createBlockInstance(blockType);
          const newRow = createRow([newBlock]);

          setLayoutData((prev) => {
            const newRows = [...prev.rows];
            newRows.splice(insertIndex, 0, newRow);
            return { ...prev, rows: newRows };
          });
        } else if (over.data.current?.type === "column") {
          const { rowId } = over.data.current;
          const newBlock = createBlockInstance(blockType);

          setLayoutData((prev) => {
            const newRows = prev.rows.map((row) => {
              if (row.id === rowId) {
                return {
                  ...row,
                  blocks: [...row.blocks, newBlock],
                  columnWidths: [...(row.columnWidths || []), 1],
                };
              }
              return row;
            });
            return { ...prev, rows: newRows };
          });
        }
      }

      // Handle block move within layout
      if (active.data.current?.type === "block") {
        const sourceRowId = active.data.current.rowId;
        const blockId = active.data.current.block.id;

        if (over.data.current?.type === "row-insert") {
          const { insertIndex } = over.data.current;

          setLayoutData((prev) => {
            const newRows = [...prev.rows];
            let movedBlock: Block | null = null;

            // Remove from source
            newRows.forEach((row) => {
              if (row.id === sourceRowId) {
                const blockIndex = row.blocks.findIndex((b: Block) => b.id === blockId);
                if (blockIndex !== -1) {
                  [movedBlock] = row.blocks.splice(blockIndex, 1);
                  row.columnWidths = row.blocks.map(() => 1);
                }
              }
            });

            // Add to new row
            if (movedBlock) {
              const newRow = createRow([movedBlock]);
              newRows.splice(insertIndex, 0, newRow);
            }

            // Clean up empty rows
            const filteredRows = newRows.filter((r) => r.blocks.length > 0);
            return {
              ...prev,
              rows: filteredRows.length > 0 ? filteredRows : [createRow()],
            };
          });
        } else if (over.data.current?.type === "column") {
          const targetRowId = over.data.current.rowId;
          const targetBlockId = over.data.current.blockId;

          setLayoutData((prev) => {
            const newRows = [...prev.rows];
            let movedBlock: Block | null = null;

            // Remove from source
            newRows.forEach((row) => {
              if (row.id === sourceRowId) {
                const blockIndex = row.blocks.findIndex((b: Block) => b.id === blockId);
                if (blockIndex !== -1) {
                  [movedBlock] = row.blocks.splice(blockIndex, 1);
                  row.columnWidths = row.blocks.map(() => 1);
                }
              }
            });

            // Add to target
            if (movedBlock) {
              newRows.forEach((row) => {
                if (row.id === targetRowId) {
                  const targetIndex = row.blocks.findIndex((b: Block) => b.id === targetBlockId);
                  if (targetIndex !== -1) {
                    row.blocks.splice(targetIndex, 0, movedBlock!);
                  } else {
                    row.blocks.push(movedBlock!);
                  }
                  row.columnWidths = row.blocks.map(() => 1);
                }
              });
            }

            // Clean up empty rows
            const filteredRows = newRows.filter((r) => r.blocks.length > 0);
            return {
              ...prev,
              rows: filteredRows.length > 0 ? filteredRows : [createRow()],
            };
          });
        }
      }

      setActiveBlock(null);
      setIsBlockDragging(false);
      setDraggingBlockType(null);
    },
    []
  );

  // Layout Operations
  const handleUpdateBlock = useCallback(
    (slideId: string, blockId: string, content: BlockContent) => {
      setLayoutData((prev) => {
        const newRows = prev.rows.map((row) => ({
          ...row,
          blocks: row.blocks.map((block: Block) =>
            block.id === blockId ? { ...block, content } : block
          ),
        }));
        return { ...prev, rows: newRows };
      });
    },
    []
  );

  const handleDeleteRow = useCallback((slideId: string, rowId: string) => {
    setLayoutData((prev) => {
      const newRows = prev.rows.filter((r) => r.id !== rowId);
      return {
        ...prev,
        rows: newRows.length > 0 ? newRows : [createRow()],
      };
    });
  }, []);

  const handleAddColumn = useCallback(
    (slideId: string, rowId: string, afterBlockId: string) => {
      setLayoutData((prev) => {
        const newRows = prev.rows.map((row) => {
          if (row.id === rowId) {
            const blockIndex = row.blocks.findIndex((b: Block) => b.id === afterBlockId);
            const newBlock = createBlockInstance("prosemirror");
            const newBlocks = [...row.blocks];
            newBlocks.splice(blockIndex + 1, 0, newBlock);

            return {
              ...row,
              blocks: newBlocks,
              columnWidths: newBlocks.map(() => 1),
            };
          }
          return row;
        });
        return { ...prev, rows: newRows };
      });
    },
    []
  );

  const handleAddRowAtTop = useCallback((slideId: string) => {
    setLayoutData((prev) => ({
      ...prev,
      rows: [createRow(), ...prev.rows],
    }));
  }, []);

  const handleAddRowAtBottom = useCallback((slideId: string) => {
    setLayoutData((prev) => ({
      ...prev,
      rows: [...prev.rows, createRow()],
    }));
  }, []);

  const handleUpdateColumnWidths = useCallback(
    (slideId: string, rowId: string, columnWidths: number[]) => {
      setLayoutData((prev) => {
        const newRows = prev.rows.map((row) =>
          row.id === rowId ? { ...row, columnWidths } : row
        );
        return { ...prev, rows: newRows };
      });
    },
    []
  );

  // Accent Operations
  const handleUpdateAccent = useCallback((slideId: string, accent: SlideAccent | undefined) => {
    setLayoutData((prev) => ({ ...prev, accent }));
  }, []);

  // Metadata Operations
  const handleUpdateMetadata = useCallback((updates: Partial<LayoutMetadata>) => {
    setLayoutMetadata((prev) => ({ ...prev, ...updates }));
  }, []);

  // Persistence Operations using TanStack Query
  const handleSaveLayout = useCallback(async () => {
    try {
      const payload = {
        name: layoutMetadata.name,
        description: layoutMetadata.description,
        tags: layoutMetadata.tags,
        type: layoutMetadata.type,
        data: layoutData,
      };

      if (layoutMetadata.id) {
        // Update existing layout
        const result = await updateLayoutMutation.mutateAsync({
          id: layoutMetadata.id,
          ...payload,
        });
        // ID stays the same
      } else {
        // Create new layout
        const result = await createLayoutMutation.mutateAsync(payload);
        // Update metadata with new ID
        if (result?.data?.id) {
          setLayoutMetadata((prev) => ({ ...prev, id: result.data.id }));
        }
      }
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Save layout error:", error);
    }
  }, [layoutData, layoutMetadata, createLayoutMutation, updateLayoutMutation]);

  const handleLoadLayout = useCallback(async (layoutId: string) => {
    setIsLoading(true);
    try {
      const result = await layoutsService.getLayout(layoutId);

      // Extract layout from wrapped response
      const layout = result?.data || result;

      if (layout && layout.id) {
        setLayoutData(layout.data as LayoutData);
        setLayoutMetadata({
          id: layout.id,
          name: layout.name,
          description: layout.description || "",
          tags: layout.tags || [],
          type: (layout.type as "admin" | "user") || "admin",
          thumbnail: layout.thumbnail,
          icon: layout.data?.icon || "IconLayout",
        });
        toast.success("Layout loaded successfully!");
      } else {
        toast.error("Failed to load layout");
      }
    } catch (error) {
      console.error("Error loading layout:", error);
      toast.error("Error loading layout");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResetLayout = useCallback(() => {
    if (confirm("Are you sure you want to reset the layout? All changes will be lost.")) {
      setLayoutData({ rows: [createRow()] });
      setLayoutMetadata(DEFAULT_METADATA);
      toast.info("Layout reset");
    }
  }, []);

  return {
    layoutData,
    layoutMetadata,
    theme,
    isLoading,
    isSaving,
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
    handleUpdateAccent,
    handleUpdateMetadata,
    handleSaveLayout,
    handleLoadLayout,
    handleResetLayout,
  };
}
