import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  selectActiveSlideId,
  DEFAULT_THEME,
  setActiveSlide,
  addSlide,
  deleteSlide,
  replaceSlideWithLayout,
  reorderSlides,
} from "@/store/slices/slidesSlice";
import {
  IconChevronRight,
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconCopy,
} from "@tabler/icons-react";
import { SlideLayoutSelector } from "./SlideLayoutSelector";
import type { LayoutTemplate } from "@/types/presentation";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { SortableSlideItem } from "./SortableSlideItem";
import { SlideCanvas } from "@/app/(protected)/presentation/[id]/engine";

// --- Types ---

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
  onAddSlide: (afterSlideId?: string) => void;
  onDeleteSlide: (slideId: string) => void;
}

// --- Main Component ---

export const SlideNavigator: React.FC<SlideNavigatorProps> = ({
  slides,
  onUpdateBlock,
  onDeleteRow,
  onAddColumn,
  onAddRowAtTop,
  onAddRowAtBottom,
  onUpdateColumnWidths,
  onAddSlide: onAddSlideProp,
  onDeleteSlide: onDeleteSlideProp,
}) => {
  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [pendingLayout, setPendingLayout] = useState<LayoutTemplate | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  
  // Redux & Theme
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const previousActiveSlideIdRef = useRef<string | null>(null);

  // Measurements
  const sidebarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const containerWidth = 240; // Increased from 220 for better visibility
  const scale = containerWidth / SLIDE_MAX_WIDTH;
  const slideHeight = SLIDE_MAX_WIDTH * (9 / 16);
  const thumbnailHeight = slideHeight * scale;

  // Dnd Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require slight movement to start drag, prevents accidental drags on clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Virtualizer
  const rowVirtualizer = useVirtualizer({
    count: slides.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => thumbnailHeight + 12, // Height + margin
    overscan: 5,
  });

  // Derived Props for Slide Render
  const renderSlideProps = useMemo(() => ({
    onUpdateBlock,
    onDeleteRow,
    onAddColumn,
    onAddRowAtTop,
    onAddRowAtBottom,
    onUpdateColumnWidths,
  }), [onUpdateBlock, onDeleteRow, onAddColumn, onAddRowAtTop, onAddRowAtBottom, onUpdateColumnWidths]);

  // --- Effects ---

  // Handle pending layout application
  useEffect(() => {
    if (
      pendingLayout &&
      activeSlideId &&
      activeSlideId !== previousActiveSlideIdRef.current
    ) {
      // Extract rows from the layout data property
      const rows = pendingLayout.data?.rows ||[];
      const accent = pendingLayout.data?.accent;
      
      dispatch(replaceSlideWithLayout({ 
        slideId: activeSlideId, 
        rows,
        accent 
      }));
      setTimeout(() => setPendingLayout(null), 0);
    }
    previousActiveSlideIdRef.current = activeSlideId;
  }, [activeSlideId, pendingLayout, dispatch]);

  // Scroll active slide into view
  useEffect(() => {
    if (activeSlideId && !isCollapsed && !activeDragId) {
      const activeIndex = slides.findIndex(s => s.id === activeSlideId);
      if (activeIndex !== -1) {
        // Simple timeout to ensure virtualizer is ready
        setTimeout(() => {
          try {
            rowVirtualizer.scrollToIndex(activeIndex, { align: 'center', behavior: 'smooth' });
          } catch(e) {
            // Ignore scroll errors during render/mount
          }
        }, 100);
      }
    }
  }, [activeSlideId, isCollapsed, activeDragId, slides, rowVirtualizer]);

  // --- Handlers ---

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (over && active.id !== over.id) {
      const oldIndex = slides.findIndex((s) => s.id === active.id);
      const newIndex = slides.findIndex((s) => s.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        dispatch(reorderSlides({ slideId: active.id as string, newIndex }));
      }
    }
  };

  const handleSlideClick = useCallback((slideId: string) => {
    dispatch(setActiveSlide(slideId));
  }, [dispatch]);

  const handleAddSlide = useCallback(() => {
    setIsLayoutModalOpen(true);
  }, []);

  const handleSelectLayout = useCallback((template: LayoutTemplate) => {
    setPendingLayout(template);
    onAddSlideProp();
  }, [onAddSlideProp]);

  const handleDeleteSlide = useCallback((e: React.MouseEvent, slideId: string) => {
    e.stopPropagation(); // Prevent slide selection
    if (slides.length <= 1) return;
    onDeleteSlideProp(slideId);
  }, [onDeleteSlideProp, slides.length]);

  const activeDragSlide = useMemo(() => 
    slides.find((s) => s.id === activeDragId),
  [slides, activeDragId]);

  // Drop animation config
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

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
              className="p-3 rounded-xl transition-all hover:scale-105 shadow-md flex items-center justify-center group"
              style={{
                backgroundColor: isDark ? "rgba(30,30,40,0.9)" : "rgba(255,255,255,0.95)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}`,
              }}
            >
              <IconChevronRight size={20} className="text-gray-500 group-hover:text-primary transition-colors" style={{ color: theme.primary }} />
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed left-4 top-1/2 -translate-y-1/2 z-40 font-sans"
            style={{ height: '75vh', maxHeight: '800px' }}
          >
            <div
              className="relative w-[280px] h-full flex flex-col rounded-3xl overflow-hidden shadow-2xl"
              style={{
                backgroundColor: isDark ? "rgba(20, 20, 25, 0.85)" : "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.6)"}`,
                boxShadow: isDark
                  ? "0 20px 50px rgba(0,0,0,0.5), 0 5px 15px rgba(0,0,0,0.2)"
                  : "0 20px 50px rgba(0,0,0,0.1), 0 5px 15px rgba(0,0,0,0.05)",
              }}
            >
              {/* Header */}
              <div 
                className="relative flex items-center justify-between px-5 pt-5 pb-4 z-10 shrink-0"
              >
                <div className="flex flex-col">
                    <span
                    className="text-xs font-bold uppercase tracking-widest opacity-40 mb-0.5"
                    style={{ color: isDark ? "#fff" : "#000" }}
                    >
                    OUTLINE
                    </span>
                    <span className="text-sm font-semibold opacity-90" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                        {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'}
                    </span>
                </div>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleAddSlide}
                    className="p-2 rounded-xl transition-all hover:scale-105 hover:bg-opacity-20 active:scale-95 flex items-center justify-center shadow-sm"
                  
                    title="Add slide"
                  >
                    <IconPlus size={16} stroke={3}
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                  </button>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className="p-2 rounded-xl transition-all opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ color: isDark ? "#fff" : "#000" }}
                    title="Collapse sidebar"
                  >
                    <IconChevronRight size={16} className="rotate-180" />
                  </button>
                </div>
              </div>

              {/* Scrollable List */}
              <div 
                ref={scrollContainerRef}
                className={`relative flex-1 overflow-y-auto px-5 pt-1 pb-4 ${isDark ? 'custom-scrollbar-dark' : 'custom-scrollbar-light'}`}
              >
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={slides.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div
                            style={{
                                height: `${rowVirtualizer.getTotalSize()}px`,
                                width: '100%',
                                position: 'relative',
                            }}
                        >
                            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                                const slide = slides[virtualRow.index];
                                if (!slide) return null;
                                
                                return (
                                    <div
                                        key={slide.id}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            transform: `translateY(${virtualRow.start}px)`,
                                        }}
                                    >
                                        <SortableSlideItem
                                            slide={slide}
                                            index={virtualRow.index}
                                            isActive={slide.id === activeSlideId}
                                            theme={theme}
                                            isDark={isDark}
                                            scale={scale}
                                            slideHeight={slideHeight}
                                            thumbnailHeight={thumbnailHeight}
                                            containerWidth={containerWidth}
                                            onSlideClick={handleSlideClick}
                                            onDeleteSlide={handleDeleteSlide}
                                            slideCount={slides.length}
                                            renderSlideProps={renderSlideProps}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    </SortableContext>

                    {/* Drag Overlay - Shows what we are dragging */}
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeDragSlide ? (
                           <div className="opacity-90 cursor-grabbing" style={{ width: `${containerWidth}px` }}>
                                <div
                                    className="relative overflow-hidden rounded-xl shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-transparent transform scale-105"
                                    style={{
                                        height: `${thumbnailHeight}px`,
                                        width: `${containerWidth}px`,
                                        backgroundColor: theme.cardBackground,
                                    }}
                                >
                                    <div
                                        className="absolute top-0 left-0 pointer-events-none origin-top-left"
                                        style={{
                                            transform: `scale(${scale})`,
                                            width: `${SLIDE_MAX_WIDTH}px`,
                                            height: `${slideHeight}px`,
                                        }}
                                    >
                                        <SlideCanvas slide={activeDragSlide} {...renderSlideProps} enableDragHints={false} readOnly={true} />
                                    </div>
                                </div>
                           </div> 
                        ) : null}
                    </DragOverlay>
                </DndContext>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};


