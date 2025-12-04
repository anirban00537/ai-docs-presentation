"use client";

import React, { useState } from "react";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { UnsplashMediaTab } from "@/components/editor/unsplash-media-tab";
import { UserMediaTab } from "@/components/editor/user-media-tab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectGlobalTheme,
  selectActiveSlideId,
  updateSlide,
} from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";

type BackgroundPanelContentProps = {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundBlur?: boolean;
  onBackgroundColorChange?: (color: string) => void;
  onBackgroundImageChange?: (imageUrl: string | undefined) => void;
  onBackgroundBlurChange?: (blur: boolean) => void;
};

export const BackgroundPanelContent: React.FC<BackgroundPanelContentProps> = ({
  backgroundColor,
  backgroundImage,
  backgroundBlur,
  onBackgroundColorChange,
  onBackgroundImageChange,
  onBackgroundBlurChange,
}) => {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const dispatch = useAppDispatch();
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const isDarkTheme = globalTheme?.tone === "dark";
  const [activeTab, setActiveTab] = useState<
    "color" | "unsplash" | "your-media"
  >("color");

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
  };

  return (
    <div className="w-full h-full flex flex-col rounded-lg overflow-hidden min-h-0">
      {/* Tabs */}
      <div
        className={cn(
          "px-4 pt-4 pb-3 border-b",
          isDarkTheme ? "border-white/10" : "border-border"
        )}
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "color" | "unsplash" | "your-media")
          }
        >
          <TabsList
            className={cn(
              "w-full grid grid-cols-3 p-1 rounded-xl",
              isDarkTheme ? "bg-white/5" : "bg-muted/50"
            )}
          >
            <TabsTrigger
              value="color"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md",
                "transition-all duration-300 ease-out rounded-lg flex items-center gap-2",
                "hover:scale-[1.02] active:scale-[0.98]",
                isDarkTheme ? "text-white/80" : "text-muted-foreground"
              )}
            >
              <Palette className="h-3.5 w-3.5 transition-transform duration-300 ease-out" />
              Color
            </TabsTrigger>
            <TabsTrigger
              value="unsplash"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md",
                "transition-all duration-300 ease-out rounded-lg",
                "hover:scale-[1.02] active:scale-[0.98]",
                isDarkTheme ? "text-white/80" : "text-muted-foreground"
              )}
            >
              Unsplash
            </TabsTrigger>
            <TabsTrigger
              value="your-media"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md",
                "transition-all duration-300 ease-out rounded-lg",
                "hover:scale-[1.02] active:scale-[0.98]",
                isDarkTheme ? "text-white/80" : "text-muted-foreground"
              )}
            >
              Your Media
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div
        className={cn(
          "flex-1 overflow-hidden flex flex-col min-h-0",
          isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
        )}
      >
        {activeTab === "color" && (
          <div
            className="flex-1 overflow-y-auto custom-scrollbar animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
            key="color"
          >
            <BackgroundSection
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              backgroundBlur={backgroundBlur}
              onBackgroundColorChange={onBackgroundColorChange || (() => {})}
              onBackgroundImageChange={onBackgroundImageChange}
              onBackgroundBlurChange={onBackgroundBlurChange}
              showColorSection={true}
              showImageSection={false}
            />
          </div>
        )}

        {activeTab === "unsplash" && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <UnsplashMediaTab
              isDarkTheme={isDarkTheme}
              onImageClick={handleImageSelect}
            />
          </div>
        )}

        {activeTab === "your-media" && (
          <div className="flex-1 min-h-0 overflow-hidden">
            <UserMediaTab
              isDarkTheme={isDarkTheme}
              onImageClick={handleImageSelect}
            />
          </div>
        )}

        {/* Background Image Preview and Controls - shown in all tabs when image is set */}
        {backgroundImage && (
          <div
            className={cn(
              "px-4 pb-4 pt-4 border-t shrink-0",
              isDarkTheme ? "border-white/10" : "border-border"
            )}
          >
            <BackgroundSection
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              backgroundBlur={backgroundBlur}
              onBackgroundColorChange={onBackgroundColorChange || (() => {})}
              onBackgroundImageChange={onBackgroundImageChange}
              onBackgroundBlurChange={onBackgroundBlurChange}
              showColorSection={false}
              showImageSection={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};
