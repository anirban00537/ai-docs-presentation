"use client";

import React from "react";
import { Plus, LayoutTemplate } from "lucide-react";
import { cn } from "@/lib/utils";
import Slide from "@/components/editor/slide";
import type { SlideModel, GlobalTheme } from "@/store/slices/slidesSlice";

export interface SlideWrapperProps {
  slide: SlideModel;
  isActive: boolean;
  selectedId: string | null;
  editingId: string | null;
  liveOverrides: Record<string, any>;
  onSelectWidget: (id: string | null) => void;
  onSetLiveOverride: (id: string, updates: any) => void;
  onClearLiveOverride: (id: string) => void;
  globalTheme: GlobalTheme | null;
  registerSlide: (slideId: string, element: HTMLDivElement | null) => void;
  onAddSlideAfter: (slideId: string) => void;
  onAddAsLayout?: (slideId: string) => void;
  isSavingLayout?: boolean;
}

export const SlideWrapper: React.FC<SlideWrapperProps> = ({
  slide,
  isActive,
  selectedId,
  editingId,
  liveOverrides,
  onSelectWidget,
  onSetLiveOverride,
  onClearLiveOverride,
  globalTheme,
  registerSlide,
  onAddSlideAfter,
  onAddAsLayout,
  isSavingLayout = false,
}) => {
  const slideRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (slideRef.current) {
      registerSlide(slide.id, slideRef.current);
    }
    return () => {
      registerSlide(slide.id, null);
    };
  }, [slide.id, registerSlide]);

  // Calculate slide height based on viewport height (accounting for toolbar)
  const [slideHeight, setSlideHeight] = React.useState(0);

  React.useEffect(() => {
    const updateHeight = () => {
      // Viewport height minus toolbar (pt-20 = 5rem = 80px)
      const height = window.innerHeight - 80;
      setSlideHeight(height);
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <div
      ref={slideRef}
      data-slide-id={slide.id}
      className="group relative w-full flex flex-col justify-center items-center"
      style={{
        minHeight: slideHeight > 0 ? `${slideHeight}px` : "100vh",
        height: slideHeight > 0 ? `${slideHeight}px` : "100vh",
      }}
    >
      <Slide
        slide={slide}
        selectedId={isActive ? selectedId : null}
        editingId={isActive ? editingId : null}
        liveOverrides={isActive ? liveOverrides : {}}
        onSelectWidget={isActive ? onSelectWidget : () => {}}
        onSetLiveOverride={isActive ? onSetLiveOverride : () => {}}
        onClearLiveOverride={isActive ? onClearLiveOverride : () => {}}
        globalTheme={globalTheme || undefined}
        showSnapLines={isActive}
      />
      {/* Add Slide and Add as Layout Buttons - appears on hover */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none group-hover:pointer-events-auto z-10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddSlideAfter(slide.id);
            }}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-lg",
              "transition-all duration-200 ease-out",
              "hover:scale-105 active:scale-95",
              isDarkTheme
                ? "bg-oklch(0.1 0.01 250) border border-neutral-800 text-white/80 hover:text-white hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
                : "bg-oklch(1 0 0) border border-border text-muted-foreground hover:text-foreground hover:bg-background shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
            )}
            style={{
              backgroundColor: isDarkTheme
                ? "oklch(0.1 0.01 250)"
                : "oklch(1 0 0)",
              boxShadow: isDarkTheme
                ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
                : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
            }}
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm font-semibold">Add Slide</span>
          </button>
          {onAddAsLayout && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddAsLayout(slide.id);
              }}
              disabled={isSavingLayout}
              className={cn(
                "flex items-center justify-center gap-2 px-4 py-2 rounded-xl shadow-lg",
                "transition-all duration-200 ease-out",
                "hover:scale-105 active:scale-95",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isDarkTheme
                  ? "bg-oklch(0.1 0.01 250) border border-neutral-800 text-white/80 hover:text-white hover:bg-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
                  : "bg-oklch(1 0 0) border border-border text-muted-foreground hover:text-foreground hover:bg-background shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
              )}
              style={{
                backgroundColor: isDarkTheme
                  ? "oklch(0.1 0.01 250)"
                  : "oklch(1 0 0)",
                boxShadow: isDarkTheme
                  ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
                  : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
              }}
            >
              <LayoutTemplate className="w-4 h-4" />
              <span className="text-sm font-semibold">
                {isSavingLayout ? "Saving..." : "Add as Layout"}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

