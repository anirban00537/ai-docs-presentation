"use client";

import React from "react";
import { GradientColorTab } from "./gradient-color-tab";

interface BackgroundSectionProps {
  /**
   * Background colors for the slide.
   * - If undefined/empty: fall back to theme.
   * - If length === 1: treated as solid.
   * - If length >= 2: treated as gradient.
   */
  backgroundColors: string[] | undefined;
  backgroundGradientDirection: string | undefined;
  onBackgroundColorChange: (color: string) => void;
  onGradientColorChange: (index: number, color: string) => void;
  onAddGradientColor: () => void;
  onRemoveGradientColor: (index: number) => void;
  onGradientDirectionChange: (direction: string) => void;
}

export function BackgroundSection({
  backgroundColors,
  backgroundGradientDirection,
  onGradientColorChange,
  onAddGradientColor,
  onRemoveGradientColor,
  onGradientDirectionChange,
}: BackgroundSectionProps) {
  const defaultGradient = ["#ffffff", "#f0f0f0"];
  const gradientColors =
    Array.isArray(backgroundColors) && backgroundColors.length > 0
      ? backgroundColors
      : defaultGradient;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Background
        </label>
      </div>

      <div className="pt-2">
        <GradientColorTab
          gradientColors={gradientColors}
          gradientDirection={backgroundGradientDirection}
          onColorChange={onGradientColorChange}
          onAddColor={onAddGradientColor}
          onRemoveColor={onRemoveGradientColor}
          onDirectionChange={onGradientDirectionChange}
        />
      </div>
    </div>
  );
}
