"use client";

import React from "react";
import { ThemeSelector } from "@/components/editor/theme-selector";

type ThemePanelContentProps = {
  activeThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
};

export const ThemePanelContent: React.FC<ThemePanelContentProps> = ({
  activeThemeId,
  onSelectTheme,
}) => {
  const handleSelectTheme = (themeId: string) => {
    onSelectTheme?.(themeId);
  };

  return (
    <ThemeSelector
      activeThemeId={activeThemeId}
      onSelectTheme={handleSelectTheme}
    />
  );
};

