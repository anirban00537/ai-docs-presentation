"use client";

import React from "react";
import { SLIDE_THEMES } from "@/lib/slide-themes";
import { cn } from "@/lib/utils";

type ThemeSelectorProps = {
  activeThemeId?: string;
  onSelectTheme: (themeId: string) => void;
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  activeThemeId,
  onSelectTheme,
}) => {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        Select Theme
      </h3>
      <div className="grid grid-cols-1 gap-3">
        {SLIDE_THEMES.map((theme) => {
          const isActive = activeThemeId === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              className={cn(
                "group w-full rounded-xl border p-3 text-left transition-all duration-200 flex items-center justify-between gap-4 outline-none",
                isActive
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-black/5 dark:border-white/5 bg-white/50 dark:bg-black/20 hover:bg-black/5 dark:hover:bg-white/10 hover:border-black/10 dark:hover:border-white/10"
              )}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div
                  className={cn(
                    "font-medium text-sm truncate transition-colors",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {theme.name}
                </div>
                {theme.description && (
                  <div className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                    {theme.description}
                  </div>
                )}
              </div>
              <div className="flex items-center -space-x-1.5 shrink-0">
                {[
                  theme.background,
                  theme.surface,
                  theme.text,
                  theme.accent,
                ].map((color, i) => (
                  <span
                    key={`${theme.id}-color-${i}`}
                    className="h-5 w-5 rounded-full border-2 border-white dark:border-neutral-900 shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: color, zIndex: 4 - i }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
