import { useCallback, useRef, useState } from "react";
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
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Block, Slide } from "@/lib/editor/types";
import type { EditorCommandBus } from "@/lib/editor/commands";

interface UseEditorDndParams {
  slides: Slide[];
  commandBus: EditorCommandBus;
}

export const useEditorDnd = ({
  slides,
  commandBus,
}: UseEditorDndParams) => {
  const [activeBlock, setActiveBlock] = useState<Block | null>(null);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;

    if (data?.type === "layout-option") {
      setIsLayoutDragging(true);
      setDraggingLayoutColumnCount(data.columnCount);
      setDraggingLayoutBlockType(data.blockType);
      return;
    }

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

      // Layout drop handling
      if (isLayoutDragging) {
        setIsLayoutDragging(false);

        if (over && draggingLayoutColumnCount !== null) {
          const overData = over.data.current;
          if (overData?.type === "slide-drop-zone") {
            const slideId = overData.slideId as string;
            commandBus.addRowWithColumns({
              slideId,
              columnCount: draggingLayoutColumnCount,
              blockType: draggingLayoutBlockType,
            });
          }
        }

        setDraggingLayoutColumnCount(null);
        setDraggingLayoutBlockType(undefined);
        return;
      }

      // Block-type dragging (from toolbar)
      if (isBlockDragging) {
        setIsBlockDragging(false);

        if (over && draggingBlockType) {
          const overData = over.data.current;

          if (overData?.type === "row") {
            const rowId = overData.rowId as string;
            const slideId = overData.slideId as string;
            const slide = slidesRef.current.find((s) => s.id === slideId);
            const lastBlockId =
              slide?.rows
                .find((r) => r.id === rowId)
                ?.blocks.at(-1)?.id || undefined;

            commandBus.addBlockAfter({
              slideId,
              rowId,
              afterBlockId: lastBlockId,
              blockType: draggingBlockType,
            });
          } else if (overData?.type === "block") {
            const targetBlockId = overData.block?.id as string;
            const targetSlideId = overData.slideId as string;
            const slide = slidesRef.current.find((s) => s.id === targetSlideId);
            const targetRow = slide?.rows.find((r) =>
              r.blocks.some((b) => b.id === targetBlockId)
            );

            if (targetRow) {
              commandBus.addBlockAfter({
                slideId: targetSlideId,
                rowId: targetRow.id,
                afterBlockId: targetBlockId,
                blockType: draggingBlockType,
              });
            }
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

      if (overData?.type === "row") {
        const targetRowId = overData.rowId as string;
        const targetSlideId = overData.slideId as string;
        if (targetRowId === sourceRowId && targetSlideId === sourceSlideId)
          return;

        commandBus.moveBlock({
          slideId: sourceSlideId,
          sourceRowId,
          targetRowId,
          blockId: sourceBlockId,
        });
        return;
      }

      if (overData?.type === "block") {
        const targetBlockId = overData.block?.id as string;
        const targetSlideId = overData.slideId as string;
        if (sourceBlockId === targetBlockId) return;

        let targetRowId: string | null = null;
        let targetBlockIndex = -1;
        const targetSlide = slidesRef.current.find((s) => s.id === targetSlideId);
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

        if (sourceRowId === targetRowId && sourceSlideId === targetSlideId) {
          commandBus.reorderBlocksInRow({
            slideId: sourceSlideId,
            rowId: sourceRowId,
            oldIndex: sourceBlockIndex,
            newIndex: targetBlockIndex,
          });
          return;
        }

        commandBus.moveBlock({
          slideId: sourceSlideId,
          sourceRowId,
          targetRowId,
          blockId: sourceBlockId,
          targetBlockId,
        });
      }
    },
    [
      commandBus,
      draggingBlockType,
      draggingLayoutBlockType,
      draggingLayoutColumnCount,
      isBlockDragging,
      isLayoutDragging,
    ]
  );

  const customCollisionDetection: DndContextProps["collisionDetection"] =
    useCallback<NonNullable<DndContextProps["collisionDetection"]>>(
      (args) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
          if (isLayoutDragging) {
            const slideDropZone = pointerCollisions.find(
              (c: any) =>
                c.data?.droppableContainer?.data?.current?.type ===
                "slide-drop-zone"
            );
            if (slideDropZone) return [slideDropZone];
          }

          if (isBlockDragging) {
            const rowCollision = pointerCollisions.find(
              (c: any) =>
                c.data?.droppableContainer?.data?.current?.type === "row"
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
      },
      [isBlockDragging, isLayoutDragging]
    );

  return {
    sensors,
    activeBlock,
    isLayoutDragging,
    draggingLayoutColumnCount,
    draggingLayoutBlockType,
    isBlockDragging,
    draggingBlockType,
    handleDragStart,
    handleDragEnd,
    customCollisionDetection,
  };
};

