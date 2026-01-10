import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectSlides } from "@/store/slices/slidesSlice";
import type { Block, Row, Slide } from "@/types/presentation";

interface BlockPosition {
  slideId: string;
  rowId: string;
  blockId: string;
  slideIndex: number;
  rowIndex: number;
  blockIndex: number;
}

interface BlockSelectionContextValue {
  focusedBlockId: string | null;
  focusedSlideId: string | null;
  focusedPosition: BlockPosition | null;
  setFocusedBlock: (slideId: string | null, blockId: string | null) => void;
  navigateUp: () => void;
  navigateDown: () => void;
  navigateLeft: () => void;
  navigateRight: () => void;
  canNavigateUp: boolean;
  canNavigateDown: boolean;
  canNavigateLeft: boolean;
  canNavigateRight: boolean;
  getAllBlockPositions: () => BlockPosition[];
}

const BlockSelectionContext = createContext<BlockSelectionContextValue | null>(null);

// Default no-op context for components rendered outside the provider (e.g., mini previews)
const noOpContext: BlockSelectionContextValue = {
  focusedBlockId: null,
  focusedSlideId: null,
  focusedPosition: null,
  setFocusedBlock: () => {},
  navigateUp: () => {},
  navigateDown: () => {},
  navigateLeft: () => {},
  navigateRight: () => {},
  canNavigateUp: false,
  canNavigateDown: false,
  canNavigateLeft: false,
  canNavigateRight: false,
  getAllBlockPositions: () => [],
};

export const useBlockFocus = () => {
  const context = useContext(BlockSelectionContext);
  // Return no-op context if used outside provider (e.g., in sidebar mini previews)
  if (!context) {
    return noOpContext;
  }
  return context;
};

interface BlockSelectionProviderProps {
  children: React.ReactNode;
  onNavigate?: (position: BlockPosition) => void;
}

export const BlockSelectionProvider: React.FC<BlockSelectionProviderProps> = ({
  children,
  onNavigate,
}) => {
  const slides = useAppSelector(selectSlides);
  const [focusedSlideId, setFocusedSlideId] = useState<string | null>(null);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);

  // Build a flat list of all block positions for navigation
  const getAllBlockPositions = useCallback((): BlockPosition[] => {
    const positions: BlockPosition[] = [];
    slides.forEach((slide, slideIndex) => {
      slide.rows.forEach((row, rowIndex) => {
        row.blocks.forEach((block, blockIndex) => {
          positions.push({
            slideId: slide.id,
            rowId: row.id,
            blockId: block.id,
            slideIndex,
            rowIndex,
            blockIndex,
          });
        });
      });
    });
    return positions;
  }, [slides]);

  // Get current focused position
  const focusedPosition = useMemo((): BlockPosition | null => {
    if (!focusedBlockId || !focusedSlideId) return null;
    const positions = getAllBlockPositions();
    return positions.find((p) => p.blockId === focusedBlockId && p.slideId === focusedSlideId) || null;
  }, [focusedBlockId, focusedSlideId, getAllBlockPositions]);

  // Navigation capabilities
  const navigationState = useMemo(() => {
    if (!focusedPosition) {
      return {
        canNavigateUp: false,
        canNavigateDown: false,
        canNavigateLeft: false,
        canNavigateRight: false,
      };
    }

    const { slideIndex, rowIndex, blockIndex } = focusedPosition;
    const slide = slides[slideIndex];
    const row = slide?.rows[rowIndex];

    return {
      canNavigateUp: rowIndex > 0 || slideIndex > 0,
      canNavigateDown:
        rowIndex < (slide?.rows.length || 0) - 1 ||
        slideIndex < slides.length - 1,
      canNavigateLeft: blockIndex > 0,
      canNavigateRight: blockIndex < (row?.blocks.length || 0) - 1,
    };
  }, [focusedPosition, slides]);

  const setFocusedBlock = useCallback((slideId: string | null, blockId: string | null) => {
    setFocusedSlideId(slideId);
    setFocusedBlockId(blockId);
  }, []);

  // Navigate to adjacent block in same row (left/right)
  const navigateLeft = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateLeft) return;
    const { slideIndex, rowIndex, blockIndex } = focusedPosition;
    const slide = slides[slideIndex];
    const row = slide?.rows[rowIndex];
    if (row && blockIndex > 0) {
      const newBlock = row.blocks[blockIndex - 1];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        ...focusedPosition,
        blockId: newBlock.id,
        blockIndex: blockIndex - 1,
      });
    }
  }, [focusedPosition, navigationState.canNavigateLeft, slides, onNavigate]);

  const navigateRight = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateRight) return;
    const { slideIndex, rowIndex, blockIndex } = focusedPosition;
    const slide = slides[slideIndex];
    const row = slide?.rows[rowIndex];
    if (row && blockIndex < row.blocks.length - 1) {
      const newBlock = row.blocks[blockIndex + 1];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        ...focusedPosition,
        blockId: newBlock.id,
        blockIndex: blockIndex + 1,
      });
    }
  }, [focusedPosition, navigationState.canNavigateRight, slides, onNavigate]);

  // Navigate to block in adjacent row (up/down)
  const navigateUp = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateUp) return;
    const { slideIndex, rowIndex, blockIndex } = focusedPosition;

    let newSlideIndex = slideIndex;
    let newRowIndex = rowIndex - 1;

    // Move to previous slide if at first row
    if (newRowIndex < 0) {
      if (slideIndex > 0) {
        newSlideIndex = slideIndex - 1;
        newRowIndex = slides[newSlideIndex].rows.length - 1;
      } else {
        return;
      }
    }

    const newSlide = slides[newSlideIndex];
    const newRow = newSlide?.rows[newRowIndex];
    if (newRow) {
      // Try to maintain same block index, or use last block in row
      const newBlockIndex = Math.min(blockIndex, newRow.blocks.length - 1);
      const newBlock = newRow.blocks[newBlockIndex];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        slideId: newSlide.id,
        rowId: newRow.id,
        blockId: newBlock.id,
        slideIndex: newSlideIndex,
        rowIndex: newRowIndex,
        blockIndex: newBlockIndex,
      });
    }
  }, [focusedPosition, navigationState.canNavigateUp, slides, onNavigate]);

  const navigateDown = useCallback(() => {
    if (!focusedPosition || !navigationState.canNavigateDown) return;
    const { slideIndex, rowIndex, blockIndex } = focusedPosition;
    const slide = slides[slideIndex];

    let newSlideIndex = slideIndex;
    let newRowIndex = rowIndex + 1;

    // Move to next slide if at last row
    if (newRowIndex >= slide.rows.length) {
      if (slideIndex < slides.length - 1) {
        newSlideIndex = slideIndex + 1;
        newRowIndex = 0;
      } else {
        return;
      }
    }

    const newSlide = slides[newSlideIndex];
    const newRow = newSlide?.rows[newRowIndex];
    if (newRow) {
      // Try to maintain same block index, or use last block in row
      const newBlockIndex = Math.min(blockIndex, newRow.blocks.length - 1);
      const newBlock = newRow.blocks[newBlockIndex];
      setFocusedBlockId(newBlock.id);
      onNavigate?.({
        slideId: newSlide.id,
        rowId: newRow.id,
        blockId: newBlock.id,
        slideIndex: newSlideIndex,
        rowIndex: newRowIndex,
        blockIndex: newBlockIndex,
      });
    }
  }, [focusedPosition, navigationState.canNavigateDown, slides, onNavigate]);

  // Global keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle navigation when a block is focused and not in an input/editor
      if (!focusedBlockId) return;
      
      const target = e.target as HTMLElement;
      const isInEditor =
        target.closest(".ProseMirror") ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;
      
      if (isInEditor) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          navigateUp();
          break;
        case "ArrowDown":
          e.preventDefault();
          navigateDown();
          break;
        case "ArrowLeft":
          e.preventDefault();
          navigateLeft();
          break;
        case "ArrowRight":
          e.preventDefault();
          navigateRight();
          break;
        case "Escape":
          setFocusedBlockId(null);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [focusedBlockId, navigateUp, navigateDown, navigateLeft, navigateRight]);

  const value = useMemo<BlockSelectionContextValue>(
    () => ({
      focusedSlideId,
      focusedBlockId,
      focusedPosition,
      setFocusedBlock,
      navigateUp,
      navigateDown,
      navigateLeft,
      navigateRight,
      ...navigationState,
      getAllBlockPositions,
    }),
    [
      focusedBlockId,
      focusedPosition,
      setFocusedBlock,
      navigateUp,
      navigateDown,
      navigateLeft,
      navigateRight,
      navigationState,
      getAllBlockPositions,
    ]
  );

  return (
    <BlockSelectionContext.Provider value={value}>
      {children}
    </BlockSelectionContext.Provider>
  );
};

