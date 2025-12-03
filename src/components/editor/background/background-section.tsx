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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
  const [showImageBrowser, setShowImageBrowser] = useState(false);

  // Use slide backgroundColor if set, otherwise fall back to global theme background
  const currentColor = backgroundColor ?? globalTheme?.background ?? "#ffffff";

  const handleColorChange = (newColor: string) => {
    onBackgroundColorChange(newColor);
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
            <span>Back</span>
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
      {showImageSection && (
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
          <>
            <div className="relative aspect-video rounded-xl overflow-hidden border border-border/50">
              <img
                src={backgroundImage}
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Background Blur Toggle */}
            <div className="flex items-center justify-between px-1 py-2 rounded-lg bg-background/50 border border-border/30">
              <Label
                htmlFor="background-blur"
                className="text-sm font-medium text-foreground cursor-pointer"
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
          <div className="space-y-3.5">
            <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
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
            <h3 className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest px-1">
              Color Presets
            </h3>
            <div className="grid grid-cols-7 gap-2.5 px-1">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => onBackgroundColorChange(preset)}
                  className="group relative flex aspect-square items-center justify-center rounded-xl border border-border/50 shadow-sm hover:scale-110 hover:shadow-md transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 active:scale-105"
                >
                  <span
                    className="h-full w-full rounded-xl border border-border/40"
                    style={{ backgroundColor: preset }}
                  />
                  {currentColor === preset && (
                    <span className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
