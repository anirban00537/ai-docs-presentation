import React, { useState, useEffect, useRef, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { SlideContainer } from "./SlideContainer";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  selectActiveSlideId,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import {
  IconChevronRight,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import {
  setActiveSlide,
  addSlide,
  deleteSlide,
  replaceSlideWithLayout,
} from "@/store/slices/slidesSlice";
import { useAppDispatch } from "@/store/hooks";
import { SlideLayoutSelector } from "./SlideLayoutSelector";
import type { LayoutTemplate } from "@/types/presentation";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";

interface SlideNavigatorProps {
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

export const SlideNavigator: React.FC<SlideNavigatorProps> = ({
  slides,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [pendingLayout, setPendingLayout] = useState<LayoutTemplate | null>(null);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const previousActiveSlideIdRef = useRef<string | null>(null);
  
  // Ref for the scrollable container (for virtualization)
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Calculate proper scale to show full slide (16:9 aspect ratio)
  const containerWidth = 220;
  const scale = containerWidth / SLIDE_MAX_WIDTH;
  const slideHeight = SLIDE_MAX_WIDTH * (9 / 16);
  const thumbnailHeight = slideHeight * scale;
  const itemHeight = thumbnailHeight + 12; // Height + gap

  // Virtualized list configuration
  const virtualizer = useVirtualizer({
    count: slides.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => itemHeight,
    overscan: 2, // Render 2 items above and below the visible area
  });

  // Apply pending layout when a new slide becomes active
  useEffect(() => {
    if (
      pendingLayout &&
      activeSlideId &&
      activeSlideId !== previousActiveSlideIdRef.current
    ) {
      const rows = pendingLayout.getRows();
      dispatch(replaceSlideWithLayout({ 
        slideId: activeSlideId, 
        rows,
        accent: pendingLayout.accent 
      }));
      setTimeout(() => setPendingLayout(null), 0);
    }
    previousActiveSlideIdRef.current = activeSlideId;
  }, [activeSlideId, pendingLayout, dispatch]);

  // Scroll to active slide when it changes
  useEffect(() => {
    if (activeSlideId && !isCollapsed) {
      const activeIndex = slides.findIndex(s => s.id === activeSlideId);
      if (activeIndex !== -1) {
        // Scroll the virtualizer to the active slide
        setTimeout(() => {
          virtualizer.scrollToIndex(activeIndex, { align: 'center', behavior: 'smooth' });
        }, 100);
      }
    }
  }, [activeSlideId, isCollapsed, slides, virtualizer]);

  const handleSlideClick = useCallback((slideId: string) => {
    dispatch(setActiveSlide(slideId));
    const slideElement = document.querySelector(`[data-slide-id="${slideId}"]`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [dispatch]);

  const handleAddSlide = useCallback(() => {
    setIsLayoutModalOpen(true);
  }, []);

  const handleSelectLayout = useCallback((template: LayoutTemplate) => {
    setPendingLayout(template);
    dispatch(addSlide({}));
  }, [dispatch]);

  const handleDeleteSlide = useCallback((e: React.MouseEvent, slideId: string) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    dispatch(deleteSlide(slideId));
  }, [dispatch, slides.length]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <>
      <SlideLayoutSelector
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        onSelectLayout={handleSelectLayout}
      />
      
      {/* Collapsed Toggle Button */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
          >
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2 rounded-xl transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? "rgba(30,30,35,0.9)" : "rgba(255,255,255,0.95)",
                backdropFilter: "blur(12px)",
              }}
            >
              <IconChevronRight size={18} style={{ color: theme.primary }} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Sidebar */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            ref={sidebarRef}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
          >
            <div
              className="relative w-[260px] max-h-[75vh] flex flex-col rounded-2xl overflow-hidden"
              style={{
                backgroundColor: isDark 
                  ? "rgba(30, 30, 40, 0.5)" 
                  : "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(32px) saturate(200%)",
                WebkitBackdropFilter: "blur(32px) saturate(200%)",
                boxShadow: isDark
                  ? `
                    0 1px 0 0 rgba(255, 255, 255, 0.1) inset,
                    0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
                    0 8px 40px rgba(0, 0, 0, 0.4),
                    0 2px 8px rgba(0, 0, 0, 0.2)
                  `
                  : `
                    0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                    0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
                    0 8px 40px rgba(0, 0, 0, 0.08),
                    0 2px 8px rgba(0, 0, 0, 0.04)
                  `,
              }}
            >
              {/* Glass shine overlay */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.3) 100%)",
                }}
              />
              {/* Header */}
              <div 
                className="relative py-2.5 flex items-center justify-between"
                style={{ paddingLeft: 14, paddingRight: 14 }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-wider opacity-50"
                  style={{ color: isDark ? "#fff" : "#000" }}
                >
                  Slides ({slides.length})
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleAddSlide}
                    className="p-1.5 rounded-lg transition-all hover:scale-105"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                      color: theme.primary,
                    }}
                    title="Add slide"
                  >
                    <IconPlus size={14} stroke={2.5} />
                  </button>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-1.5 rounded-lg transition-all opacity-40 hover:opacity-100"
                    style={{ color: isDark ? "#fff" : "#000" }}
                    title="Collapse sidebar"
                  >
                    <IconChevronRight size={14} className="rotate-180" />
                  </button>
                </div>
              </div>

              {/* Virtualized Slides List */}
              <div 
                ref={scrollContainerRef}
                className={`relative flex-1 overflow-y-auto pb-3 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}
                style={{ paddingLeft: 18, paddingRight: 14, paddingTop: 8 }}
              >
                {/* Virtualized container with total height */}
                <div
                  style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {/* Only render visible items */}
                  {virtualItems.map((virtualItem) => {
                    const slide = slides[virtualItem.index];
                    const index = virtualItem.index;
                    const isActive = slide.id === activeSlideId;

                    return (
                      <div
                        key={slide.id}
                        data-slide-preview-id={slide.id}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: `${virtualItem.size}px`,
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                      >
                        <div
                          onClick={() => handleSlideClick(slide.id)}
                          className="relative cursor-pointer group"
                          style={{ paddingBottom: 12 }}
                        >
                          {/* Slide Preview Container */}
                          <div
                            className="relative overflow-hidden rounded-xl transition-all duration-200"
                            style={{
                              height: `${thumbnailHeight}px`,
                              outline: isActive ? `2px solid ${theme.primary}` : "none",
                              outlineOffset: "2px",
                            }}
                          >
                            {/* Scaled SlideContainer */}
                            <div
                              className="absolute top-0 left-0 pointer-events-none"
                              style={{
                                transform: `scale(${scale})`,
                                transformOrigin: "top left",
                                width: `${SLIDE_MAX_WIDTH}px`,
                                height: `${slideHeight}px`,
                              }}
                            >
                              <SlideContainer
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

                            {/* Hover Overlay */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                              style={{
                                background: isDark
                                  ? "rgba(0,0,0,0.4)"
                                  : "rgba(0,0,0,0.2)",
                              }}
                            >
                              {slides.length > 1 && (
                                <button
                                  onClick={(e) => handleDeleteSlide(e, slide.id)}
                                  className="p-2 rounded-lg transition-all hover:scale-110"
                                  style={{
                                    backgroundColor: "rgba(239,68,68,0.9)",
                                    color: "white",
                                  }}
                                  title="Delete slide"
                                >
                                  <IconTrash size={14} />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Slide Number */}
                          <div
                            className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-semibold"
                            style={{
                              backgroundColor: isActive ? theme.primary : (isDark ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.9)"),
                              color: isActive ? "white" : (isDark ? "white" : "#000"),
                            }}
                          >
                            {index + 1}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

