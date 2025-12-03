"use client";

import React from "react";
import { SLIDE_THEMES } from "@/lib/slide-themes";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeEditor } from "./theme-editor";
import type { GlobalTheme } from "@/store/slices/slidesSlice";

type ThemeSelectorProps = {
  activeThemeId?: string;
  onSelectTheme: (themeId: string) => void;
  globalTheme?: GlobalTheme;
  onThemeChange?: (updates: Partial<Omit<GlobalTheme, "id">>) => void;
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  activeThemeId,
  onSelectTheme,
  globalTheme,
  onThemeChange,
}) => {
  return (
    <Tabs defaultValue="select" className="w-full">
      <TabsList className="w-full grid grid-cols-2 mb-4">
        <TabsTrigger value="select">Select Theme</TabsTrigger>
        <TabsTrigger value="edit">Edit Global Theme</TabsTrigger>
      </TabsList>

      <TabsContent value="select" className="mt-0">
        <div className="space-y-4">
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
                      style={{ backgroundColor: theme.background }}
                    />
                    {[theme.surface, theme.text, theme.accent].map(
                      (color, i) => (
                        <span
                          key={`${theme.id}-color-${i}`}
                          className="h-6 w-6 rounded-full border-2 border-background dark:border-neutral-900 shadow-sm ring-1 ring-border/50"
                          style={{ backgroundColor: color, zIndex: 3 - i }}
                        />
                      )
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="edit" className="mt-0">
        {globalTheme && onThemeChange ? (
          <ThemeEditor theme={globalTheme} onThemeChange={onThemeChange} />
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">
            Theme editor not available
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
