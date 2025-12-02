"use client";

import React from "react";
import { BackgroundSection } from "@/components/editor/background/background-section";

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
  return (
    <section className="space-y-6">
      <div className="space-y-1.5">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
          Canvas
        </h3>
        <p className="text-xs text-muted-foreground/70 leading-relaxed">
          Adjust colors and images for the slide background.
        </p>
      </div>
      <BackgroundSection
        backgroundColor={backgroundColor}
        backgroundImage={backgroundImage}
        onBackgroundColorChange={onBackgroundColorChange || (() => {})}
        onBackgroundImageChange={onBackgroundImageChange}
      />
    </section>
  );
};

