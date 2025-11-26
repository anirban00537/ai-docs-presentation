"use client";

import React from "react";
import { ThemeSelector } from "@/components/editor/theme-selector";
import type { GlobalTheme } from "@/store/slices/slidesSlice";

type ThemePanelContentProps = {
  activeThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
  globalTheme?: GlobalTheme;
  onThemeChange?: (updates: Partial<Omit<GlobalTheme, "id">>) => void;
};

export const ThemePanelContent: React.FC<ThemePanelContentProps> = ({
  activeThemeId,
  onSelectTheme,
  globalTheme,
  onThemeChange,
}) => {
  const handleSelectTheme = (themeId: string) => {
    onSelectTheme?.(themeId);
  };

  return (
    <ThemeSelector
      activeThemeId={activeThemeId}
      onSelectTheme={handleSelectTheme}
      globalTheme={globalTheme}
      onThemeChange={onThemeChange}
    />
  );
};

