"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { BackgroundType } from "./toolbar-controls/types";

interface WidgetBackgroundProps {
  backgroundType: BackgroundType;
  backgroundColor: string;
  className?: string;
  children: React.ReactNode;
}

export const WidgetBackground: React.FC<WidgetBackgroundProps> = ({
  backgroundType,
  backgroundColor,
  className,
  children,
}) => {
  const isGlassBackground = backgroundType === "glass";
  const isTransparentBackground = backgroundType === "transparent";

  return (
    <div
      className={cn(
        "relative h-full w-full rounded-[16px] p-8 transition-all duration-300 ease-out shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]",
        isGlassBackground && "backdrop-blur-2xl",
        isTransparentBackground && "bg-transparent shadow-none",
        className
      )}
      style={{
        backgroundColor: isGlassBackground
          ? `${backgroundColor}03`
          : isTransparentBackground
          ? "transparent"
          : backgroundColor,
        backgroundImage: isGlassBackground
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%)"
          : undefined,
        boxShadow: isGlassBackground
          ? "inset 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.25)"
          : "none",
      }}
    >
      {children}
    </div>
  );
};
