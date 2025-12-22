"use client";

import { useCallback } from "react";
import type { EditorCommandBus } from "@/lib/editor/commands";
import type { Slide } from "@/store/slices/slidesSlice";
import type { BlockContent } from "@/types/presentation";
import { detectRowBlockType } from "@/app/(protected)/presentation/[id]/editor/blocks/utils";

interface UseEditorActionsParams {
  slides: Slide[];
  commandBus: EditorCommandBus;
}

/**
 * Hook for managing editor action handlers.
 * Provides memoized callbacks for block, row, and column operations.
 */
export function useEditorActions({ slides, commandBus }: UseEditorActionsParams) {
  /**
   * Update a block's content
   */
  const handleUpdateBlock = useCallback(
    (slideId: string, blockId: string, content: BlockContent) => {
      commandBus.updateBlock({ slideId, blockId, content });
    },
    [commandBus]
  );

  /**
   * Delete a row from a slide
   */
  const handleDeleteRow = useCallback(
    (slideId: string, rowId: string) => {
      commandBus.deleteRow({ slideId, rowId });
    },
    [commandBus]
  );

  /**
   * Add a new column/block to a row
   */
  const handleAddColumn = useCallback(
    (slideId: string, rowId: string, afterBlockId: string) => {
      const slide = slides.find((s) => s.id === slideId);
      let blockType: string | undefined;
      
      if (slide) {
        const row = slide.rows.find((r) => r.id === rowId);
        if (row) {
          blockType = detectRowBlockType(row);
        }
      }
      
      commandBus.addBlockAfter({ slideId, rowId, afterBlockId, blockType });
    },
    [slides, commandBus]
  );

  /**
   * Add a new row at the top of a slide
   */
  const handleAddRowAtTop = useCallback(
    (slideId: string) => {
      commandBus.addRowAtTop({ slideId, columnCount: 1 });
    },
    [commandBus]
  );

  /**
   * Add a new row at the bottom of a slide
   */
  const handleAddRowAtBottom = useCallback(
    (slideId: string) => {
      commandBus.addRowWithColumns({ slideId, columnCount: 1 });
    },
    [commandBus]
  );

  /**
   * Update column widths for a row
   */
  const handleUpdateColumnWidths = useCallback(
    (slideId: string, rowId: string, columnWidths: number[]) => {
      commandBus.updateColumnWidths({ slideId, rowId, columnWidths });
    },
    [commandBus]
  );

  return {
    handleUpdateBlock,
    handleDeleteRow,
    handleAddColumn,
    handleAddRowAtTop,
    handleAddRowAtBottom,
    handleUpdateColumnWidths,
  };
}
