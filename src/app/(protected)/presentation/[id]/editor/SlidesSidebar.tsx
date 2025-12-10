import React, { useState, useEffect, useRef } from "react";
import { SlideCard } from "./SlideCard";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  selectActiveSlideId,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import {
  IconChevronRight,
  IconLayoutGrid,
  IconList,
  IconX,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  setActiveSlide,
  addSlide,
  deleteSlide,
} from "@/store/slices/slidesSlice";
import { useAppDispatch } from "@/store/hooks";

interface SlidesSidebarProps {
  slides: Slide[];
  onUpdateBlock: (slideId: string, blockId: string, content: any) => void;
  onDeleteRow: (slideId: string, rowId: string) => void;
  onAddColumn: (slideId: string, rowId: string, afterBlockId: string) => void;
  onAddRowAtTop: (slideId: string) => void;
  onAddRowAtBottom: (slideId: string) => void;
}

export const SlidesSidebar: React.FC<SlidesSidebarProps> = ({
  slides,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeSlideRef = useRef<HTMLDivElement>(null);

  // Scroll to active slide when it changes
  useEffect(() => {
    if (activeSlideRef.current && !isCollapsed) {
      // Use a small timeout to ensure DOM is updated
      setTimeout(() => {
        if (activeSlideRef.current) {
          activeSlideRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    }
  }, [activeSlideId, isCollapsed, slides.length]);

  const handleSlideClick = (slideId: string) => {
    dispatch(setActiveSlide(slideId));
    // Scroll to the slide in the main editor
    const slideElement = document.querySelector(`[data-slide-id="${slideId}"]`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleAddSlide = () => {
    dispatch(addSlide({}));
    // The new slide will be automatically selected by the reducer
    // The useEffect will handle scrolling to it
  };

  const handleDeleteSlide = (e: React.MouseEvent, slideId: string) => {
    e.stopPropagation(); // Prevent slide selection when clicking delete
    if (slides.length <= 1) {
      // The reducer already prevents deletion, but we can show a message
      return;
    }
    dispatch(deleteSlide(slideId));
  };

  return (
    <>
      {/* Collapsed Toggle Button - Always visible when collapsed */}
      {isCollapsed && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40">
          <div
            className="p-2 rounded-lg backdrop-blur-sm"
            style={{
              backgroundColor: theme.cardBackground + "E6",
              border: `1px solid ${theme.primary}20`,
            }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10"
              onClick={() => setIsCollapsed(false)}
            >
              <IconChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed left-6 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
          isCollapsed
            ? "-translate-x-full opacity-0 pointer-events-none"
            : "translate-x-0 opacity-100"
        }`}
      >
        <div
          className="w-64 h-[600px] max-h-[80vh] flex flex-col rounded-xl backdrop-blur-sm overflow-hidden"
          style={{
            backgroundColor: theme.cardBackground + "E6",
            border: `1px solid ${theme.primary}20`,
          }}
        >
          {/* Header */}
          <div
            className="px-2 py-1 flex items-center justify-between gap-1"
            style={{
              borderBottom: `1px solid ${theme.primary}15`,
            }}
          >
            {/* View Toggle */}
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-md"
              style={{
                backgroundColor: theme.primary + "10",
              }}
            >
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 rounded ${
                  viewMode === "grid" ? "" : "opacity-50 hover:opacity-70"
                }`}
                onClick={() => setViewMode("grid")}
                style={{
                  backgroundColor:
                    viewMode === "grid" ? theme.primary + "20" : "transparent",
                  color: theme.bodyColor,
                }}
              >
                <IconLayoutGrid className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-6 w-6 rounded ${
                  viewMode === "list" ? "" : "opacity-50 hover:opacity-70"
                }`}
                onClick={() => setViewMode("list")}
                style={{
                  backgroundColor:
                    viewMode === "list" ? theme.primary + "20" : "transparent",
                  color: theme.bodyColor,
                }}
              >
                <IconList className="size-3.5" />
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {/* Add Slide Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleAddSlide}
                style={{
                  color: theme.bodyColor,
                  opacity: 0.7,
                }}
                title="Add new slide"
              >
                <IconPlus className="size-3.5" />
              </Button>
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-transparent"
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                  color: theme.bodyColor,
                  opacity: 0.5,
                }}
              >
                <IconX className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Slides List */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar custom-scrollbar-light">
            {viewMode === "grid" ? (
              <div className="space-y-3">
                {slides.map((slide, index) => {
                  const isActive = slide.id === activeSlideId;
                  return (
                    <div
                      key={slide.id}
                      ref={isActive ? activeSlideRef : null}
                      onClick={() => handleSlideClick(slide.id)}
                      className={`relative cursor-pointer transition-all rounded-lg overflow-hidden border-2 group ${
                        isActive
                          ? "ring-2 ring-offset-1 shadow-md"
                          : "hover:border-primary/50 border-transparent"
                      }`}
                      style={{
                        borderColor: isActive ? theme.primary : "transparent",
                        boxShadow: isActive
                          ? `0 0 0 2px ${theme.primary}40`
                          : undefined,
                      }}
                      data-slide-preview-id={slide.id}
                    >
                      {/* Delete Button - Shows on hover */}
                      {slides.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/90 hover:bg-red-600"
                          onClick={(e) => handleDeleteSlide(e, slide.id)}
                          style={{
                            color: "white",
                          }}
                          title="Delete slide"
                        >
                          <IconTrash className="size-3" />
                        </Button>
                      )}
                      {/* Mini Slide Preview - Scaled down */}
                      <div
                        className="relative overflow-hidden"
                        style={{
                          height: "120px",
                          aspectRatio: "16/9",
                        }}
                      >
                        <div
                          className="absolute top-0 left-0 pointer-events-none"
                          style={{
                            transform: "scale(0.25)",
                            transformOrigin: "top left",
                            width: "400%",
                            height: "400%",
                          }}
                        >
                          <SlideCard
                            slide={slide}
                            index={index}
                            totalSlides={slides.length}
                            onUpdateBlock={onUpdateBlock}
                            onDeleteRow={onDeleteRow}
                            onAddColumn={onAddColumn}
                            onAddRowAtTop={onAddRowAtTop}
                            onAddRowAtBottom={onAddRowAtBottom}
                            onDeleteSlide={() => {}}
                            isLayoutDragging={false}
                            activeLayoutSlideId={null}
                          />
                        </div>
                        {/* Slide Number Badge */}
                        <div
                          className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium z-10"
                          style={{
                            backgroundColor: isActive
                              ? theme.primary
                              : theme.primary + "80",
                            color: "white",
                          }}
                        >
                          {index + 1}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1">
                {slides.map((slide, index) => {
                  const isActive = slide.id === activeSlideId;
                  return (
                    <div
                      key={slide.id}
                      ref={isActive ? activeSlideRef : null}
                      onClick={() => handleSlideClick(slide.id)}
                      className={`relative cursor-pointer transition-all rounded-md px-3 py-2 flex items-center gap-3 group ${
                        isActive ? "" : "hover:opacity-80"
                      }`}
                      style={{
                        backgroundColor: isActive
                          ? theme.primary + "15"
                          : "transparent",
                        borderLeft: isActive
                          ? `3px solid ${theme.primary}`
                          : "3px solid transparent",
                      }}
                      data-slide-preview-id={slide.id}
                    >
                      {/* Slide Number */}
                      <div
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: isActive
                            ? theme.primary
                            : theme.primary + "30",
                          color: isActive ? "white" : theme.bodyColor,
                        }}
                      >
                        {index + 1}
                      </div>
                      {/* Slide Info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{ color: theme.bodyColor }}
                        >
                          Slide {index + 1}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{
                            color: theme.bodyColor,
                            opacity: 0.6,
                          }}
                        >
                          {slide.rows.length} row
                          {slide.rows.length !== 1 ? "s" : ""}
                        </div>
                      </div>
                      {/* Delete Button - Shows on hover */}
                      {slides.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => handleDeleteSlide(e, slide.id)}
                          style={{
                            color: theme.bodyColor,
                          }}
                          title="Delete slide"
                        >
                          <IconTrash className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
