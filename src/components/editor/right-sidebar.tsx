"use client";

import React from "react";
import { XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InsertPanelContent } from "./right-sidebar/insert-panel-content";
import { BackgroundPanelContent } from "./right-sidebar/background-panel-content";
import { ThemePanelContent } from "./right-sidebar/theme-panel-content";
import { useWidgetCreation } from "@/hooks/use-widget-creation";

export type SidebarPanel = "insert" | "background" | "theme" | null;

type RightSidebarProps = {
  panel: SidebarPanel;
  onClose: () => void;
  // Background panel props
  backgroundColor?: string[] | string;
  onBackgroundColorChange?: (colors: string[]) => void;
  // Theme panel props
  activeThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
};

export const RightSidebar: React.FC<RightSidebarProps> = ({
  panel,
  onClose,
  backgroundColor,
  onBackgroundColorChange,
  activeThemeId,
  onSelectTheme,
}) => {
  const {
    handleAddText,
    handleAddShape,
    handleAddFeatureCard,
    handleAddIconCard,
    handleAddLabelCard,
    handleAddListCard,
    handleAddQuote,
  } = useWidgetCreation();
  if (!panel) return null;

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
    <div className="w-[400px] h-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-l border-border/60 dark:border-border/40 flex flex-col shrink-0 min-h-0 transition-all duration-300 z-40 shadow-lg">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 dark:border-border/40 shrink-0 h-16">
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
        className="flex-1 overflow-y-auto px-5 py-5 min-h-0 overscroll-contain space-y-6"
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
            onAddText={handleAddText}
            onAddShape={handleAddShape}
            onAddFeatureCard={handleAddFeatureCard}
            onAddIconCard={handleAddIconCard}
            onAddLabelCard={handleAddLabelCard}
            onAddListCard={handleAddListCard}
            onAddQuote={handleAddQuote}
            onClose={onClose}
          />
        )}

        {panel === "background" && (
          <BackgroundPanelContent
            backgroundColor={backgroundColor}
            onBackgroundColorChange={onBackgroundColorChange}
          />
        )}

        {panel === "theme" && (
          <ThemePanelContent
            activeThemeId={activeThemeId}
            onSelectTheme={onSelectTheme}
          />
        )}
      </div>
    </div>
  );
};
