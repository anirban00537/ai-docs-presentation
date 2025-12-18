import React from "react";
import type { Theme } from "@/lib/editor/types";

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
 * It automatically applies theme-based styling including shadows, roundness, 
 * transparency, and borders.
 */
export const CommonCard: React.FC<CommonCardProps> = ({
  theme,
  children,
  className = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const isDark = theme.themeType === "dark";

  const getCardBaseBackground = () => {
    if (theme.cardTransparency === "faded") {
      return `${theme.cardBackground}40`;
    }
    if (theme.cardTransparency === "frosted") {
      return `${theme.cardBackground}10`;
    }
    return theme.cardBackground;
  };



  const cardStyle: React.CSSProperties = {
    backgroundColor: getCardBaseBackground(),
    backdropFilter: theme.cardTransparency === "frosted" ? "blur(24px)" : "none",
    WebkitBackdropFilter: theme.cardTransparency === "frosted" ? "blur(24px)" : "none",
    borderRadius: `${theme.cardRoundness || 16}px`,
    borderWidth: "1px",
    borderStyle: (theme.cardBorderStyle as any) || "solid",
    borderColor: theme.cardBorderColor || `${theme.primary}15`,
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    ...style,
  };

  return (
    <div 
      className={`relative overflow-hidden group/card ${className}`} 
      style={cardStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Subtle background gradient overlay for visual depth */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}08 0%, transparent 100%)`
        }}
      />
      
      {/* Shine effect on hover */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"
        style={{
          background: `linear-gradient(135deg, transparent 0%, ${theme.primary}03 50%, transparent 100%)`,
          transform: "translateX(-100%) group-hover/card:translateX(100%)",
        }}
      />

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
