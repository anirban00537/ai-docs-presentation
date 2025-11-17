"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  CustomSidebar,
  CustomSidebarContent,
} from "@/components/editor/custom-sidebar";
import { SidebarTabs, TabId, tabs } from "@/components/editor/sidebar-tabs";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { BackgroundImageSection } from "@/components/editor/background/background-image-section";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveSlide, updateSlide } from "@/store/slices/slidesSlice";

export function EditorSidebar() {
  const [activeTab, setActiveTab] = useState<TabId | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useAppDispatch();
  const activeSlide = useAppSelector(selectActiveSlide);

  if (!activeSlide) return null;

  const handleTabClick = (tabId: TabId) => {
    if (activeTab === tabId) {
      setActiveTab(null);
      setIsOpen(false);
    } else {
      setActiveTab(tabId);
      setIsOpen(true);
    }
  };

  const handleBackgroundColorChange = (color: string) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundColor: color,
          backgroundType: "solid",
        },
      })
    );
  };

  const handleBackgroundTypeChange = (type: "solid" | "gradient") => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { backgroundType: type },
      })
    );
  };

  const handleGradientColorChange = (index: number, color: string) => {
    const currentGradient = activeSlide.backgroundGradient || [
      "#ffffff",
      "#f0f0f0",
    ];
    const newGradient = [...currentGradient];
    newGradient[index] = color;
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradient: newGradient,
          backgroundType: "gradient",
        },
      })
    );
  };

  const handleAddGradientColor = () => {
    const currentGradient = activeSlide.backgroundGradient || [
      "#ffffff",
      "#f0f0f0",
    ];
    const newGradient = [...currentGradient, "#ffffff"];
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradient: newGradient,
          backgroundType: "gradient",
        },
      })
    );
  };

  const handleRemoveGradientColor = (index: number) => {
    const currentGradient = activeSlide.backgroundGradient || [
      "#ffffff",
      "#f0f0f0",
    ];
    if (currentGradient.length <= 2) return; // Keep at least 2 colors
    const newGradient = currentGradient.filter((_, i) => i !== index);
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradient: newGradient,
          backgroundType: "gradient",
        },
      })
    );
  };

  const handleGradientDirectionChange = (direction: string) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: {
          backgroundGradientDirection: direction,
          backgroundType: "gradient",
        },
      })
    );
  };

  const handleBackgroundImageUpload = (imageData: string) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { backgroundImage: imageData },
      })
    );
  };

  const handleBackgroundImageRemove = () => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { backgroundImage: undefined },
      })
    );
  };

  const handleSlideNumberToggle = (checked: boolean) => {
    dispatch(
      updateSlide({
        slideId: activeSlide.id,
        updates: { showSlideNumber: checked },
      })
    );
  };

  return (
    <CustomSidebar isOpen={isOpen && !!activeTab}>
      {/* Content Panel - Only visible when open */}
      {isOpen && activeTab && (
        <CustomSidebarContent className="flex-1">
          <div className="flex-1 overflow-y-auto">
            {activeTab === "design" && (
              <div className="p-4 space-y-6 max-w-full overflow-visible">
                <BackgroundSection
                  backgroundColor={activeSlide.backgroundColor}
                  backgroundType={activeSlide.backgroundType}
                  backgroundGradient={activeSlide.backgroundGradient}
                  backgroundGradientDirection={
                    activeSlide.backgroundGradientDirection
                  }
                  onBackgroundColorChange={handleBackgroundColorChange}
                  onBackgroundTypeChange={handleBackgroundTypeChange}
                  onGradientColorChange={handleGradientColorChange}
                  onAddGradientColor={handleAddGradientColor}
                  onRemoveGradientColor={handleRemoveGradientColor}
                  onGradientDirectionChange={handleGradientDirectionChange}
                />

                <BackgroundImageSection
                  backgroundImage={activeSlide.backgroundImage}
                  onImageUpload={handleBackgroundImageUpload}
                  onImageRemove={handleBackgroundImageRemove}
                />

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent"></div>

                {/* Slide number */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary"></div>
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Options
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border-2 border-border/60 bg-gradient-to-br from-background to-muted/20">
                    <div className="min-w-0 flex-1 pr-3">
                      <div className="text-sm font-semibold text-foreground mb-0.5">
                        Slide Number
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Show slide number on slide
                      </div>
                    </div>
                    <Switch
                      checked={activeSlide.showSlideNumber || false}
                      onCheckedChange={handleSlideNumberToggle}
                      className="shrink-0"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "design" && (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="rounded-full bg-muted/50 p-4 mb-4">
                  {tabs.find((t) => t.id === activeTab)?.icon && (
                    <div className="text-muted-foreground">
                      {tabs.find((t) => t.id === activeTab)?.icon}
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </p>
                <p className="text-xs text-muted-foreground">Coming soon</p>
              </div>
            )}
          </div>
        </CustomSidebarContent>
      )}

      {/* Tab Icons - Always visible on the right */}
      <SidebarTabs
        activeTab={activeTab && isOpen ? activeTab : null}
        onTabClick={handleTabClick}
      />
    </CustomSidebar>
  );
}
