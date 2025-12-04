"use client";

import React from "react";
import { XIcon, Palette, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundPanelContent } from "./right-sidebar/background-panel-content";
import { ThemeSelector } from "./theme-selector";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import {
  selectActiveSlide,
  selectGlobalTheme,
} from "@/store/slices/slidesSlice";

export type SidebarPanel = "background" | "theme" | null;

const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 240;
const MAX_WIDTH = 600;
const STORAGE_KEY = "right-sidebar-width";

type RightSidebarProps = {
  panel: SidebarPanel;
  onClose: () => void;
  onOpenPanel: (panel: SidebarPanel) => void;
  // Background panel props
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundBlur?: boolean;
  onBackgroundColorChange?: (color: string) => void;
  onBackgroundImageChange?: (imageUrl: string | undefined) => void;
  onBackgroundBlurChange?: (blur: boolean) => void;
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
  backgroundBlur,
  onBackgroundColorChange,
  onBackgroundImageChange,
  onBackgroundBlurChange,
  activeThemeId,
  onSelectTheme,
  globalTheme,
  onThemeChange,
}) => {
  const activeSlide = useAppSelector(selectActiveSlide);
  const globalThemeState = useAppSelector(selectGlobalTheme);
  const effectiveTheme = globalTheme || globalThemeState;
  const isDarkTheme = effectiveTheme?.tone === "dark";

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
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center justify-center">
        <div
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl",
            // Simple border and shadow - theme-aware
            isDarkTheme
              ? "border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
              : "border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
          )}
          style={{
            // Use darker colors from globals.css - theme-aware
            backgroundColor: isDarkTheme
              ? "oklch(0.1 0.01 250)"
              : "oklch(1 0 0)",
            // Simple shadow without 3D effects
            boxShadow: isDarkTheme
              ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
              : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-300 ease-out",
              "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              !activeSlide && "opacity-40 cursor-not-allowed",
              isDarkTheme
                ? "text-white/80 hover:text-white hover:bg-black/70"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("background")}
            title="Background Settings"
          >
            <Palette className="h-5 w-5 transition-transform duration-300 ease-out" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-300 ease-out",
              "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              !activeSlide && "opacity-40 cursor-not-allowed",
              isDarkTheme
                ? "text-white/80 hover:text-white hover:bg-black/70"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("theme")}
            title="Theme Settings"
          >
            <LayoutTemplate className="h-5 w-5 transition-transform duration-300 ease-out" />
          </Button>
        </div>
      </div>
    );
  }

  const getTitle = () => {
    switch (panel) {
      case "background":
        return "Background Settings";
      case "theme":
        return "Theme Settings";
      default:
        return "";
    }
  };

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex items-center gap-3">
      {/* Icon buttons on the left */}
      <div className="flex items-center justify-center">
        <div
          className={cn(
            "flex flex-col items-center gap-2 p-3 rounded-2xl",
            // Simple border and shadow - theme-aware
            isDarkTheme
              ? "border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
              : "border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
          )}
          style={{
            // Use darker colors from globals.css - theme-aware
            backgroundColor: isDarkTheme
              ? "oklch(0.1 0.01 250)"
              : "oklch(1 0 0)",
            // Simple shadow without 3D effects
            boxShadow: isDarkTheme
              ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
              : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-300 ease-out",
              "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              !activeSlide && "opacity-40 cursor-not-allowed",
              panel === "background" && "bg-primary/10 text-primary",
              isDarkTheme
                ? "text-white/80 hover:text-white hover:bg-black/70"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("background")}
            title="Background Settings"
          >
            <Palette className="h-5 w-5 transition-transform duration-300 ease-out" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-lg transition-all duration-300 ease-out",
              "hover:scale-[1.02] hover:shadow-md active:scale-[0.98]",
              !activeSlide && "opacity-40 cursor-not-allowed",
              panel === "theme" && "bg-primary/10 text-primary",
              isDarkTheme
                ? "text-white/80 hover:text-white hover:bg-black/70"
                : "text-muted-foreground hover:text-foreground hover:bg-background"
            )}
            disabled={!activeSlide}
            onClick={() => onOpenPanel("theme")}
            title="Theme Settings"
          >
            <LayoutTemplate className="h-5 w-5 transition-transform duration-300 ease-out" />
          </Button>
        </div>
      </div>

      {/* Sidebar content */}
      <div
        ref={sidebarRef}
        className={cn(
          "flex flex-col min-h-0 relative rounded-2xl overflow-hidden",
          // Medium height, centered vertically
          "h-[70vh]",
          // Simple border and shadow - theme-aware
          "transition-all duration-300 ease-out",
          isDarkTheme
            ? "border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
            : "border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
        )}
        style={{
          width: `${width}px`,
          // Use darker colors from globals.css - theme-aware
          backgroundColor: isDarkTheme ? "oklch(0.1 0.01 250)" : "oklch(1 0 0)",
          // Simple shadow without 3D effects
          boxShadow: isDarkTheme
            ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
            : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
        }}
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
        <div
          className={cn(
            "flex items-center justify-between px-5 py-4 shrink-0 h-16",
            isDarkTheme ? "border-b border-white/10" : "border-b border-border"
          )}
        >
          <h2
            className={cn(
              "text-sm font-semibold tracking-tight",
              isDarkTheme ? "text-white/90" : "text-foreground/90"
            )}
          >
            {getTitle()}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-lg hover:bg-accent/50 transition-all duration-300 ease-out",
              "hover:scale-[1.02] active:scale-[0.98]",
              isDarkTheme
                ? "text-white/80 hover:text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={onClose}
          >
            <XIcon className="h-4 w-4 transition-transform duration-300 ease-out" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <div
          className={cn(
            "flex-1 overflow-y-auto min-h-0 overscroll-contain space-y-6 px-2 custom-scrollbar",
            isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
          )}
        >
          {panel === "background" && (
            <BackgroundPanelContent
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              backgroundBlur={backgroundBlur}
              onBackgroundColorChange={onBackgroundColorChange}
              onBackgroundImageChange={onBackgroundImageChange}
              onBackgroundBlurChange={onBackgroundBlurChange}
            />
          )}

          {panel === "theme" && (
            <ThemeSelector
              activeThemeId={activeThemeId}
              onSelectTheme={onSelectTheme || (() => {})}
              globalTheme={globalTheme}
              onThemeChange={onThemeChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};
