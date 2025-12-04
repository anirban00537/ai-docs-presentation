"use client";

import React from "react";
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
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";

interface ThemeEditorProps {
  theme: GlobalTheme;
  onThemeChange: (updates: Partial<Omit<GlobalTheme, "id">>) => void;
}

export function ThemeEditor({ theme, onThemeChange }: ThemeEditorProps) {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  const handleBackgroundColorChange = (newColor: string) => {
    onThemeChange({ background: newColor });
  };

  const handleSurfaceChange = (newColor: string) => {
    onThemeChange({ surface: newColor });
  };

  const handleTextChange = (newColor: string) => {
    onThemeChange({ text: newColor });
  };

  const handleAccentChange = (newColor: string) => {
    onThemeChange({ accent: newColor });
  };

  const handleFontChange = (newFont: string) => {
    onThemeChange({ font: newFont });
  };

  const handleCardBackgroundTypeChange = (newType: WidgetBackgroundType) => {
    onThemeChange({ cardBackgroundType: newType });
  };

  return (
    <div className="space-y-7 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
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
              color={theme.background}
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
              color={theme.surface}
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
              color={theme.text}
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
              color={theme.accent}
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
                (font) => theme.font === font.style || theme.font === font.value
              )?.style || theme.font
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
                    theme.font === font.style || theme.font === font.value
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
              const isActive = theme.cardBackgroundType === type;
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
    </div>
  );
}
