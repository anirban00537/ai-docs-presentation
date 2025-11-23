"use client";

import React from "react";
import { XIcon } from "lucide-react";
import type {
  TextPreset,
  ShapePreset,
  FeatureCardPreset,
  IconCardPreset,
  LabelCardPreset,
} from "@/components/editor/editor-toolbar";
import { Button } from "@/components/ui/button";
import { InsertPanelContent } from "./right-sidebar/insert-panel-content";
import { BackgroundPanelContent } from "./right-sidebar/background-panel-content";
import { ThemePanelContent } from "./right-sidebar/theme-panel-content";

export type SidebarPanel = "insert" | "background" | "theme" | null;

type RightSidebarProps = {
  panel: SidebarPanel;
  onClose: () => void;
  // Insert panel props
  onAddText?: (preset: TextPreset) => void;
  onAddShape?: (preset: ShapePreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
  onAddIconCard?: (preset: IconCardPreset) => void;
  onAddLabelCard?: (preset: LabelCardPreset) => void;
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
  onAddText,
  onAddShape,
  onAddFeatureCard,
  onAddIconCard,
  onAddLabelCard,
  backgroundColor,
  onBackgroundColorChange,
  activeThemeId,
  onSelectTheme,
}) => {
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
    <div className="w-[400px] h-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-l border-black/5 dark:border-white/5 flex flex-col shrink-0 min-h-0 transition-all duration-300 z-40">
      <div className="flex items-center justify-between p-4 border-b border-black/5 dark:border-white/5 shrink-0 h-14">
        <h2 className="text-sm font-medium text-foreground/80">{getTitle()}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          onClick={onClose}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div
        className="flex-1 overflow-y-auto p-4 min-h-0 overscroll-contain space-y-4"
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
            onAddText={onAddText || (() => {})}
            onAddShape={onAddShape}
            onAddFeatureCard={onAddFeatureCard}
            onAddIconCard={onAddIconCard}
            onAddLabelCard={onAddLabelCard}
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
