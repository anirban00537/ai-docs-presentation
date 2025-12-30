import React, { memo } from "react";
import type { Theme } from "@/types/presentation";
import { SlideFrame } from "../slide/SlideFrame";

interface CommonCardProps {
  theme: Theme;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

/**
 * CommonCard provides a standardized card container for various editor blocks.
 * It now uses the centralized SlideFrame for consistent styling across the editor.
 */
export const CommonCard = memo(function CommonCard({
  theme,
  children,
  className = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
  onClick,
}: CommonCardProps) {
  return (
    <SlideFrame
      theme={theme}
      className={`group/card ${className}`}
      style={{
        ...style,
        minWidth: "auto",
        maxWidth: "none",
        width: "100%",
        height: "100%",
        minHeight: "auto",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      showPattern={false} // blocks usually don't show the background pattern
    >
      <div className="cursor-pointer h-full w-full" onClick={onClick}>
        {/* Shine effect on hover - Block specific style */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ borderRadius: theme.cardBorderRadius || "12px" }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"
            style={{
              background: `linear-gradient(135deg, transparent 0%, ${theme.primary}03 50%, transparent 100%)`,
              transform: "translateX(-100%) group-hover/card:translateX(100%)",
            }}
          />
        </div>

        {/* Content */}
        {children}
      </div>
    </SlideFrame>
  );
});
