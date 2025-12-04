"use client";

import React from "react";
import { ColorPicker } from "./color-picker";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectGlobalTheme,
  selectActiveSlideId,
  updateSlide,
} from "@/store/slices/slidesSlice";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#0f172a",
  "#1d4ed8",
  "#065f46",
  "#92400e",
  "#b91c1c",
  "#6d28d9",
  "#7c3aed",
  "#f97316",
  "#e11d48",
  "#22c55e",
  "#0ea5e9",
  "#6366f1",
  "#facc15",
  "#64748b",
  "#111827",
  // extra accents
  "#ecfeff",
  "#fef9c3",
  "#fee2e2",
  "#e0e7ff",
  "#f5f3ff",
];

interface BackgroundSectionProps {
  backgroundColor: string | undefined;
  backgroundImage?: string | undefined;
  backgroundBlur?: boolean;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundImageChange?: (imageUrl: string | undefined) => void;
  onBackgroundBlurChange?: (blur: boolean) => void;
  showColorSection?: boolean;
  showImageSection?: boolean;
}

export function BackgroundSection({
  backgroundColor,
  backgroundImage,
  backgroundBlur = false,
  onBackgroundColorChange,
  onBackgroundImageChange,
  onBackgroundBlurChange,
  showColorSection = true,
  showImageSection = true,
}: BackgroundSectionProps) {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const isDarkTheme = globalTheme?.tone === "dark";

  // Use slide backgroundColor if set, otherwise fall back to global theme background
  const currentColor = backgroundColor ?? globalTheme?.background ?? "#ffffff";

  const handleColorChange = (newColor: string) => {
    onBackgroundColorChange(newColor);
  };

  const handleRemoveBackgroundImage = () => {
    if (onBackgroundImageChange) {
      onBackgroundImageChange(undefined);
    } else if (activeSlideId) {
      dispatch(
        updateSlide({
          slideId: activeSlideId,
          updates: {
            backgroundImage: undefined,
          },
        })
      );
    }
  };

  const handleBlurChange = (checked: boolean) => {
    if (onBackgroundBlurChange) {
      onBackgroundBlurChange(checked);
    } else if (activeSlideId) {
      dispatch(
        updateSlide({
          slideId: activeSlideId,
          updates: {
            backgroundBlur: checked,
          },
        })
      );
    }
  };

  return (
    <div className="space-y-7">
      {/* Background Image Section */}
      {showImageSection && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h3
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
              )}
            >
              Background Image
            </h3>
            {backgroundImage && (
              <button
                type="button"
                onClick={handleRemoveBackgroundImage}
                className="text-xs font-semibold text-destructive hover:text-destructive/90 transition-all duration-200 px-2.5 py-1 rounded-lg hover:bg-destructive/10 active:scale-95"
              >
                Remove
              </button>
            )}
          </div>

          {backgroundImage && (
            <>
              <div
                className={cn(
                  "relative aspect-video rounded-xl overflow-hidden border",
                  "transition-all duration-300 ease-out",
                  "animate-in fade-in-0 zoom-in-95",
                  isDarkTheme ? "border-white/10" : "border-border/50"
                )}
              >
                <img
                  src={backgroundImage}
                  alt="Background"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                />
              </div>
              {/* Background Blur Toggle */}
              <div
                className={cn(
                  "flex items-center justify-between px-1 py-2 rounded-lg border",
                  "transition-all duration-300 ease-out",
                  isDarkTheme
                    ? "bg-white/5 border-white/10"
                    : "bg-background/50 border-border/30"
                )}
              >
                <Label
                  htmlFor="background-blur"
                  className={cn(
                    "text-sm font-medium cursor-pointer",
                    isDarkTheme ? "text-white/90" : "text-foreground"
                  )}
                >
                  Background Blur
                </Label>
                <Switch
                  id="background-blur"
                  checked={backgroundBlur}
                  onCheckedChange={handleBlurChange}
                />
              </div>
            </>
          )}
        </div>
      )}

      {showColorSection && (
        <>
          <div className="space-y-3.5 py-5">
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
                  color={currentColor}
                  onChange={handleColorChange}
                  onRemove={() => {}}
                  showRemove={false}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            <h3
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest px-1",
                isDarkTheme ? "text-white/70" : "text-muted-foreground/80"
              )}
            >
              Color Presets
            </h3>
            <div className="grid grid-cols-7 gap-2.5 px-1">
              {PRESET_COLORS.map((preset) => {
                const isSelected = currentColor === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onBackgroundColorChange(preset)}
                    className={cn(
                      "group relative flex aspect-square items-center justify-center rounded-xl border shadow-sm",
                      "transition-all duration-300 ease-out",
                      "hover:scale-[1.05] hover:shadow-lg active:scale-[0.98]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                      isSelected
                        ? "border-primary ring-2 ring-primary/30"
                        : isDarkTheme
                        ? "border-white/10"
                        : "border-white"
                    )}
                  >
                    <span
                      className={cn(
                        "h-full w-full rounded-xl border",
                        "transition-all duration-300 ease-out",
                        isSelected
                          ? "border-primary"
                          : isDarkTheme
                          ? "border-white/10"
                          : "border-white/80"
                      )}
                      style={{ backgroundColor: preset }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
