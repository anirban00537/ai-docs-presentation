"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { UnsplashMediaTab } from "./unsplash-media-tab";
import { UserMediaTab } from "./user-media-tab";

type MediaBrowserProps = {
  onImageAdded?: () => void;
  onImageClick?: (imageUrl: string) => void;
};

export const MediaBrowser: React.FC<MediaBrowserProps> = ({
  onImageAdded,
  onImageClick,
}) => {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";
  const [activeTab, setActiveTab] = useState<"unsplash" | "your-media">(
    "unsplash"
  );

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col overflow-hidden min-h-0",
        isDarkTheme ? "bg-black" : "bg-white"
      )}
    >
      {/* Tabs */}
      <div
        className={cn(
          "pb-3 border-b",
          isDarkTheme ? "border-white/10" : "border-border/30"
        )}
      >
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "unsplash" | "your-media")
          }
        >
          <TabsList
            className={cn(
              "w-full grid grid-cols-2 p-1 rounded-xl",
              isDarkTheme ? "bg-white/5" : "bg-muted/30"
            )}
          >
            <TabsTrigger
              value="unsplash"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md",
                "transition-all duration-300 ease-out rounded-lg",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              Unsplash
            </TabsTrigger>
            <TabsTrigger
              value="your-media"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md",
                "transition-all duration-300 ease-out rounded-lg",
                "hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              Your Media
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      {activeTab === "unsplash" && (
        <UnsplashMediaTab
          isDarkTheme={isDarkTheme}
          onImageAdded={onImageAdded}
          onImageClick={onImageClick}
        />
      )}

      {activeTab === "your-media" && (
        <UserMediaTab
          isDarkTheme={isDarkTheme}
          onImageAdded={onImageAdded}
          onImageClick={onImageClick}
        />
      )}
    </div>
  );
};
