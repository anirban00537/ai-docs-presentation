import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectTheme,
  selectActiveSlideId,
  DEFAULT_THEME,
  setActiveSlide,
  replaceSlideWithLayout,
} from "@/store/slices/slidesSlice";
import {
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { SlideLayoutSelector } from "./SlideLayoutSelector";
import type { LayoutTemplate } from "@/types/presentation";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarList } from "./SidebarList";
import { cn } from "@/lib/utils";

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
  isMobile?: boolean;
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
  isMobile = false,
}) => {
  // State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [pendingLayout, setPendingLayout] = useState<LayoutTemplate | null>(null);

  // Redux & Theme
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const previousActiveSlideIdRef = useRef<string | null>(null);

  // Measurements
  const sidebarRef = useRef<HTMLDivElement>(null);
  const containerWidth = isMobile ? 240 : 180;

  // --- Effects ---

  // Handle pending layout application
  useEffect(() => {
    if (
      pendingLayout &&
      activeSlideId &&
      activeSlideId !== previousActiveSlideIdRef.current
    ) {
      const rows = pendingLayout.data?.rows || [];
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

  // --- Handlers ---

  const handleAddSlide = useCallback(() => {
    setIsLayoutModalOpen(true);
  }, []);

  const handleSelectLayout = useCallback((template: LayoutTemplate) => {
    setPendingLayout(template);
    onAddSlideProp();
  }, [onAddSlideProp]);

  const handleDeleteSlide = useCallback((slideId: string) => {
    if (slides.length <= 1) return;
    onDeleteSlideProp(slideId);
  }, [onDeleteSlideProp, slides.length]);

  return (
    <>
      <SlideLayoutSelector
        isOpen={isLayoutModalOpen}
        onClose={() => setIsLayoutModalOpen(false)}
        onSelectLayout={handleSelectLayout}
      />

      <div className={cn(
        "relative h-full flex flex-col z-40 bg-transparent shrink-0",
        isMobile && "w-full"
      )}>
        <AnimatePresence mode="wait" initial={false}>
          {isCollapsed && !isMobile ? (
            <motion.div
              key="collapsed"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 60, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="h-full flex flex-col items-center pt-8 border-r overflow-hidden"
              style={{
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                backgroundColor: isDark ? "rgba(20, 20, 25, 0.5)" : "rgba(255, 255, 255, 0.5)",
              }}
            >
              <button
                onClick={() => setIsCollapsed(false)}
                className="p-3 rounded-xl transition-all hover:scale-105 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <IconChevronRight size={20} style={{ color: theme.primary }} />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              ref={sidebarRef}
              initial={isMobile ? false : { width: 0, opacity: 0 }}
              animate={{ width: containerWidth, opacity: 1 }}
              exit={isMobile ? { opacity: 0 } : { width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "h-full relative flex flex-col overflow-hidden",
                !isMobile && "border-r"
              )}
              style={{
                backgroundColor: isDark ? "rgba(20, 20, 25, 0.85)" : "rgba(255, 255, 255, 0.85)",
                backdropFilter: isMobile ? "none" : "blur(20px)",
                borderRight: isMobile ? "none" : `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
              }}
            >
              <div
                className="relative flex items-center justify-between px-4 pt-5 pb-4 z-10 shrink-0"
                style={{ minWidth: containerWidth }}
              >
                <div className="flex flex-col">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-0.5"
                    style={{ color: isDark ? "#fff" : "#000" }}
                  >
                    OUTLINE
                  </span>
                  <span className="text-xs font-semibold opacity-90" style={{ color: isDark ? "#fff" : "#1a1a1a" }}>
                    {slides.length} {slides.length === 1 ? 'Slide' : 'Slides'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleAddSlide}
                    className="p-2 rounded-xl transition-all hover:scale-105 hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 flex items-center justify-center"
                    title="Add slide"
                  >
                    <IconPlus size={16} stroke={3}
                      style={{ color: isDark ? "#fff" : "#000" }}
                    />
                  </button>
                  {!isMobile && (
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="p-2 rounded-xl transition-all opacity-40 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10"
                      style={{ color: isDark ? "#fff" : "#000" }}
                      title="Collapse sidebar"
                    >
                      <IconChevronRight size={16} className="rotate-180" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex flex-col w-full h-full">
                <SidebarList
                  slides={slides}
                  containerWidth={containerWidth}
                  onUpdateBlock={onUpdateBlock}
                  onDeleteRow={onDeleteRow}
                  onAddColumn={onAddColumn}
                  onAddRowAtTop={onAddRowAtTop}
                  onAddRowAtBottom={onAddRowAtBottom}
                  onUpdateColumnWidths={onUpdateColumnWidths}
                  onDeleteSlide={handleDeleteSlide}
                />
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};
