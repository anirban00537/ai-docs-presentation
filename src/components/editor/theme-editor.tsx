"use client";

import React, { useState, useEffect } from "react";
import { ColorPicker } from "./background/color-picker";
import { cn } from "@/lib/utils";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import { GOOGLE_FONT_OPTIONS } from "@/lib/fonts";
import type { WidgetBackgroundType } from "@/lib/slide-themes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { useCreateTheme } from "@/hooks/use-themes";
import { Loader2, Check, Save } from "lucide-react";

interface ThemeEditorProps {
  theme?: GlobalTheme;
  onSuccess?: () => void;
}

export function ThemeEditor({
  theme: initialTheme,
  onSuccess,
}: ThemeEditorProps) {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";
  const createThemeMutation = useCreateTheme();

  // Use initial theme or global theme as starting point, but manage changes locally
  const baseTheme = initialTheme ||
    globalTheme || {
      id: "",
      background: "#ffffff",
      surface: "#f8f9fa",
      text: "#000000",
      accent: "#3b82f6",
      font: "var(--font-poppins), Poppins, sans-serif",
      cardBackgroundType: "solid" as WidgetBackgroundType,
      tone: "light" as const,
    };

  // Local state for the theme being edited (doesn't affect global theme)
  const [editingTheme, setEditingTheme] = useState<Omit<GlobalTheme, "id">>({
    background: baseTheme.background,
    surface: baseTheme.surface,
    text: baseTheme.text,
    accent: baseTheme.accent,
    font: baseTheme.font,
    cardBackgroundType: baseTheme.cardBackgroundType,
    tone: baseTheme.tone,
  });

  const [themeName, setThemeName] = useState("");
  const [themeDescription, setThemeDescription] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Update local editing theme state when base theme ID changes (not on every render)
  useEffect(() => {
    if (baseTheme) {
      setEditingTheme({
        background: baseTheme.background,
        surface: baseTheme.surface,
        text: baseTheme.text,
        accent: baseTheme.accent,
        font: baseTheme.font,
        cardBackgroundType: baseTheme.cardBackgroundType,
        tone: baseTheme.tone,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseTheme.id]); // Only reset when theme ID changes

  const handleBackgroundColorChange = (newColor: string) => {
    setEditingTheme((prev) => ({ ...prev, background: newColor }));
  };

  const handleSurfaceChange = (newColor: string) => {
    setEditingTheme((prev) => ({ ...prev, surface: newColor }));
  };

  const handleTextChange = (newColor: string) => {
    setEditingTheme((prev) => ({ ...prev, text: newColor }));
  };

  const handleAccentChange = (newColor: string) => {
    setEditingTheme((prev) => ({ ...prev, accent: newColor }));
  };

  const handleFontChange = (newFont: string) => {
    setEditingTheme((prev) => ({ ...prev, font: newFont }));
  };

  const handleCardBackgroundTypeChange = (newType: WidgetBackgroundType) => {
    setEditingTheme((prev) => ({ ...prev, cardBackgroundType: newType }));
  };

  const handleSaveTheme = async () => {
    if (!themeName.trim()) {
      return;
    }

    try {
      await createThemeMutation.mutateAsync({
        name: themeName.trim(),
        description: themeDescription.trim() || undefined,
        background: editingTheme.background,
        surface: editingTheme.surface,
        text: editingTheme.text,
        accent: editingTheme.accent,
        font: editingTheme.font,
        cardBackgroundType: editingTheme.cardBackgroundType,
        tone: editingTheme.tone,
        isAdmin: false, // User-created themes
      });

      // Clear fields immediately
      setThemeName("");
      setThemeDescription("");

      // Show success message
      setShowSuccess(true);

      // Call onSuccess callback to switch tabs after a brief delay
      if (onSuccess) {
        setTimeout(() => {
          setShowSuccess(false);
          onSuccess();
        }, 800); // Brief delay to show success state before switching
      } else {
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      }
    } catch (error) {
      // Error is handled by the mutation
      console.error("Failed to save theme:", error);
    }
  };

  const isLoading = createThemeMutation.isPending;
  const canSave = themeName.trim().length > 0 && !isLoading;

  return (
    <div className="space-y-7 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      {/* Theme Name Input */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Theme Name
        </h3>
        <div className="px-1">
          <Input
            type="text"
            placeholder="Enter theme name"
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            className={cn(
              "w-full transition-all duration-300 ease-out",
              isDarkTheme
                ? "border-white/10 bg-white/5 text-white/90 placeholder:text-white/40 hover:bg-white/10 focus:bg-white/10"
                : "border-border bg-background text-foreground"
            )}
            maxLength={255}
          />
        </div>
      </div>

      {/* Theme Description Input */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Description (Optional)
        </h3>
        <div className="px-1">
          <Input
            type="text"
            placeholder="Enter theme description"
            value={themeDescription}
            onChange={(e) => setThemeDescription(e.target.value)}
            className={cn(
              "w-full transition-all duration-300 ease-out",
              isDarkTheme
                ? "border-white/10 bg-white/5 text-white/90 placeholder:text-white/40 hover:bg-white/10 focus:bg-white/10"
                : "border-border bg-background text-foreground"
            )}
            maxLength={500}
          />
        </div>
      </div>
      {/* Background Color */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Background Color
        </h3>
        <div className="px-1">
          <div className="relative group/picker inline-block">
            <ColorPicker
              color={editingTheme.background}
              onChange={handleBackgroundColorChange}
              onRemove={() => {}}
              showRemove={false}
            />
          </div>
        </div>
      </div>

      {/* Surface Color */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Surface Color
        </h3>
        <div className="px-1">
          <div className="relative group/picker inline-block">
            <ColorPicker
              color={editingTheme.surface}
              onChange={handleSurfaceChange}
              onRemove={() => {}}
              showRemove={false}
            />
          </div>
        </div>
      </div>

      {/* Text Color */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Text Color
        </h3>
        <div className="px-1">
          <div className="relative group/picker inline-block">
            <ColorPicker
              color={editingTheme.text}
              onChange={handleTextChange}
              onRemove={() => {}}
              showRemove={false}
            />
          </div>
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Accent Color
        </h3>
        <div className="px-1">
          <div className="relative group/picker inline-block">
            <ColorPicker
              color={editingTheme.accent}
              onChange={handleAccentChange}
              onRemove={() => {}}
              showRemove={false}
            />
          </div>
        </div>
      </div>

      {/* Font Selection */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Font Family
        </h3>
        <div className="px-1">
          <Select
            value={
              GOOGLE_FONT_OPTIONS.find(
                (font) =>
                  editingTheme.font === font.style ||
                  editingTheme.font === font.value
              )?.style || editingTheme.font
            }
            onValueChange={handleFontChange}
          >
            <SelectTrigger
              className={cn(
                "w-full transition-all duration-300 ease-out",
                "hover:scale-[1.01] active:scale-[0.99]",
                isDarkTheme
                  ? "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
                  : "border-border bg-background text-foreground"
              )}
            >
              <SelectValue>
                {GOOGLE_FONT_OPTIONS.find(
                  (font) =>
                    editingTheme.font === font.style ||
                    editingTheme.font === font.value
                )?.label || "Select font"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              className={cn(
                isDarkTheme
                  ? "bg-black border-white/10"
                  : "bg-white border-border"
              )}
            >
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <SelectItem
                  key={font.value}
                  value={font.style}
                  style={{ fontFamily: font.style }}
                  className={cn(
                    isDarkTheme
                      ? "text-white/90 hover:bg-white/10 focus:bg-white/10"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Card Background Type */}
      <div className="space-y-3.5">
        <h3
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-1",
            isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
          )}
        >
          Card Background Type
        </h3>
        <div className="grid grid-cols-3 gap-2 px-1">
          {(["solid", "glass", "transparent"] as WidgetBackgroundType[]).map(
            (type) => {
              const isActive = editingTheme.cardBackgroundType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleCardBackgroundTypeChange(type)}
                  className={cn(
                    "w-full rounded-lg border p-2.5 text-center",
                    "transition-all duration-300 ease-out outline-none capitalize text-xs font-medium",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isActive
                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                      : isDarkTheme
                      ? "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:shadow-sm"
                      : "border-border/50 bg-background/60 hover:bg-accent/50 hover:border-border hover:shadow-sm",
                    isActive
                      ? "text-primary"
                      : isDarkTheme
                      ? "text-white/90"
                      : "text-foreground"
                  )}
                >
                  {type}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-4 pb-2">
        <Button
          onClick={handleSaveTheme}
          disabled={!canSave}
          className={cn(
            "w-full transition-all duration-300 ease-out",
            "hover:scale-[1.02] active:scale-[0.98]",
            !canSave && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : showSuccess ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Theme Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Theme
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
