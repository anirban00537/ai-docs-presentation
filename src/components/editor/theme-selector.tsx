"use client";

import React from "react";
import { SLIDE_THEMES } from "@/lib/slide-themes";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeEditor } from "./theme-editor";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { LayoutTemplate, Palette } from "lucide-react";

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
  const globalThemeState = useAppSelector(selectGlobalTheme);
  const effectiveTheme = globalTheme || globalThemeState;
  const isDarkTheme = effectiveTheme?.tone === "dark";

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden min-h-0">
      <Tabs defaultValue="select" className="w-full h-full flex flex-col">
        {/* Tabs */}
        <div
          className={cn(
            "px-4 pt-4 pb-3 border-b shrink-0",
            isDarkTheme ? "border-white/10" : "border-border/30"
          )}
        >
          <TabsList
            className={cn(
              "w-full grid grid-cols-2 p-1 rounded-xl",
              isDarkTheme ? "bg-black/50" : "bg-muted/30"
            )}
          >
            <TabsTrigger
              value="select"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg flex items-center gap-2",
                isDarkTheme && "text-white/80 data-[state=active]:text-white"
              )}
            >
              <LayoutTemplate className="h-3.5 w-3.5" />
              Select Theme
            </TabsTrigger>
            <TabsTrigger
              value="edit"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg flex items-center gap-2",
                isDarkTheme && "text-white/80 data-[state=active]:text-white"
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              Edit Theme
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent transition-colors duration-300 min-h-0",
            isDarkTheme
              ? "scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30"
              : "scrollbar-thumb-primary/20 hover:scrollbar-thumb-primary/30"
          )}
        >

          <TabsContent value="select" className="mt-0 px-4">
            <div className="space-y-4 py-4">
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
                          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30 hover:shadow-lg"
                          : isDarkTheme
                          ? "border-white/10 bg-black/50 hover:bg-black/70 hover:border-white/20 hover:shadow-sm"
                          : "border-border/50 bg-background/60 hover:bg-accent/50 hover:border-border hover:shadow-sm",
                        "active:scale-[0.98]"
                      )}
                    >
                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div
                          className={cn(
                            "font-semibold text-sm truncate transition-colors tracking-tight",
                            isActive
                              ? "text-primary"
                              : isDarkTheme
                              ? "text-white/90"
                              : "text-foreground"
                          )}
                        >
                          {theme.name}
                        </div>
                        {theme.description && (
                          <div
                            className={cn(
                              "text-xs line-clamp-1 transition-colors",
                              isDarkTheme
                                ? "text-white/60 group-hover:text-white/80"
                                : "text-muted-foreground/80 group-hover:text-foreground/70"
                            )}
                          >
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

          <TabsContent value="edit" className="mt-0 px-4">
            <div className="py-4">
              {globalTheme && onThemeChange ? (
                <ThemeEditor
                  theme={globalTheme}
                  onThemeChange={onThemeChange}
                />
              ) : (
                <div
                  className={cn(
                    "text-sm text-center py-8",
                    isDarkTheme ? "text-white/70" : "text-muted-foreground"
                  )}
                >
                  Theme editor not available
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
