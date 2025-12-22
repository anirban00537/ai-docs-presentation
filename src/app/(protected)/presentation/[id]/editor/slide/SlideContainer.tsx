import React, { useState, memo, useCallback, lazy, Suspense } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { ContentRow } from "../layout/ContentRow";
import type { Slide, Theme } from "@/store/slices/slidesSlice";
import type { BlockContent } from "@/types/presentation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import { SlideToolbar } from "./SlideToolbar";
import { SlideFrame } from "./SlideFrame";
import { setSlideAccentSize, updateSlideAccent } from "@/store/slices/slidesSlice";
import type { SelectedImage } from "../panels/ImagePickerModal";

// Lazy load the heavy ImagePickerModal
const ImagePickerModal = lazy(() => 
  import("../panels/ImagePickerModal").then(mod => ({ default: mod.ImagePickerModal }))
);

const DragStateBridge = memo(function DragStateBridge({
  onDragChange,
}: {
  onDragChange: (dragging: boolean) => void;
}) {
  useDndMonitor({
    onDragStart: () => onDragChange(true),
    onDragEnd: () => onDragChange(false),
    onDragCancel: () => onDragChange(false),
  });
  return null;
});

const InsertDropZone = memo(function InsertDropZone({
  slideId,
  insertIndex,
  themePrimary,
  isActive,
}: {
  slideId: string;
  insertIndex: number;
  themePrimary: string;
  isActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `row-insert-${slideId}-${insertIndex}`,
    data: {
      type: "row-insert",
      slideId,
      insertIndex,
    },
  });

  if (!isActive) return null;

  return (
    <div
      ref={setNodeRef}
      className="relative h-6 flex items-center justify-center"
      aria-label={`Drop zone at position ${insertIndex + 1}`}
    >
      {isOver && (
        <div
          className="absolute inset-x-4 h-0.5 flex items-center"
          style={{ backgroundColor: themePrimary }}
        >
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themePrimary }}
          />
          <div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: themePrimary }}
          />
        </div>
      )}
    </div>
  );
});

interface SlideContainerProps {
  slide: Slide;
  onUpdateBlock: (slideId: string, blockId: string, content: BlockContent) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (slideId: string) => void;
  onAddRowAtBottom: (slideId: string) => void;
  onUpdateColumnWidths: (
    slideId: string,
    rowId: string,
    columnWidths: number[]
  ) => void;
  enableDragHints?: boolean;
  readOnly?: boolean;
  fullWidth?: boolean;
  theme?: Theme;
}

export const SlideContainer = memo(function SlideContainer({
  slide,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
  enableDragHints = true,
  readOnly = false,
  fullWidth = false,
  theme: themeProp,
}: SlideContainerProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const dispatch = useAppDispatch();

  const dragActive = enableDragHints ? isDragging : false;

  const handleAccentImageSelect = useCallback((image: SelectedImage) => {
    dispatch(updateSlideAccent({ 
      slideId: slide.id, 
      update: { url: image.url } 
    }));
    setIsImagePickerOpen(false);
  }, [dispatch, slide.id]);

  const accentControls = (
    <button
      onClick={() => setIsImagePickerOpen(true)}
      className="absolute inset-0 m-auto w-fit h-fit px-4 py-2 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full text-sm font-medium opacity-0 group-hover/accent:opacity-100 transition-all hover:scale-105 shadow-xl border border-black/5 dark:border-white/5"
      aria-label="Change accent image"
    >
      Change Image
    </button>
  );

  return (
    <>
      <SlideFrame
        theme={theme}
        slideId={slide.id}
        fullWidth={fullWidth}
        onMouseEnter={!readOnly ? () => setIsHovered(true) : undefined}
        onMouseLeave={!readOnly ? () => setIsHovered(false) : undefined}
        accent={slide.accent}
        onAccentResize={(size) => dispatch(setSlideAccentSize({ slideId: slide.id, size }))}
        accentControls={accentControls}
        readOnly={readOnly}
        className={`group/slide relative transition-all duration-300 ease-out z-0 hover:z-20 ${
          fullWidth
            ? "w-full min-h-screen"
            : "mx-auto"
        }`}
      >
        {enableDragHints && !readOnly && (
          <DragStateBridge onDragChange={setIsDragging} />
        )}

        {/* Slide Controls - Unified Hub (Top Left) */}
        {!readOnly && (
          <SlideToolbar
            slide={slide}
            theme={theme}
            isHovered={isHovered}
            fullWidth={fullWidth}
            onOpenImagePicker={() => setIsImagePickerOpen(true)}
            onAddRow={() => onAddRowAtBottom(slide.id)}
          />
        )}

        <div 
          className={`relative ${fullWidth ? "w-full" : "flex-1"}`}
          style={{ 
            padding: fullWidth ? "0" : "2rem 2.5rem",
          }}
        >
          <div className="flex flex-col gap-0 relative">
            {!readOnly && (
              <InsertDropZone
                slideId={slide.id}
                insertIndex={0}
                themePrimary={theme.primary}
                isActive={dragActive}
              />
            )}
            {(slide.rows || []).map((row, rowIndex) => (
              <React.Fragment key={row.id}>
                <ContentRow
                  row={row}
                  slideId={slide.id}
                  rowIndex={rowIndex}
                  totalRowsInSlide={slide.rows?.length || 0}
                  isDragging={dragActive}
                  enableDragHints={enableDragHints}
                  onUpdateBlock={(blockId, content) =>
                    onUpdateBlock(slide.id, blockId, content)
                  }
                  onDeleteRow={(rowId) => onDeleteRow(slide.id, rowId)}
                  onAddColumn={(rowId, afterBlockId) =>
                    onAddColumn(slide.id, rowId, afterBlockId)
                  }
                  onUpdateColumnWidths={(rowId: string, columnWidths: number[]) =>
                    onUpdateColumnWidths(slide.id, rowId, columnWidths)
                  }
                  rowCount={slide.rows?.length || 0}
                  readOnly={readOnly}
                  theme={theme}
                />
                {!readOnly && (
                  <InsertDropZone
                    slideId={slide.id}
                    insertIndex={rowIndex + 1}
                    themePrimary={theme.primary}
                    isActive={dragActive}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </SlideFrame>

      {!readOnly && (
        <Suspense fallback={null}>
          <ImagePickerModal
            isOpen={isImagePickerOpen}
            onClose={() => setIsImagePickerOpen(false)}
            onSelect={handleAccentImageSelect}
            theme={theme}
          />
        </Suspense>
      )}
    </>
  );
});

