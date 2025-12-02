"use client";

import React from "react";
import { XIcon, Palette, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsertPanelContent } from "./right-sidebar/insert-panel-content";
import { BackgroundPanelContent } from "./right-sidebar/background-panel-content";
import { ThemePanelContent } from "./right-sidebar/theme-panel-content";
import { useWidgetCreation } from "@/hooks/use-widget-creation";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectActiveSlide } from "@/store/slices/slidesSlice";

export type SidebarPanel = "insert" | "background" | "theme" | null;

const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 240;
const MAX_WIDTH = 600;
const STORAGE_KEY = "right-sidebar-width";

type RightSidebarProps = {
  panel: SidebarPanel;
  onClose: () => void;
  onOpenPanel: (panel: SidebarPanel) => void;
  // Background panel props
  backgroundColor?: string[] | string;
  backgroundImage?: string;
  onBackgroundColorChange?: (colors: string[]) => void;
  onBackgroundImageChange?: (imageUrl: string | undefined) => void;
  // Theme panel props
  activeThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
  globalTheme?: import("@/store/slices/slidesSlice").GlobalTheme;
  onThemeChange?: (
    updates: Partial<
      Omit<import("@/store/slices/slidesSlice").GlobalTheme, "id">
    >
  ) => void;
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  panel,
  onClose,
  onOpenPanel,
  backgroundColor,
  backgroundImage,
  onBackgroundColorChange,
  onBackgroundImageChange,
  activeThemeId,
  onSelectTheme,
  globalTheme,
  onThemeChange,
}) => {
  const activeSlide = useAppSelector(selectActiveSlide);
  const {
    handleAddText,
    handleAddFeatureCard,
    handleAddIconCard,
    handleAddImageCard,
    handleAddLabelCard,
    handleAddListCard,
    handleAddQuote,
    handleAddComparisonCard,
    handleAddTitleCard,
    handleAddPricingCard,
  } = useWidgetCreation();

  // Load width from localStorage or use default
  const [width, setWidth] = React.useState(() => {
    if (typeof window === "undefined") return DEFAULT_WIDTH;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored
      ? Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parseInt(stored, 10)))
      : DEFAULT_WIDTH;
  });

  const [isResizing, setIsResizing] = React.useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Save width to localStorage when it changes
  React.useEffect(() => {
    localStorage.setItem(STORAGE_KEY, width.toString());
  }, [width]);

  const handlePointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = React.useCallback(
    (e: PointerEvent) => {
      if (!isResizing) return;

      if (!sidebarRef.current) return;

      const sidebarRect = sidebarRef.current.getBoundingClientRect();
      const newWidth = sidebarRect.right - e.clientX;

      // Clamp width between min and max
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth));
      setWidth(clampedWidth);
    },
    [isResizing]
  );

  const handlePointerUp = React.useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [isResizing, handlePointerMove, handlePointerUp]);

  // When panel is null, show compact icon buttons
  if (!panel) {
    return (
      <div className="h-full flex items-center justify-center shrink-0 z-40 relative">
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm  shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-background dark:hover:bg-neutral-800/80",
              "hover:shadow-sm active:scale-95",
              !activeSlide && "opacity-40 cursor-not-allowed"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("background")}
            title="Background Settings"
          >
            <Palette className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-background dark:hover:bg-neutral-800/80",
              "hover:shadow-sm active:scale-95",
              !activeSlide && "opacity-40 cursor-not-allowed"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("theme")}
            title="Theme Settings"
          >
            <LayoutTemplate className="h-5 w-5" />
          </Button>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch (panel) {
      case "insert":
        return "Insert Widget";
      case "background":
        return "Background Settings";
      case "theme":
        return "Theme Settings";
      default:
        return "";
    }
  };

  return (
    <div className="h-full flex items-center shrink-0 z-40 relative">
      {/* Icon buttons on the left */}
      <div className="h-full flex items-center justify-center shrink-0">
        <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm border border-border/40 dark:border-border/30 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-background dark:hover:bg-neutral-800/80",
              "hover:shadow-sm active:scale-95",
              !activeSlide && "opacity-40 cursor-not-allowed",
              panel === "background" && "bg-primary/10 text-primary"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("background")}
            title="Background Settings"
          >
            <Palette className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-200",
              "text-muted-foreground hover:text-foreground",
              "hover:bg-background dark:hover:bg-neutral-800/80",
              "hover:shadow-sm active:scale-95",
              !activeSlide && "opacity-40 cursor-not-allowed",
              panel === "theme" && "bg-primary/10 text-primary"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("theme")}
            title="Theme Settings"
          >
            <LayoutTemplate className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar content */}
      <div
        ref={sidebarRef}
        className="h-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-l border-border/30 dark:border-border/30 flex flex-col shrink-0 min-h-0 z-40 shadow-[0_12px_32px_-24px_rgba(15,23,42,0.35)] relative"
        style={{ width: `${width}px` }}
      >
        {/* Resize handle */}
        <div
          className={cn(
            "absolute left-0 top-0 bottom-0 w-[4px] cursor-ew-resize z-50 transition-colors",
            "hover:bg-primary/40 active:bg-primary/60",
            isResizing && "bg-primary/60"
          )}
          onPointerDown={handlePointerDown}
          aria-label="Resize sidebar"
          role="separator"
          aria-orientation="vertical"
          style={{
            marginLeft: "-2px",
          }}
        />
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 dark:border-border/25 shrink-0 h-16">
          <h2 className="text-sm font-semibold text-foreground/90 tracking-tight">
            {getTitle()}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 active:scale-95"
            onClick={onClose}
          >
            <XIcon className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div
          className="flex-1 overflow-y-auto min-h-0 overscroll-contain space-y-6 0  mt-1 pt-6"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {panel === "insert" && (
            <InsertPanelContent
              onAddFeatureCard={handleAddFeatureCard}
              onAddIconCard={handleAddIconCard}
              onAddImageCard={handleAddImageCard}
              onAddLabelCard={handleAddLabelCard}
              onAddListCard={handleAddListCard}
              onAddQuote={handleAddQuote}
              onAddComparisonCard={handleAddComparisonCard}
              onAddTitleCard={handleAddTitleCard}
              onAddPricingCard={handleAddPricingCard}
            />
          )}

          {panel === "background" && (
            <BackgroundPanelContent
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              onBackgroundColorChange={onBackgroundColorChange}
              onBackgroundImageChange={onBackgroundImageChange}
            />
          )}

          {panel === "theme" && (
            <ThemePanelContent
              activeThemeId={activeThemeId}
              onSelectTheme={onSelectTheme}
              globalTheme={globalTheme}
              onThemeChange={onThemeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};
