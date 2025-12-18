import React from "react";
import { type Theme } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import * as Patterns from "./patterns";

interface CardWrapperProps {
  theme: Theme;
  slideId?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showPattern?: boolean;
}

/**
 * CardWrapper encapsulates the visual style of a slide or card block.
 * It handles theme-driven backgrounds, borders, shadows, and overlays 
 * like grain and vignette.
 */
export const CardWrapper: React.FC<CardWrapperProps> = ({
  theme,
  slideId,
  fullWidth = false,
  children,
  className = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
  showPattern = true,
}) => {
  const isDark = theme.themeType === "dark";
  const primaryColor = theme.primary;

  const getStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: theme.cardBackground,
      fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      position: "relative",
      overflow: "visible", // Allow overflow for buttons/handles
      ...(fullWidth
        ? { width: "100%", minHeight: "100vh" }
        : { minWidth: `${SLIDE_MAX_WIDTH}px`, maxWidth: `${SLIDE_MAX_WIDTH}px` }),
      ...style,
    };

    if (fullWidth) {
      return { ...baseStyle, borderRadius: "0px", boxShadow: "none", border: "none" };
    }

    // Use granular properties from theme with fallbacks
    const borderRadius = theme.cardBorderRadius || "12px";
    const boxShadow = theme.cardBoxShadow || (isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.08)");
    const borderWidth = theme.cardBorderWidth || "1px";
    const borderStyle = theme.cardBorderStyle || "solid";
    const borderColor = theme.cardBorderColor || `${primaryColor}15`;
    const backdropBlur = theme.cardBackdropBlur || "0px";
    const opacity = theme.cardOpacity !== undefined ? theme.cardOpacity : 1;

    return {
      ...baseStyle,
      backgroundColor: opacity < 1 ? `rgba(${isDark ? '0, 0, 0' : '255, 255, 255'}, ${opacity})` : theme.cardBackground,
      borderRadius,
      boxShadow,
      border: `${borderWidth} ${borderStyle} ${borderColor}`,
      backdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      WebkitBackdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
    };
  };

  const finalStyle = getStyle();
  const borderRadius = finalStyle.borderRadius;

  const renderPattern = () => {
    if (!showPattern) return null;
    const pattern = theme.cardDesignPattern;
    if (!pattern || pattern === "none") return null;

    const secondaryColors = theme.secondaryColors || [];
    const color1 = secondaryColors[0] || theme.primary;
    const color2 = secondaryColors[1] || theme.primary;

    switch (pattern) {
      case "dots":
        return <Patterns.Dots color={theme.primary} id={slideId || "default"} />;
      case "grid":
        return <Patterns.Grid color={theme.primary} id={slideId || "default"} />;
      case "mesh":
        return <Patterns.Mesh primary={theme.primary} color1={color1} color2={color2} />;
      case "waves":
        return <Patterns.Waves color={theme.primary} />;
      case "glass":
        return <Patterns.Glass color={theme.primary} />;
      default:
        return null;
    }
  };

  return (
    <div
      className={className}
      style={finalStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background layer: Patterns, Grain, Vignette */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none" 
        style={{ borderRadius }}
      >
        {renderPattern()}
        
        {/* Film Grain / Noise Overlay */}
        {(theme.cardNoiseOpacity ?? 0) > 0 && (
          <div 
            className="absolute inset-0 mix-blend-overlay pointer-events-none"
            style={{ 
              opacity: theme.cardNoiseOpacity,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px'
            }}
          />
        )}

        {/* Vignette Overlay */}
        {(theme.cardVignetteOpacity ?? 0) > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${theme.cardVignetteOpacity}) 100%)`
            }}
          />
        )}
      </div>

      {/* Actual Slide Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
