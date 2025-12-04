"use client";

import React, { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeModal } from "./theme-modal";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectGlobalTheme, setSlideTheme } from "@/store/slices/slidesSlice";
import { LayoutTemplate, Loader2, Trash2, Plus, Pencil } from "lucide-react";
import { useThemesList, useDeleteTheme } from "@/hooks/use-themes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | undefined>();

  // Fetch themes from backend
  const { data: themesData, isLoading: isLoadingThemes } = useThemesList({
    includeAdmin: "true",
    includeUser: "true",
  });

  const deleteThemeMutation = useDeleteTheme();

  // Extract theme data from API response (use themeData if available, otherwise use individual fields)
  const getThemeDataFromResponse = (theme: any) => {
    if (theme?.themeData) {
      return theme.themeData;
    }
    // Fallback to individual fields for backward compatibility
    return {
      background: theme?.background || "#ffffff",
      surface: theme?.surface || "#f8f9fa",
      text: theme?.text || "#000000",
      accent: theme?.accent || "#3b82f6",
      font: theme?.font || "var(--font-poppins), Poppins, sans-serif",
      cardBackgroundType: theme?.cardBackgroundType || "solid",
      tone: theme?.tone || "light",
    };
  };

  // Group themes by type (user vs admin)
  const { userThemes, adminThemes } = useMemo(() => {
    if (!themesData?.data?.list) return { userThemes: [], adminThemes: [] };

    const themes = themesData.data.list.map((theme) => {
      const themeData = getThemeDataFromResponse(theme);
      return {
        id: theme.id,
        name: theme.name,
        description: theme.description || undefined,
        background: themeData.background,
        surface: themeData.surface,
        text: themeData.text,
        accent: themeData.accent,
        font: themeData.font,
        cardBackgroundType: themeData.cardBackgroundType,
        tone: themeData.tone,
        isAdmin: theme.isAdmin,
        userId: theme.userId,
      };
    });

    return {
      userThemes: themes.filter((t) => !t.isAdmin),
      adminThemes: themes.filter((t) => t.isAdmin),
    };
  }, [themesData]);

  // Handle theme selection - update global theme with API theme data
  const handleThemeSelect = (themeId: string) => {
    const selectedTheme = themesData?.data?.list?.find((t) => t.id === themeId);
    if (selectedTheme) {
      const themeData = getThemeDataFromResponse(selectedTheme);
      // Update global theme with the selected theme's properties
      dispatch(
        setSlideTheme({
          theme: {
            id: selectedTheme.id,
            background: themeData.background,
            surface: themeData.surface,
            text: themeData.text,
            accent: themeData.accent,
            font: themeData.font,
            cardBackgroundType: themeData.cardBackgroundType,
            tone: themeData.tone,
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

  // Handle opening modal for creating new theme
  const handleCreateTheme = () => {
    setEditingThemeId(undefined);
    setIsModalOpen(true);
  };

  // Handle opening modal for editing existing theme
  const handleEditTheme = (e: React.MouseEvent, themeId: string) => {
    e.stopPropagation(); // Prevent theme selection when clicking edit
    setEditingThemeId(themeId);
    setIsModalOpen(true);
  };

  // Render theme card component
  const renderThemeCard = (
    theme: (typeof userThemes)[0],
    index: number,
    isUserTheme: boolean
  ) => {
    const isActive = activeThemeId === theme.id;
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
              {[theme.surface, theme.text, theme.accent].map((color, i) => (
                <span
                  key={`${theme.id}-color-${i}`}
                  className="h-6 w-6 rounded-full border-2 border-background dark:border-neutral-900 shadow-sm ring-1 ring-border/50 transition-transform duration-300 ease-out group-hover:scale-110"
                  style={{
                    backgroundColor: color,
                    zIndex: 3 - i,
                    transitionDelay: `${i * 30}ms`,
                  }}
                />
              ))}
            </div>
            {isUserTheme && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => handleEditTheme(e, theme.id)}
                  className={cn(
                    "p-1.5 rounded-md",
                    "hover:bg-primary/10 hover:text-primary",
                    "active:scale-95",
                    "transition-all duration-200 ease-out",
                    isDarkTheme
                      ? "text-white/70 hover:text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                  title="Edit theme"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteTheme(e, theme.id, theme.name)}
                  disabled={isDeleting}
                  className={cn(
                    "p-1.5 rounded-md",
                    "hover:bg-destructive/10 hover:text-destructive",
                    "active:scale-95",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200 ease-out",
                    isDarkTheme
                      ? "text-white/70 hover:text-destructive"
                      : "text-muted-foreground hover:text-destructive"
                  )}
                  title="Delete theme"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            )}
          </div>
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="w-full h-full flex flex-col rounded-lg overflow-hidden min-h-0">
        {/* Header with Add Theme Button */}
        <div
          className={cn(
            "px-4 pt-4 pb-3 border-b shrink-0 flex items-center justify-between",
            isDarkTheme ? "border-white/10" : "border-border"
          )}
        >
          <div className="flex items-center gap-2">
            <LayoutTemplate
              className={cn(
                "h-4 w-4",
                isDarkTheme ? "text-white/90" : "text-foreground"
              )}
            />
            <h3
              className={cn(
                "text-sm font-semibold",
                isDarkTheme ? "text-white/90" : "text-foreground"
              )}
            >
              Themes
            </h3>
          </div>
          <Button
            onClick={handleCreateTheme}
            size="sm"
            className={cn(
              "h-8 gap-2",
              isDarkTheme
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            Add Theme
          </Button>
        </div>

        {/* Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto custom-scrollbar min-h-0",
            isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
          )}
        >
          <div className="px-4">
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
                <div className="space-y-6">
                  {/* User Themes Section */}
                  {userThemes.length > 0 && (
                    <div className="space-y-3">
                      <div
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wider px-1",
                          isDarkTheme
                            ? "text-white/70"
                            : "text-muted-foreground"
                        )}
                      >
                        Your Themes
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {userThemes.map((theme, index) => {
                          return renderThemeCard(theme, index, true);
                        })}
                      </div>
                    </div>
                  )}

                  {/* Admin Themes Section */}
                  {adminThemes.length > 0 && (
                    <div className="space-y-3">
                      <div
                        className={cn(
                          "text-xs font-semibold uppercase tracking-wider px-1",
                          isDarkTheme
                            ? "text-white/70"
                            : "text-muted-foreground"
                        )}
                      >
                        Butterfast Themes
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {adminThemes.map((theme, index) => {
                          return renderThemeCard(theme, index, false);
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {userThemes.length === 0 && adminThemes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                      <LayoutTemplate className="h-12 w-12 text-muted-foreground/40 mb-4" />
                      <p className="text-sm text-muted-foreground">
                        No themes available
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Modal */}
      <ThemeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        themeId={editingThemeId}
      />
    </>
  );
};
