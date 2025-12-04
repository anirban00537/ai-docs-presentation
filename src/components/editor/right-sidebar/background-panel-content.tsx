"use client";

import React, { useState } from "react";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Image as ImageIcon } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
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
  const isDarkTheme = globalTheme?.tone === "dark";
  const [activeTab, setActiveTab] = useState<"colors" | "image">(
    backgroundImage ? "image" : "colors"
  );

  // Sync tab when backgroundImage changes externally
  React.useEffect(() => {
    if (backgroundImage && activeTab === "colors") {
      setActiveTab("image");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage]);

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
          onValueChange={(value) => setActiveTab(value as "colors" | "image")}
        >
          <TabsList
            className={cn(
              "w-full grid grid-cols-2 p-1 rounded-xl",
              isDarkTheme ? "bg-white/5" : "bg-muted/50"
            )}
          >
            <TabsTrigger
              value="colors"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg flex items-center gap-2",
                isDarkTheme ? "text-white/80" : "text-muted-foreground"
              )}
            >
              <Palette className="h-3.5 w-3.5" />
              Colors
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className={cn(
                "data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg flex items-center gap-2",
                isDarkTheme ? "text-white/80" : "text-muted-foreground"
              )}
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Image
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div
        className={cn(
          "flex-1 overflow-y-auto custom-scrollbar",
          isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
        )}
      >
        {activeTab === "colors" && (
          <div className="space-y-6">
            <BackgroundSection
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              backgroundBlur={backgroundBlur}
              onBackgroundColorChange={onBackgroundColorChange || (() => {})}
              onBackgroundImageChange={onBackgroundImageChange}
              onBackgroundBlurChange={onBackgroundBlurChange}
              showImageSection={false}
            />
          </div>
        )}
        {activeTab === "image" && (
          <div className="space-y-6">
            <BackgroundSection
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              backgroundBlur={backgroundBlur}
              onBackgroundColorChange={onBackgroundColorChange || (() => {})}
              onBackgroundImageChange={onBackgroundImageChange}
              onBackgroundBlurChange={onBackgroundBlurChange}
              showColorSection={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
