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
import type { Block, Slide } from "@/lib/editor/types";
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

      // Block-type dragging (from toolbar)
      if (isBlockDragging) {
        setIsBlockDragging(false);

        if (over && draggingBlockType) {
          const overData = over.data.current;

          if (overData?.type === "row-insert") {
            const slideId = overData.slideId as string;
            const insertIndex = Number(overData.insertIndex ?? 0);
            commandBus.addRowWithColumnsAtIndex({
              slideId,
              columnCount: 1,
              insertIndex,
              blockType: draggingBlockType,
            });
            setDraggingBlockType(null);
            return;
          }

          if (overData?.type === "row") {
            const rowId = overData.rowId as string;
            const slideId = overData.slideId as string;
            const insertIndex = overData.insertIndex as number | undefined;

            commandBus.addBlockAfter({
              slideId,
              rowId,
              insertIndex, // Use the new support for direct index insertion
              blockType: draggingBlockType,
            });
          }
        }

        setDraggingBlockType(null);
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
        
        // If we don't have an insert index, we default to end
        // But with our new system we usually should have one if dropIndicator worked.
        // If undefined, default to length (append)
        
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

        // Move to different row (or specific position in different row)
        // We use moveBlockButton logic? No, moveBlockToNewRow is for new rows.
        // We need 'moveBlock' but we need to find targetBlockId from index.
        
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
    [commandBus, draggingBlockType, isBlockDragging]
  );

  const customCollisionDetection: DndContextProps["collisionDetection"] =
    useCallback<NonNullable<DndContextProps["collisionDetection"]>>(
      (args) => {
        // 1. First check if pointer is strictly inside a droppable (highest precision)
        const pointerCollisions = pointerWithin(args);
        
        if (pointerCollisions.length > 0) {
          // Priority 1: Row Insertion (between rows) - distinct zones
          const insertCollision = pointerCollisions.find(
            (c: any) =>
              c.data?.droppableContainer?.data?.current?.type === "row-insert"
          );
          if (insertCollision) return [insertCollision];

          // Priority 2: Row Drop (inside a row)
          // We prefer the Row over the Block because the Row component handles
          // the fine-grained "insertion index" logic via mouse position.
          const rowCollision = pointerCollisions.find(
            (c: any) =>
              c.data?.droppableContainer?.data?.current?.type === "row"
          );
          if (rowCollision) return [rowCollision];
          
          // If we only hit a block but not the row (rare, but possible if row has holes?), 
          // we usually still want the row. But if pointerWithin failed for row, 
          // we fall through to fallback or return what we have? element hierarchy usually implies Block in Row.
          // If Block is hit, Row should be hit too.
        }

        // 2. Fallback: Closest Center
        // If we are "near" the row (e.g. right corner padding edge), pointerWithin might fail.
        // closestCenter finds the nearest rect.
        const centerCollisions = closestCenter(args);
        
        // Priority 3: Nearest Row (Fallback)
        // If we missed precise detection, find the closest Row.
        const nearestRow = centerCollisions.find(
             (c: any) => c.data?.droppableContainer?.data?.current?.type === "row"
        );
        if (nearestRow) return [nearestRow];

        // Default: return whatever we found (e.g. maybe just a block if row really far?)
        // But since we really want Row-based logic, this is our best bet.
        return centerCollisions;
      },
      [] // Removed dependencies as we don't switch logic based on dragging type anymore
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
