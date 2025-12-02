"use client";

import React, { useState } from "react";
import { ColorPicker } from "./color-picker";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectGlobalTheme,
  selectActiveSlideId,
  updateSlide,
} from "@/store/slices/slidesSlice";
import { MediaBrowser } from "@/components/editor/media-browser";
import { Image, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const PRESET_GRADIENTS = [
  ["#667eea", "#764ba2"], // Purple to deep purple
  ["#f093fb", "#f5576c"], // Pink to coral
  ["#4facfe", "#00f2fe"], // Blue to cyan
  ["#43e97b", "#38f9d7"], // Green to turquoise
  ["#fa709a", "#fee140"], // Pink to yellow
  ["#30cfd0", "#330867"], // Cyan to deep purple
  ["#a8edea", "#fed6e3"], // Light cyan to light pink
  ["#ff9a9e", "#fecfef"], // Coral to light pink
  ["#ffecd2", "#fcb69f"], // Cream to peach
  ["#ff6e7f", "#bfe9ff"], // Coral to light blue
  ["#c471f5", "#fa71cd"], // Purple to pink
  ["#fbc2eb", "#a6c1ee"], // Light pink to light blue
  ["#a8caba", "#5d4e75"], // Mint to purple
  ["#ffecd2", "#fcb69f", "#ff8a80"], // Cream to peach to coral
  ["#667eea", "#764ba2", "#f093fb"], // Purple gradient
  ["#4facfe", "#00f2fe", "#43e97b"], // Blue to cyan to green
  ["#fa709a", "#fee140", "#30cfd0"], // Pink to yellow to cyan
  ["#ff9a9e", "#fecfef", "#ffecd2"], // Coral to pink to cream
  ["#a8edea", "#fed6e3", "#ffecd2"], // Cyan to pink to cream
  ["#c471f5", "#fa71cd", "#ff9a9e"], // Purple to pink to coral
];

interface BackgroundSectionProps {
  backgroundColor: string[] | string | undefined;
  backgroundImage?: string | undefined;
  onBackgroundColorChange: (colors: string[]) => void;
  onBackgroundImageChange?: (imageUrl: string | undefined) => void;
}

export function BackgroundSection({
  backgroundColor,
  backgroundImage,
  onBackgroundColorChange,
  onBackgroundImageChange,
}: BackgroundSectionProps) {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const [showImageBrowser, setShowImageBrowser] = useState(false);

  // Normalize backgroundColor to array (handle backward compatibility with string values)
  // If no backgroundColor is set, use global theme background colors
  const colors = Array.isArray(backgroundColor)
    ? backgroundColor.length > 0
      ? backgroundColor
      : globalTheme?.background ?? ["#ffffff"]
    : backgroundColor
    ? [backgroundColor]
    : globalTheme?.background ?? ["#ffffff"];

  const generateRandomColor = () => {
    // Generate a random hex color
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const handleColorChange = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index] = newColor;
    onBackgroundColorChange(newColors);
  };

  const handleAddColor = () => {
    const randomColor = generateRandomColor();
    const newColors = [...colors, randomColor];
    onBackgroundColorChange(newColors);
  };

  const handleRemoveColor = (index: number) => {
    if (colors.length <= 1) return;
    const newColors = colors.filter((_, i) => i !== index);
    onBackgroundColorChange(newColors);
  };

  const handleImageSelect = (imageUrl: string) => {
    if (onBackgroundImageChange) {
      onBackgroundImageChange(imageUrl);
    } else if (activeSlideId) {
      // Fallback: directly update slide if callback not provided
      dispatch(
        updateSlide({
          slideId: activeSlideId,
          updates: {
            backgroundImage: imageUrl,
          },
        })
      );
    }
    setShowImageBrowser(false);
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

  // Show image browser view
  if (showImageBrowser) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="flex items-center justify-start mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowImageBrowser(false)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground shrink-0 h-7 px-2.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Colors</span>
          </Button>
        </div>
        <div className="flex-1 min-h-0 w-full">
          <MediaBrowser
            onImageClick={handleImageSelect}
            onImageAdded={() => setShowImageBrowser(false)}
          />
        </div>
      </div>
    );
  }

  // Show color view (default)
  return (
    <div className="space-y-7">
      {/* Background Image Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
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
        <button
          type="button"
          onClick={() => setShowImageBrowser(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 bg-background/50 hover:bg-primary/5 transition-all duration-200 group"
        >
          <Image className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
            {backgroundImage
              ? "Change Background Image"
              : "Add Background Image"}
          </span>
        </button>
        {backgroundImage && (
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50">
            <img
              src={backgroundImage}
              alt="Background"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest">
            Background Colors
          </h3>
          <button
            type="button"
            onClick={handleAddColor}
            className="text-xs font-semibold text-primary hover:text-primary/90 transition-all duration-200 px-2.5 py-1 rounded-lg hover:bg-primary/10 active:scale-95"
          >
            + Add Color
          </button>
        </div>
        <div className="grid grid-cols-7 gap-2.5 px-1">
          {colors.map((color, index) => (
            <div key={index} className="relative group/picker">
              <ColorPicker
                color={color}
                onChange={(newColor) => handleColorChange(index, newColor)}
                onRemove={() => handleRemoveColor(index)}
                showRemove={colors.length > 1}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
          Gradient Presets
        </h3>
        <div className="grid grid-cols-7 gap-2.5 px-1">
          {PRESET_GRADIENTS.map((gradient, index) => {
            const gradientString = `linear-gradient(to right, ${gradient.join(
              ", "
            )})`;
            const isActive =
              colors.length === gradient.length &&
              colors.every((c, i) => c === gradient[i]);
            return (
              <button
                key={index}
                type="button"
                onClick={() => onBackgroundColorChange([...gradient])}
                className="group relative flex aspect-square items-center justify-center rounded-xl border border-border/50 shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 overflow-hidden active:scale-105"
              >
                <span
                  className="h-full w-full rounded-xl border border-border/40"
                  style={{ background: gradientString }}
                />
                {isActive && (
                  <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3.5">
        <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
          Solid Colors
        </h3>
        <div className="grid grid-cols-7 gap-2.5 px-1">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onBackgroundColorChange([preset])}
              className="group relative flex aspect-square items-center justify-center rounded-xl border border-border/50 shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-105"
            >
              <span
                className="h-full w-full rounded-xl border border-border/40"
                style={{ backgroundColor: preset }}
              />
              {colors.length === 1 && colors[0] === preset && (
                <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
