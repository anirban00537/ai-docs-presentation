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
  replaceSlideWithLayout,
} from "@/store/slices/slidesSlice";
import { useAppDispatch } from "@/store/hooks";
import { LayoutPickerModal } from "./LayoutPickerModal";
import type { LayoutTemplate } from "./layoutTemplates";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";

interface SlidesSidebarProps {
  slides: Slide[];
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
}

export const SlidesSidebar: React.FC<SlidesSidebarProps> = ({
  slides,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [pendingLayout, setPendingLayout] = useState<LayoutTemplate | null>(
    null
  );
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const accent = isDark ? "#60a5fa" : "#2563eb"; // match ThemePanel palette
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#cbd5e1" : "#475569";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeSlideRef = useRef<HTMLDivElement>(null);
  const previousActiveSlideIdRef = useRef<string | null>(null);

  // Apply pending layout when a new slide becomes active
  useEffect(() => {
    if (
      pendingLayout &&
      activeSlideId &&
      activeSlideId !== previousActiveSlideIdRef.current
    ) {
      const rows = pendingLayout.getRows();
      dispatch(replaceSlideWithLayout({ slideId: activeSlideId, rows }));
      // Use setTimeout to avoid setState in effect
      setTimeout(() => setPendingLayout(null), 0);
    }
    previousActiveSlideIdRef.current = activeSlideId;
  }, [activeSlideId, pendingLayout, dispatch]);

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
    setIsLayoutModalOpen(true);
  };

  const handleSelectLayout = (template: LayoutTemplate) => {
    // Store the template to apply when the new slide becomes active
    setPendingLayout(template);
    // Create a new slide - the reducer will set it as active
    // The useEffect will detect the new activeSlideId and apply the layout
    dispatch(addSlide({}));
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
      <LayoutPickerModal
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        onSelectLayout={handleSelectLayout}
      />
      {/* Collapsed Toggle Button - Always visible when collapsed */}
      {isCollapsed && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40">
          <div
            className="p-2 rounded-lg backdrop-blur-sm"
            style={{
              backgroundColor: isDark
                ? "rgba(12,12,14,0.9)"
                : theme.cardBackground + "E6",
              border: `1px solid ${borderColor}`,
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
          className="w-[280px] h-[600px] max-h-[80vh] flex flex-col rounded-xl backdrop-blur-sm overflow-hidden"
          style={{
            backgroundColor: isDark
              ? "rgba(12,12,14,0.9)"
              : theme.cardBackground + "E6",
            border: `1px solid ${borderColor}`,
          }}
        >
          {/* Header */}
          <div
            className="px-2 py-1 flex items-center justify-between gap-1"
            style={{
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            {/* View Toggle */}
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-md"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(37,99,235,0.08)",
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
                    viewMode === "grid"
                      ? "rgba(37,99,235,0.14)"
                      : "transparent",
                  color: textPrimary,
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
                    viewMode === "list"
                      ? "rgba(37,99,235,0.14)"
                      : "transparent",
                  color: textPrimary,
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
                  color: textPrimary,
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
                  color: textPrimary,
                  opacity: 0.5,
                }}
              >
                <IconX className="size-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar custom-scrollbar-light">
            {viewMode === "grid" ? (() => {
              // Calculate proper scale to show full slide (16:9 aspect ratio)
              const containerWidth = 256; // Available width in sidebar (280px - padding)
              const scale = containerWidth / SLIDE_MAX_WIDTH;
              const slideHeight = SLIDE_MAX_WIDTH * (9 / 16); // 16:9 aspect ratio
              const thumbnailHeight = slideHeight * scale;
              
              return (
                <div className="space-y-4">
                  {slides.map((slide, index) => {
                    const isActive = slide.id === activeSlideId;
                    return (
                      <div
                        key={slide.id}
                        ref={isActive ? activeSlideRef : null}
                        onClick={() => handleSlideClick(slide.id)}
                        className={`relative cursor-pointer transition-all duration-300 rounded-xl overflow-hidden group ${
                          isActive
                            ? "ring-2 ring-offset-2"
                            : "hover:shadow-lg hover:-translate-y-0.5"
                        }`}
                        style={{
                          borderColor: isActive ? accent : "transparent",
                          boxShadow: isActive
                            ? `0 8px 32px ${accent}30, 0 4px 12px rgba(0,0,0,0.1)`
                            : "0 2px 8px rgba(0,0,0,0.06)",
                          background: isActive 
                            ? `linear-gradient(135deg, ${accent}15 0%, ${accent}05 100%)`
                            : "transparent",
                          // Ring color via CSS variable
                          ["--tw-ring-color" as any]: accent,
                        }}
                        data-slide-preview-id={slide.id}
                      >
                        {/* Delete Button - Shows on hover */}
                        {slides.length > 1 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 h-7 w-7 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full backdrop-blur-sm"
                            onClick={(e) => handleDeleteSlide(e, slide.id)}
                            style={{
                              backgroundColor: "rgba(239, 68, 68, 0.9)",
                              color: "white",
                              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                            }}
                            title="Delete slide"
                          >
                            <IconTrash className="size-3.5" />
                          </Button>
                        )}
                        
                        {/* Mini Slide Preview - Properly scaled to show full height */}
                        <div
                          className="relative overflow-hidden rounded-lg"
                          style={{
                            height: `${thumbnailHeight}px`,
                            width: `${containerWidth}px`,
                          }}
                        >
                          <div
                            className="absolute top-0 left-0 pointer-events-none"
                            style={{
                              transform: `scale(${scale})`,
                              transformOrigin: "top left",
                              width: `${SLIDE_MAX_WIDTH}px`,
                              height: `${slideHeight}px`,
                            }}
                          >
                            <SlideCard
                              slide={slide}
                              onUpdateBlock={onUpdateBlock}
                              onDeleteRow={onDeleteRow}
                              onAddColumn={onAddColumn}
                              onAddRowAtTop={onAddRowAtTop}
                              onAddRowAtBottom={onAddRowAtBottom}
                              onUpdateColumnWidths={onUpdateColumnWidths}
                              enableDragHints={false}
                              readOnly={true}
                            />
                          </div>
                          
                          {/* Hover overlay */}
                          <div 
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                              background: `linear-gradient(180deg, transparent 60%, ${isDark ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'} 100%)`,
                            }}
                          />
                        </div>
                        
                        {/* Slide Number Badge - Enhanced */}
                        <div
                          className="absolute top-2 left-2 px-2.5 py-1 rounded-lg text-xs font-semibold z-10 backdrop-blur-sm transition-all duration-200"
                          style={{
                            backgroundColor: isActive
                              ? accent
                              : isDark ? "rgba(255,255,255,0.15)" : "rgba(37,99,235,0.85)",
                            color: "white",
                            boxShadow: isActive 
                              ? `0 2px 8px ${accent}50`
                              : "0 1px 4px rgba(0,0,0,0.15)",
                          }}
                        >
                          {index + 1}
                        </div>
                        
                        {/* Active indicator bar */}
                        {isActive && (
                          <div 
                            className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
                            style={{
                              background: `linear-gradient(90deg, ${accent} 0%, ${accent}80 100%)`,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })() : (
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
                          ? "rgba(37,99,235,0.12)"
                          : "transparent",
                        borderLeft: isActive
                          ? `3px solid ${accent}`
                          : "3px solid transparent",
                      }}
                      data-slide-preview-id={slide.id}
                    >
                      {/* Slide Number */}
                      <div
                        className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: isActive
                            ? accent
                            : "rgba(37,99,235,0.25)",
                          color: isActive ? "white" : textPrimary,
                        }}
                      >
                        {index + 1}
                      </div>
                      {/* Slide Info */}
                      <div className="flex-1 min-w-0">
                        <div
                          className="text-sm font-medium truncate"
                          style={{
                            color: textPrimary,
                          }}
                        >
                          Slide {index + 1}
                        </div>
                        <div
                          className="text-xs truncate"
                          style={{
                            color: textSecondary,
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
                            color: textPrimary,
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
