"use client";

import React, { useState } from "react";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Image as ImageIcon } from "lucide-react";

type BackgroundPanelContentProps = {
  backgroundColor?: string[] | string;
  backgroundImage?: string;
  onBackgroundColorChange?: (colors: string[]) => void;
  onBackgroundImageChange?: (imageUrl: string | undefined) => void;
};

export const BackgroundPanelContent: React.FC<BackgroundPanelContentProps> = ({
  backgroundColor,
  backgroundImage,
  onBackgroundColorChange,
  onBackgroundImageChange,
}) => {
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
    <div className="w-full h-full flex flex-col bg-background/95 backdrop-blur-xl rounded-lg overflow-hidden min-h-0 ">
      {/* Tabs */}
      <div className="px-4 pt-4 pb-3 border-b border-border/30">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "colors" | "image")}
        >
          <TabsList className="w-full grid grid-cols-2 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger
              value="colors"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg flex items-center gap-2"
            >
              <Palette className="h-3.5 w-3.5" />
              Colors
            </TabsTrigger>
            <TabsTrigger
              value="image"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg flex items-center gap-2"
            >
              <ImageIcon className="h-3.5 w-3.5" />
              Image
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30 transition-colors duration-300">
        {activeTab === "colors" && (
          <div className="space-y-6">
            <BackgroundSection
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              onBackgroundColorChange={onBackgroundColorChange || (() => {})}
              onBackgroundImageChange={onBackgroundImageChange}
              showImageSection={false}
            />
          </div>
        )}
        {activeTab === "image" && (
          <div className="space-y-6">
            <BackgroundSection
              backgroundColor={backgroundColor}
              backgroundImage={backgroundImage}
              onBackgroundColorChange={onBackgroundColorChange || (() => {})}
              onBackgroundImageChange={onBackgroundImageChange}
              showColorSection={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};
