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
      <BackgroundSection
        backgroundColor={backgroundColor}
        backgroundImage={backgroundImage}
        onBackgroundColorChange={onBackgroundColorChange || (() => {})}
        onBackgroundImageChange={onBackgroundImageChange}
      />
    </section>
  );
};
