"use client";

import React from "react";
import { DropdownMenuLabel } from "@/components/ui/dropdown-menu";
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
    <div className="space-y-2">
      <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
        Themes
      </DropdownMenuLabel>
      <div className="h-64 overflow-y-auto pr-1 custom-scrollbar">
        <div className="grid grid-cols-1 gap-1.5 px-1 pb-1">
          {SLIDE_THEMES.map((theme) => {
            const isActive = activeThemeId === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => onSelectTheme(theme.id)}
                className={cn(
                  "w-full rounded-md border px-2.5 py-1.5 text-left text-[11px] transition-colors flex items-center justify-between gap-3",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border/60 hover:border-primary/40 hover:bg-primary/5"
                )}
              >
                <div className="space-y-0.5">
                  <div className="font-medium">{theme.name}</div>
                  {theme.description && (
                    <div className="text-[10px] text-muted-foreground line-clamp-2">
                      {theme.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {[theme.background, theme.text, theme.accent].map((color) => (
                    <span
                      key={color}
                      className="h-3.5 w-3.5 rounded-full border border-border/40"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


