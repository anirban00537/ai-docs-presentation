import React, { useState, useEffect, useRef } from "react";
import { useDroppable, useDndMonitor } from "@dnd-kit/core";
import { DroppableRow } from "./DroppableRow";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  DEFAULT_THEME,
  type Theme,
} from "@/store/slices/slidesSlice";
import { IconPlus, IconPhoto, IconTrash, IconLayoutSidebarRight, IconLayoutSidebar, IconLayoutNavbar, IconLayoutBottombar, IconWallpaper } from "@tabler/icons-react";
import { CardWrapper } from "./CardWrapper";
import { setSlideAccentSize, toggleSlideAccent, updateSlideAccent } from "@/store/slices/slidesSlice";
import { ImagePickerModal, type SelectedImage } from "./components/ImagePickerModal";
import { Button } from "@/components/ui/button";

const DragStateBridge: React.FC<{
  onDragChange: (dragging: boolean) => void;
}> = ({ onDragChange }) => {
  useDndMonitor({
    onDragStart: () => onDragChange(true),
    onDragEnd: () => onDragChange(false),
    onDragCancel: () => onDragChange(false),
  });
  return null;
};

const InsertDropZone: React.FC<{
  slideId: string;
  insertIndex: number;
  themePrimary: string;
  isActive: boolean;
}> = ({ slideId, insertIndex, themePrimary, isActive }) => {
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
};

interface SlideCardProps {
  slide: Slide;
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
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



import { SlideSettings } from "./components/SlideSettings";

export const SlideCard: React.FC<SlideCardProps> = ({
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
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const dispatch = useAppDispatch();

  const dragActive = enableDragHints ? isDragging : false;

  const handleAccentImageSelect = (image: SelectedImage) => {
    dispatch(updateSlideAccent({ 
      slideId: slide.id, 
      update: { url: image.url } 
    }));
    setIsImagePickerOpen(false);
  };

  const accentControls = (
    <button
      onClick={() => setIsImagePickerOpen(true)}
      className="absolute inset-0 m-auto w-fit h-fit px-4 py-2 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full text-sm font-medium opacity-0 group-hover/accent:opacity-100 transition-all hover:scale-105 shadow-xl border border-black/5 dark:border-white/5"
    >
      Change Image
    </button>
  );

  return (
    <>
      <CardWrapper
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

        {/* Slide Controls Overlay - Top Left */}
        {!readOnly && (
          <div className={`absolute top-4 left-4 z-50 flex items-center gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
          }`}>
            <SlideSettings 
              slide={slide} 
              theme={theme} 
              onOpenImagePicker={() => setIsImagePickerOpen(true)} 
            />
          </div>
        )}

        <div 
          className={`relative ${fullWidth ? "w-full" : "flex-1"}`}
          style={{ 
            padding: fullWidth ? "0" : "2rem 2.5rem",
          }}
        >
          {!readOnly && (
            <button
              onClick={() => onAddRowAtTop(slide.id)}
              className={`absolute left-1/2 -translate-x-1/2 top-2 z-30 transition-all duration-200 ${
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1 pointer-events-none"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center hover:scale-110 transition-all text-neutral-400 hover:text-primary">
                <IconPlus size={14} stroke={2.5} />
              </div>
            </button>
          )}

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
                <DroppableRow
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

          {!readOnly && (
            <button
              onClick={() => onAddRowAtBottom(slide.id)}
              className={`absolute left-1/2 -translate-x-1/2 bottom-2 z-30 transition-all duration-200 ${
                isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-neutral-200 flex items-center justify-center hover:scale-110 transition-all text-neutral-400 hover:text-primary">
                <IconPlus size={14} stroke={2.5} />
              </div>
            </button>
          )}
        </div>
      </CardWrapper>

      {!readOnly && (
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          onSelect={handleAccentImageSelect}
          theme={theme}
        />
      )}
    </>
  );
};
