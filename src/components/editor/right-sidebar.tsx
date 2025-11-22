"use client";

import React from "react";
import { XIcon } from "lucide-react";
import type {
  TextPreset,
  ShapePreset,
  FeatureCardPreset,
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
  // Background panel props
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
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
    <div className="w-[400px] h-full bg-background border-l border-border/40 flex flex-col min-h-0">
      <div className="flex items-center justify-between p-4 border-b border-border/40 shrink-0">
        <h2 className="text-lg font-semibold">{getTitle()}</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {panel === "insert" && (
          <InsertPanelContent
            onAddText={onAddText || (() => {})}
            onAddShape={onAddShape}
            onAddFeatureCard={onAddFeatureCard}
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
