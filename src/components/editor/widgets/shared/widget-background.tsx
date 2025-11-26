"use client";

import React from "react";
import { cn } from "@/lib/utils";
import type { BackgroundType } from "./toolbar-controls/types";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import type { ThemeTone } from "@/lib/slide-themes";

interface WidgetBackgroundProps {
  backgroundType: BackgroundType;
  backgroundColor: string;
  className?: string;
  children: React.ReactNode;
}

const getGlassBackgroundColor = (color: string, tone: ThemeTone): string => {
  if (tone === "light") {
    return "rgba(15, 23, 42, 0.08)";
  }
  if (color.startsWith("#") && color.length === 7) {
    return `${color}03`;
  }
  return color;
};

export const WidgetBackground: React.FC<WidgetBackgroundProps> = ({
  backgroundType,
  backgroundColor,
  className,
  children,
}) => {
  const themeTone = useAppSelector(selectGlobalTheme)?.tone ?? "dark";
  const isGlassBackground = backgroundType === "glass";
  const isTransparentBackground = backgroundType === "transparent";

  const resolvedBackgroundColor = isGlassBackground
    ? getGlassBackgroundColor(backgroundColor, themeTone)
    : isTransparentBackground
    ? "transparent"
    : backgroundColor;

  return (
    <div
      className={cn(
        "relative h-full w-full rounded-[16px] p-8 transition-all duration-300 ease-out shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]",
        isGlassBackground && "backdrop-blur-2xl",
        isTransparentBackground && "bg-transparent shadow-none",
        className
      )}
      style={{
        backgroundColor: resolvedBackgroundColor,
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
