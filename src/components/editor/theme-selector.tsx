"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ThemeEditor } from "./theme-editor";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectGlobalTheme, setSlideTheme } from "@/store/slices/slidesSlice";
import { LayoutTemplate, Palette, Loader2, Trash2 } from "lucide-react";
import { useThemesList, useDeleteTheme } from "@/hooks/use-themes";
import { toast } from "sonner";

type ThemeSelectorProps = {
  activeThemeId?: string;
  onSelectTheme: (themeId: string) => void;
  globalTheme?: GlobalTheme;
};

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  activeThemeId,
  onSelectTheme,
  globalTheme,
}) => {
  const globalThemeState = useAppSelector(selectGlobalTheme);
  const effectiveTheme = globalTheme || globalThemeState;
  const isDarkTheme = effectiveTheme?.tone === "dark";
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = React.useState("select");

  // Fetch themes from backend
  const { data: themesData, isLoading: isLoadingThemes } = useThemesList({
    includeAdmin: "true",
    includeUser: "true",
  });

  const deleteThemeMutation = useDeleteTheme();

  // Only use themes from API
  const allThemes = useMemo(() => {
    if (!themesData?.data?.list) return [];

    return themesData.data.list.map((theme) => ({
      id: theme.id,
      name: theme.name,
      description: theme.description || undefined,
      background: theme.background,
      surface: theme.surface,
      text: theme.text,
      accent: theme.accent,
      font: theme.font,
      cardBackgroundType: theme.cardBackgroundType,
      tone: theme.tone,
      isAdmin: theme.isAdmin,
      userId: theme.userId,
    }));
  }, [themesData]);

  // Handle theme selection - update global theme with API theme data
  const handleThemeSelect = (themeId: string) => {
    const selectedTheme = themesData?.data?.list?.find((t) => t.id === themeId);
    if (selectedTheme) {
      // Update global theme with the selected theme's properties
      dispatch(
        setSlideTheme({
          theme: {
            id: selectedTheme.id,
            background: selectedTheme.background,
            surface: selectedTheme.surface,
            text: selectedTheme.text,
            accent: selectedTheme.accent,
            font: selectedTheme.font,
            cardBackgroundType: selectedTheme.cardBackgroundType,
            tone: selectedTheme.tone,
          },
        })
      );
      // Also call the callback if provided
      onSelectTheme(themeId);
    }
  };

  // Handle theme deletion
  const handleDeleteTheme = async (
    e: React.MouseEvent,
    themeId: string,
    themeName: string
  ) => {
    e.stopPropagation(); // Prevent theme selection when clicking delete

    if (
      !confirm(
        `Are you sure you want to delete "${themeName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await deleteThemeMutation.mutateAsync(themeId);
      toast.success("Theme deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete theme");
    }
  };

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden min-h-0">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full h-full flex flex-col"
      >
        {/* Tabs */}
        <div
          className={cn(
            "px-4 pt-4 pb-3 border-b shrink-0",
            isDarkTheme ? "border-white/10" : "border-border"
          )}
        >
          <TabsList
            className={cn(
              "w-full grid grid-cols-2 p-1 rounded-xl",
              isDarkTheme ? "bg-white/5" : "bg-muted/50"
            )}
          >
            <TabsTrigger
              value="select"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md",
                "transition-all duration-300 ease-out rounded-lg flex items-center gap-2",
                "hover:scale-[1.02] active:scale-[0.98]",
                isDarkTheme ? "text-white/80" : "text-muted-foreground"
              )}
            >
              <LayoutTemplate className="h-3.5 w-3.5 transition-transform duration-300 ease-out" />
              Select Theme
            </TabsTrigger>
            <TabsTrigger
              value="add"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md",
                "transition-all duration-300 ease-out rounded-lg flex items-center gap-2",
                "hover:scale-[1.02] active:scale-[0.98]",
                isDarkTheme ? "text-white/80" : "text-muted-foreground"
              )}
            >
              <Palette className="h-3.5 w-3.5 transition-transform duration-300 ease-out" />
              Add Theme
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar min-h-0",
            isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
          )}
        >
          <TabsContent value="select" className="mt-0 px-4">
            <div className="space-y-4 py-4">
              {isLoadingThemes ? (
                <div className="flex items-center justify-center h-64">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                    <p className="text-xs text-muted-foreground/60 font-medium">
                      Loading themes...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {allThemes.map((theme, index) => {
                    const isActive = activeThemeId === theme.id;
                    const isUserTheme = !theme.isAdmin;
                    const isDeleting = deleteThemeMutation.isPending;

                    return (
                      <div
                        key={theme.id}
                        className={cn(
                          "group relative w-full rounded-xl border p-4",
                          "transition-all duration-300 ease-out",
                          "hover:scale-[1.01]",
                          isActive
                            ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30 hover:shadow-lg"
                            : isDarkTheme
                            ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-sm"
                            : "border-border/50 bg-background/60 hover:bg-accent/50 hover:border-border hover:shadow-sm"
                        )}
                        style={{
                          animationDelay: `${index * 25}ms`,
                          animation: "fadeInUp 0.4s ease-out both",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleThemeSelect(theme.id)}
                          className="w-full text-left flex items-center justify-between gap-4 outline-none"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <div
                              className={cn(
                                "font-semibold text-sm truncate transition-colors duration-300 ease-out tracking-tight",
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
                                  "text-xs line-clamp-1 transition-all duration-300 ease-out",
                                  "group-hover:opacity-100",
                                  isDarkTheme
                                    ? "text-white/60 opacity-80 group-hover:text-white/80"
                                    : "text-muted-foreground/80 opacity-80 group-hover:text-foreground/70"
                                )}
                              >
                                {theme.description}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center -space-x-1.5">
                              <span
                                key={`${theme.id}-background`}
                                className="h-6 w-6 rounded-full border-2 border-background dark:border-neutral-900 shadow-sm ring-1 ring-border/50 transition-transform duration-300 ease-out group-hover:scale-110"
                                style={{ backgroundColor: theme.background }}
                              />
                              {[theme.surface, theme.text, theme.accent].map(
                                (color, i) => (
                                  <span
                                    key={`${theme.id}-color-${i}`}
                                    className="h-6 w-6 rounded-full border-2 border-background dark:border-neutral-900 shadow-sm ring-1 ring-border/50 transition-transform duration-300 ease-out group-hover:scale-110"
                                    style={{
                                      backgroundColor: color,
                                      zIndex: 3 - i,
                                      transitionDelay: `${i * 30}ms`,
                                    }}
                                  />
                                )
                              )}
                            </div>
                            {isUserTheme && (
                              <button
                                type="button"
                                onClick={(e) =>
                                  handleDeleteTheme(e, theme.id, theme.name)
                                }
                                disabled={isDeleting}
                                className={cn(
                                  "opacity-0 group-hover:opacity-100 transition-all duration-200 ease-out",
                                  "p-1.5 rounded-md",
                                  "hover:bg-destructive/10 hover:text-destructive",
                                  "active:scale-95",
                                  "disabled:opacity-50 disabled:cursor-not-allowed",
                                  isDeleting && "opacity-100"
                                )}
                                title="Delete theme"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent
            value="add"
            className="mt-0 px-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
          >
            <div className="py-4">
              <ThemeEditor
                onSuccess={() => {
                  setActiveTab("select");
                }}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
