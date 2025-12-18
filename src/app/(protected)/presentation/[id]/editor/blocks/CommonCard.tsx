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

  const getCardStyle = (): React.CSSProperties => {
    const isDark = theme.themeType === "dark";
    const primaryColor = theme.primary;

    // Use granular properties from theme with fallbacks
    const borderRadius = theme.cardBorderRadius || "12px";
    const boxShadow = theme.cardBoxShadow || (isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.08)");
    const borderWidth = theme.cardBorderWidth || "1px";
    const borderStyle = theme.cardBorderStyle || "solid";
    const borderColor = theme.cardBorderColor || `${primaryColor}15`;
    const backdropBlur = theme.cardBackdropBlur || "0px";
    const opacity = theme.cardOpacity !== undefined ? theme.cardOpacity : 1;

    return {
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: opacity < 1 ? `rgba(${isDark ? '0, 0, 0' : '255, 255, 255'}, ${opacity})` : theme.cardBackground,
      borderRadius,
      boxShadow,
      border: `${borderWidth} ${borderStyle} ${borderColor}`,
      backdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      WebkitBackdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      ...style,
    };
  };

  const cardStyle = getCardStyle();

  return (
    <div 
      className={`relative group/card ${className}`} 
      style={cardStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Background effects with clipping */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ borderRadius: cardStyle.borderRadius }}>
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
      </div>

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
