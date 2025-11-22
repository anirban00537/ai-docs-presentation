"use client";

import React from "react";
import { BackgroundSection } from "@/components/editor/background/background-section";

type BackgroundPanelContentProps = {
  backgroundColor?: string;
  onBackgroundColorChange?: (color: string) => void;
};

export const BackgroundPanelContent: React.FC<BackgroundPanelContentProps> = ({
  backgroundColor,
  onBackgroundColorChange,
}) => {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Canvas
        </h3>
        <p className="text-[10px] text-muted-foreground/70">
          Adjust colors for the slide background.
        </p>
      </div>
      <BackgroundSection
        backgroundColor={backgroundColor}
        onBackgroundColorChange={onBackgroundColorChange || (() => {})}
      />
    </section>
  );
};

