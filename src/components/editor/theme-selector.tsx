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
    <div className="space-y-4">
      <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
                "group w-full rounded-xl border p-4 text-left transition-all duration-200 flex items-center justify-between gap-4 outline-none",
                isActive
                  ? "border-primary bg-primary/10 dark:bg-primary/5 shadow-md ring-2 ring-primary/30 hover:shadow-lg"
                  : "border-border/50 bg-background/60 dark:bg-background/40 hover:bg-accent/50 hover:border-border hover:shadow-sm",
                "active:scale-[0.98]"
              )}
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div
                  className={cn(
                    "font-semibold text-sm truncate transition-colors tracking-tight",
                    isActive ? "text-primary" : "text-foreground"
                  )}
                >
                  {theme.name}
                </div>
                {theme.description && (
                  <div className="text-xs text-muted-foreground/80 line-clamp-1 group-hover:text-foreground/70 transition-colors">
                    {theme.description}
                  </div>
                )}
              </div>
              <div className="flex items-center -space-x-1.5 shrink-0">
                <span
                  key={`${theme.id}-background`}
                  className="h-6 w-6 rounded-full border-2 border-background dark:border-neutral-900 shadow-sm ring-1 ring-border/50"
                  style={
                    theme.background.length === 1
                      ? { backgroundColor: theme.background[0] }
                      : {
                          background: `linear-gradient(to right, ${theme.background.join(
                            ", "
                          )})`,
                        }
                  }
                />
                {[theme.surface, theme.text, theme.accent].map((color, i) => (
                  <span
                    key={`${theme.id}-color-${i}`}
                    className="h-6 w-6 rounded-full border-2 border-background dark:border-neutral-900 shadow-sm ring-1 ring-border/50"
                    style={{ backgroundColor: color, zIndex: 3 - i }}
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
