"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BackgroundTabs } from "./background-tabs";
import { SolidColorTab } from "./solid-color-tab";
import { GradientColorTab } from "./gradient-color-tab";

interface BackgroundSectionProps {
  backgroundColor: string | undefined;
  backgroundType: "solid" | "gradient" | undefined;
  backgroundGradient: string[] | undefined;
  backgroundGradientDirection: string | undefined;
  onBackgroundColorChange: (color: string) => void;
  onBackgroundTypeChange: (type: "solid" | "gradient") => void;
  onGradientColorChange: (index: number, color: string) => void;
  onAddGradientColor: () => void;
  onRemoveGradientColor: (index: number) => void;
  onGradientDirectionChange: (direction: string) => void;
}

export function BackgroundSection({
  backgroundColor,
  backgroundType,
  backgroundGradient,
  backgroundGradientDirection,
  onBackgroundColorChange,
  onBackgroundTypeChange,
  onGradientColorChange,
  onAddGradientColor,
  onRemoveGradientColor,
  onGradientDirectionChange,
}: BackgroundSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [localBackgroundType, setLocalBackgroundType] = useState<
    "solid" | "gradient"
  >(backgroundType || "solid");

  useEffect(() => {
    if (backgroundType) {
      setLocalBackgroundType(backgroundType);
    }
  }, [backgroundType]);

  const handleTypeChange = (type: "solid" | "gradient") => {
    setLocalBackgroundType(type);
    onBackgroundTypeChange(type);
  };

  const defaultGradient = ["#ffffff", "#f0f0f0"];
  const gradientColors = backgroundGradient || defaultGradient;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Background
            </label>
          </div>
          {isOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-5">
        <BackgroundTabs
          backgroundType={localBackgroundType}
          onTypeChange={handleTypeChange}
        />

        {localBackgroundType === "solid" && (
          <SolidColorTab
            color={backgroundColor || "#ffffff"}
            onChange={onBackgroundColorChange}
          />
        )}

        {localBackgroundType === "gradient" && (
          <GradientColorTab
            gradientColors={gradientColors}
            gradientDirection={backgroundGradientDirection}
            onColorChange={onGradientColorChange}
            onAddColor={onAddGradientColor}
            onRemoveColor={onRemoveGradientColor}
            onDirectionChange={onGradientDirectionChange}
          />
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

