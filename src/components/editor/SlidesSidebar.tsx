import React, { useState, useEffect, useRef } from "react";
import { SlideCard } from "./SlideCard";
import type { Slide } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import {
  selectTheme,
  selectActiveSlideId,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import { Card } from "@/components/ui/card";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { setActiveSlide } from "@/store/slices/slidesSlice";
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
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeSlideRef = useRef<HTMLDivElement>(null);

  // Scroll to active slide when it changes
  useEffect(() => {
    if (activeSlideRef.current && !isCollapsed) {
      activeSlideRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeSlideId, isCollapsed]);

  const handleSlideClick = (slideId: string) => {
    dispatch(setActiveSlide(slideId));
    // Scroll to the slide in the main editor
    const slideElement = document.querySelector(`[data-slide-id="${slideId}"]`);
    if (slideElement) {
      slideElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <>
      {/* Collapsed Toggle Button - Always visible when collapsed */}
      {isCollapsed && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40">
          <Card
            className="p-2 shadow-lg border"
            style={{
              backgroundColor: theme.cardBackground,
              borderColor: theme.primary + "20",
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
          </Card>
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
        <Card
          className="w-64 h-[600px] max-h-[80vh] flex flex-col shadow-xl border"
          style={{
            backgroundColor: theme.cardBackground,
            borderColor: theme.primary + "20",
          }}
        >
          {/* Header */}
          <div
            className="px-2.5 py-1.5 flex items-center justify-between"
            style={{
              borderBottom: `1px solid ${theme.primary}15`,
            }}
          >
            <span
              className="text-[11px] font-medium tracking-wide uppercase"
              style={{
                color: theme.bodyColor,
                opacity: 0.7,
              }}
            >
              {slides.length} Slide{slides.length !== 1 ? "s" : ""}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:bg-transparent"
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                color: theme.bodyColor,
                opacity: 0.6,
              }}
            >
              <IconChevronLeft className="size-3" />
            </Button>
          </div>

          {/* Slides List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar custom-scrollbar-light">
            {slides.map((slide, index) => {
              const isActive = slide.id === activeSlideId;
              return (
                <div
                  key={slide.id}
                  ref={isActive ? activeSlideRef : null}
                  onClick={() => handleSlideClick(slide.id)}
                  className={`relative cursor-pointer transition-all rounded-lg overflow-hidden border-2 ${
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
        </Card>
      </div>
    </>
  );
};
