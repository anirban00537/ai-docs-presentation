"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import {
  CustomSidebar,
  CustomSidebarContent,
  CustomSidebarHeader,
} from "@/components/editor/custom-sidebar";
import { SidebarTabs, TabId, tabs } from "@/components/editor/sidebar-tabs";
import { BackgroundSection } from "@/components/editor/background/background-section";
import { BackgroundImageSection } from "@/components/editor/background/background-image-section";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectActiveSlide, updateSlide } from "@/store/slices/slidesSlice";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const handleClose = () => {
    setActiveTab(null);
    setIsOpen(false);
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
          <CustomSidebarHeader className="justify-between border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 text-primary">
                {tabs.find((t) => t.id === activeTab)?.icon}
              </span>
              <h2 className="text-sm font-semibold text-foreground tracking-tight">
                {tabs.find((t) => t.id === activeTab)?.label}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-6 w-6 rounded-full hover:bg-muted text-muted-foreground"
              onClick={handleClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </CustomSidebarHeader>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {activeTab === "design" && (
              <div className="p-5 space-y-8 max-w-full overflow-visible pb-20">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                    Canvas
                  </h3>
                  <div className="p-1">
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
                  </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" />

                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                    Assets
                  </h3>
                  <div className="p-1">
                    <BackgroundImageSection
                      backgroundImage={activeSlide.backgroundImage}
                      onImageUpload={handleBackgroundImageUpload}
                      onImageRemove={handleBackgroundImageRemove}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab !== "design" && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="rounded-2xl bg-gradient-to-br from-muted to-muted/30 p-6 mb-4 shadow-inner">
                  {tabs.find((t) => t.id === activeTab)?.icon && (
                    <div className="text-muted-foreground/50 [&>svg]:w-8 [&>svg]:h-8">
                      {tabs.find((t) => t.id === activeTab)?.icon}
                    </div>
                  )}
                </div>
                <p className="text-base font-medium text-foreground mb-1.5">
                  {tabs.find((t) => t.id === activeTab)?.label}
                </p>
                <p className="text-xs text-muted-foreground max-w-[180px] leading-relaxed">
                  This feature is currently under development. Stay tuned!
                </p>
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
