import { useCallback, useEffect, useRef, useState } from "react";

import {
  DndContextProps,
  DragEndEvent,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { Block, Slide } from "@/types/presentation";
import type { EditorCommandBus } from "@/lib/editor/commands";

interface UseEditorDndParams {
  slides: Slide[];
  commandBus: EditorCommandBus;
}

export const useEditorDnd = ({ slides, commandBus }: UseEditorDndParams) => {
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
  const [isBlockDragging, setIsBlockDragging] = useState(false);
  const [draggingBlockType, setDraggingBlockType] = useState<string | null>(
    null
  );
  const [draggingImageData, setDraggingImageData] = useState<{
    url: string;
    alt?: string;
    attribution?: { name: string; link: string };
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const slidesRef = useRef(slides);

  useEffect(() => {
    slidesRef.current = slides;
  }, [slides]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;

    if (data?.type === "block-option") {
      setIsBlockDragging(true);
      setDraggingBlockType(data.blockType);
      return;
    }

    if (data?.type === "layout-option") {
      setIsBlockDragging(true);
      setDraggingBlockType(data.blockType);
      return;
    }

    if (data?.type === "image-option") {
      setIsBlockDragging(true);
      setDraggingBlockType("image"); // Use the IMAGE block type
      setDraggingImageData({
        url: data.imageUrl,
        alt: data.imageAlt,
        attribution: data.attribution,
      });
      return;
    }

    const block = data?.block as Block;
    if (block) {
      setActiveBlock(block);
    }
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveBlock(null);

      if (!over) return;

      // Block-type dragging (from toolbar or images panel)
      if (isBlockDragging) {
        setIsBlockDragging(false);

        if (over && draggingBlockType) {
          const overData = over.data.current;
          
          // Build initialContent for block or images
          const activeData = active.data.current;
          const initialContent = draggingImageData ? {
            url: draggingImageData.url,
            alt: draggingImageData.alt || "",
            caption: "",
            objectFit: "cover",
            attribution: draggingImageData.attribution,
          } : (activeData?.initialContent as Record<string, any> | undefined);

          // Check if this is a layout (multiple columns) or single block
          const isLayout = activeData?.type === "layout-option";
          const columnCount = isLayout ? (activeData?.columnCount || 1) : 1;

          if (overData?.type === "row-insert") {
            const slideId = overData.slideId as string;
            const insertIndex = Number(overData.insertIndex ?? 0);
            commandBus.addRowWithColumnsAtIndex({
              slideId,
              columnCount,
              insertIndex,
              blockType: draggingBlockType,
              initialContent,
            });
            setDraggingBlockType(null);
            setDraggingImageData(null);
            return;
          }

          // Any block/layout can be dropped into any row
          if (overData?.type === "row") {
            const rowId = overData.rowId as string;
            const slideId = overData.slideId as string;
            const insertIndex = overData.insertIndex as number | undefined;

            // If it's a layout, we might want to add all its columns...
            // But for now, we'll treat it as adding a block with many columns if the command supports it,
            // or just add one block of that type.
            // Given the instruction "any block... any where", we'll allow it.
            
            commandBus.addBlockAfter({
              slideId,
              rowId,
              insertIndex,
              blockType: draggingBlockType,
              initialContent,
            });
          }
        }

        setDraggingBlockType(null);
        setDraggingImageData(null);
        return;
      }

      const activeData = active.data.current;
      const overData = over.data.current;
      const sourceSlideId = activeData?.slideId as string;
      const sourceBlockId = activeData?.block?.id as string;

      if (!sourceSlideId || !sourceBlockId) return;

      let sourceRowId: string | null = null;
      let sourceBlockIndex = -1;
      const sourceSlide = slidesRef.current.find((s) => s.id === sourceSlideId);
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

      if (!sourceRowId || sourceBlockIndex === -1) return;

      if (overData?.type === "row-insert") {
        const insertIndex = Number(overData.insertIndex ?? 0);
        commandBus.moveBlockToNewRow({
          slideId: sourceSlideId,
          sourceRowId,
          blockId: sourceBlockId,
          insertIndex,
        });
        return;
      }

      // Handle drop on a specific Row (Insertion Logic)
      if (overData?.type === "row") {
        const targetRowId = overData.rowId as string;
        const targetSlideId = overData.slideId as string;
        const insertIndex = overData.insertIndex as number | undefined;
        
        const targetSlide = slidesRef.current.find((s) => s.id === targetSlideId);
        if (!targetSlide) return;
        const targetRow = targetSlide.rows.find((r) => r.id === targetRowId);
        if (!targetRow) return;

        const finalInsertIndex = insertIndex ?? targetRow.blocks.length;

        // Same Row Reordering
        if (targetRowId === sourceRowId && targetSlideId === sourceSlideId) {
            commandBus.reorderBlocksInRow({
              slideId: sourceSlideId,
              rowId: sourceRowId,
              oldIndex: sourceBlockIndex,
              newIndex: finalInsertIndex,
            });
            return;
        }

        // Move to different row
        let targetBlockId: string | undefined = undefined;
        if (finalInsertIndex < targetRow.blocks.length) {
            targetBlockId = targetRow.blocks[finalInsertIndex].id;
        }
        
        commandBus.moveBlock({
            slideId: sourceSlideId,
            sourceRowId,
            targetRowId,
            blockId: sourceBlockId,
            targetBlockId, // undefined means append
        });
        return;
      }

    },
    [commandBus, draggingBlockType, draggingImageData, isBlockDragging]
  );

  const customCollisionDetection: DndContextProps["collisionDetection"] =
    useCallback<NonNullable<DndContextProps["collisionDetection"]>>(
      (args) => {
        // 1. First check if pointer is strictly inside a droppable (highest precision)
        const pointerCollisions = pointerWithin(args);
        
        if (pointerCollisions.length > 0) {
          // Priority 1: Row Insertion (between rows)
          const insertCollision = pointerCollisions.find(
            (c: any) =>
              c.data?.droppableContainer?.data?.current?.type === "row-insert"
          );
          if (insertCollision) return [insertCollision];

          // Removed layout-specific column restriction: any block can go into any row
          const rowCollision = pointerCollisions.find(
            (c: any) =>
              c.data?.droppableContainer?.data?.current?.type === "row"
          );
          if (rowCollision) return [rowCollision];
        }

        // 2. Fallback: Closest Center
        const centerCollisions = closestCenter(args);
        
        // Priority 2: Nearest Row Insertion
        const insertCollisionFallback = centerCollisions.find(
             (c: any) => c.data?.droppableContainer?.data?.current?.type === "row-insert"
        );
        if (insertCollisionFallback) return [insertCollisionFallback];

        // Priority 3: Nearest Row (Fallback)
        const nearestRow = centerCollisions.find(
             (c: any) => c.data?.droppableContainer?.data?.current?.type === "row"
        );
        if (nearestRow) return [nearestRow];

        return centerCollisions;
      },
      []
    );

  return {
    sensors,
    activeBlock,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
  };
};
