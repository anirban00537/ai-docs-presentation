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

interface ThemeEditorProps {
  theme: GlobalTheme;
  onThemeChange: (updates: Partial<Omit<GlobalTheme, "id">>) => void;
}

export function ThemeEditor({ theme, onThemeChange }: ThemeEditorProps) {
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
    <div className="space-y-7 ">
      {/* Background Color */}
      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
            <SelectTrigger className="w-full">
              <SelectValue>
                {GOOGLE_FONT_OPTIONS.find(
                  (font) =>
                    theme.font === font.style || theme.font === font.value
                )?.label || "Select font"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {GOOGLE_FONT_OPTIONS.map((font) => (
                <SelectItem
                  key={font.value}
                  value={font.style}
                  style={{ fontFamily: font.style }}
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
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
                    "w-full rounded-lg border p-3 text-center transition-all duration-200 outline-none capitalize text-sm font-medium",
                    isActive
                      ? "border-primary bg-primary/10 dark:bg-primary/5 shadow-md ring-2 ring-primary/30"
                      : "border-border/50 bg-background/60 dark:bg-background/40 hover:bg-accent/50 hover:border-border hover:shadow-sm",
                    "active:scale-[0.98]"
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
