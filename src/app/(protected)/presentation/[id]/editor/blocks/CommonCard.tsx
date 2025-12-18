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
    const styleName = theme.cardStyle || "standard";
    const primaryColor = theme.primary;
    const isDark = theme.themeType === "dark";

    const baseStyle: React.CSSProperties = {
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: theme.cardBackground,
      ...style,
    };

    switch (styleName) {
      case "standard":
        return {
          ...baseStyle,
          borderRadius: "12px",
          boxShadow: isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.08)",
          border: `1px solid ${theme.cardBorderColor || `${primaryColor}15`}`,
        };
      case "flat":
        return {
          ...baseStyle,
          borderRadius: "8px",
          boxShadow: "none",
          border: "none",
        };
      case "outline":
        return {
          ...baseStyle,
          borderRadius: "4px",
          boxShadow: "none",
          border: `2px solid ${primaryColor}`,
        };
      case "sharp":
        return {
          ...baseStyle,
          borderRadius: "0px",
          boxShadow: "none",
          border: `1px solid ${theme.cardBorderColor || `${primaryColor}30`}`,
        };
      case "blocky":
        return {
          ...baseStyle,
          borderRadius: "0px",
          boxShadow: `4px 4px 0px ${primaryColor}`,
          border: `2px solid ${primaryColor}`,
        };
      case "glass":
        return {
          ...baseStyle,
          borderRadius: "16px",
          backgroundColor: isDark ? `${theme.cardBackground}40` : `${theme.cardBackground}70`,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)"}`,
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.1)",
        };
      case "rounded":
        return {
          ...baseStyle,
          borderRadius: "24px",
          boxShadow: isDark ? "0 8px 30px rgba(0, 0, 0, 0.4)" : "0 8px 16px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${theme.cardBorderColor || `${primaryColor}15`}`,
        };
      case "soft-cloud":
        return {
          ...baseStyle,
          borderRadius: "20px",
          boxShadow: isDark ? "0 20px 50px rgba(0, 0, 0, 0.5)" : "0 10px 40px rgba(0, 0, 0, 0.05)",
          border: "none",
          backgroundColor: isDark ? `${theme.cardBackground}90` : theme.cardBackground,
        };
      case "capsule":
        return {
          ...baseStyle,
          borderRadius: "60px",
          boxShadow: `4px 4px 0px ${primaryColor}`,
          border: `2px solid ${primaryColor}`,
        };
      default:
        return baseStyle;
    }
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
