import React, { useState, useEffect, useRef, memo } from "react";
import { type Theme, type SlideAccent } from "@/store/slices/slidesSlice";
import { getFontFamily } from "@/lib/fonts";
import { SLIDE_MAX_WIDTH } from "@/lib/constants";
import * as Patterns from "../patterns";

interface SlideFrameProps {
  theme: Theme;
  slideId?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  showPattern?: boolean;
  accent?: SlideAccent;
  onAccentResize?: (width: number) => void;
  accentControls?: React.ReactNode;
  readOnly?: boolean;
}

/**
 * SlideFrame encapsulates the visual style of a slide or card block.
 * It handles theme-driven backgrounds, borders, shadows, and overlays 
 * like grain and vignette. Now supports Gamma-style Accent Layouts.
 */
export const SlideFrame = memo(function SlideFrame({
  theme,
  slideId,
  fullWidth = false,
  children,
  className = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
  showPattern = true,
  accent,
  onAccentResize,
  accentControls,
  readOnly = false,
}: SlideFrameProps) {
  const isDark = theme.themeType === "dark";
  const [isResizingAccent, setIsResizingAccent] = useState(false);
  const [localAccentSize, setLocalAccentSize] = useState(accent?.size || 40);
  const lastPosRef = useRef<number>(0);
  const latestSizeRef = useRef<number>(accent?.size || 40);

  useEffect(() => {
    if (accent?.size !== undefined) {
      setLocalAccentSize(accent.size);
      latestSizeRef.current = accent.size;
    }
  }, [accent?.size]);

  const handleAccentResizeStart = (e: React.MouseEvent) => {
    if (readOnly || accent?.position === "background") return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizingAccent(true);
    
    const isVertical = accent?.position === "top" || accent?.position === "bottom";
    lastPosRef.current = isVertical ? e.clientY : e.clientX;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = isVertical ? moveEvent.clientY : moveEvent.clientX;
      const delta = currentPos - lastPosRef.current;
      const container = document.getElementById(`card-content-${slideId}`);
      if (!container) return;

      const containerDimension = isVertical ? container.offsetHeight : container.offsetWidth;
      if (containerDimension === 0) return;

      setLocalAccentSize((prev: number) => {
        const deltaPercent = (delta / containerDimension) * 100;
        let newSize = (accent?.position === "right" || accent?.position === "bottom")
          ? prev - deltaPercent 
          : prev + deltaPercent;
        
        newSize = Math.max(5, Math.min(100, newSize));
        latestSizeRef.current = newSize;
        return newSize;
      });

      lastPosRef.current = currentPos;
    };

    const onMouseUp = () => {
      setIsResizingAccent(false);
      onAccentResize?.(latestSizeRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const getStyle = (): React.CSSProperties => {
    // Process opacity and backdrop blur settings first (apply to both modes)
    const opacity = theme.cardOpacity !== undefined ? theme.cardOpacity : 1;
    const backdropBlur = theme.cardBackdropBlur || "0px";
    
    const baseStyle: React.CSSProperties = {
      transition: isResizingAccent ? "none" : "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      backgroundColor: style.backgroundColor || (opacity < 1 ? `rgba(${isDark ? '0, 0, 0' : '255, 255, 255'}, ${opacity})` : theme.pageBackground),
      fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      position: "relative",
      backdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      WebkitBackdropFilter: backdropBlur !== "0px" ? `blur(${backdropBlur})` : "none",
      ...(fullWidth
        ? { width: "100%", minHeight: "100vh", overflow: "visible" }
        : { minWidth: `${SLIDE_MAX_WIDTH}px`, maxWidth: `${SLIDE_MAX_WIDTH}px`, overflow: "visible" }),
      ...style,
    };

    if (fullWidth) {
      return { ...baseStyle, borderRadius: "0px", boxShadow: "none", border: "none" };
    }

    const borderRadius = theme.cardBorderRadius || "12px";
    const boxShadow = theme.cardBoxShadow || (isDark ? "0 4px 20px rgba(0, 0, 0, 0.4)" : "0 4px 12px rgba(0, 0, 0, 0.08)");
    
    // Check border properties
    const borderWidth = theme.cardBorderWidth || "0px";
    const borderStyle = theme.cardBorderStyle || "solid";
    const borderColor = theme.borderColor || (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)");
    
    const border = (borderWidth !== "0px" && borderStyle !== "none")
      ? `${borderWidth} ${borderStyle} ${borderColor}`
      : "none";

    return {
      ...baseStyle,
      borderRadius,
      boxShadow: style.boxShadow || boxShadow,
      border,
    };
  };

  const finalStyle = getStyle();
  const borderRadius = finalStyle.borderRadius;

  const renderPattern = () => {
    if (!showPattern) return null;
    const pattern = theme.cardDesignPattern;
    if (!pattern || pattern === "none") return null;

    switch (pattern) {
      case "gaussian": return <Patterns.Gaussian primary={theme.primary} secondary={theme.secondaryColors} />;
      case "fractal": return <Patterns.Fractal primary={theme.primary} secondary={theme.secondaryColors} />;
      case "fluid": return <Patterns.Fluid primary={theme.primary} secondary={theme.secondaryColors} />;
      case "prism": return <Patterns.Prism primary={theme.primary} secondary={theme.secondaryColors} />;
      case "beams": return <Patterns.Beams primary={theme.primary} secondary={theme.secondaryColors} />;
      case "aurora": return <Patterns.Aurora primary={theme.primary} secondary={theme.secondaryColors} />;
      case "nebula": return <Patterns.Nebula primary={theme.primary} secondary={theme.secondaryColors} />;
      case "ether": return <Patterns.Ether primary={theme.primary} secondary={theme.secondaryColors} />;
      case "lumina": return <Patterns.Lumina primary={theme.primary} secondary={theme.secondaryColors} />;
      case "horizon": return <Patterns.Horizon primary={theme.primary} secondary={theme.secondaryColors} />;
      case "pulse": return <Patterns.Pulse primary={theme.primary} secondary={theme.secondaryColors} />;
      case "vortex": return <Patterns.Vortex primary={theme.primary} secondary={theme.secondaryColors} />;
      case "echo": return <Patterns.Echo primary={theme.primary} secondary={theme.secondaryColors} />;
      case "apex": return <Patterns.Apex primary={theme.primary} secondary={theme.secondaryColors} />;
      case "arch": return <Patterns.Arch primary={theme.primary} secondary={theme.secondaryColors} />;
      default: return null;
    }
  };

  const isVertical = accent?.position === "top" || accent?.position === "bottom";
  const isBackground = accent?.position === "background";

  return (
    <div
      className={className}
      style={finalStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background layer */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none" 
        style={{ borderRadius }}
      >
        <div style={{ opacity: theme.cardDesignPatternOpacity ?? 1 }} className="absolute inset-0">
          {renderPattern()}
        </div>
        
        {/* Background Image Mode */}
        {isBackground && accent?.url && (
          <div className="absolute inset-0">
            <img 
              src={accent.url} 
              alt="Background Accent" 
              className="w-full h-full object-cover transition-opacity duration-500"
              style={{ opacity: (accent.size ?? 40) / 100 }}
            />
            {/* Darker overlay to help text readability */}
            <div className={`absolute inset-0 ${isDark ? "bg-black/20" : "bg-white/10"}`} />
          </div>
        )}

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

        {(theme.cardVignetteOpacity ?? 0) > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle, transparent 30%, rgba(0,0,0,${theme.cardVignetteOpacity}) 100%)`
            }}
          />
        )}
      </div>

      <div 
        id={`card-content-${slideId}`}
        className={`relative z-10 w-full flex items-stretch ${
          accent?.position === "right" ? "flex-row-reverse" : 
          accent?.position === "bottom" ? "flex-col-reverse" : 
          accent?.position === "top" ? "flex-col" : "flex-row"
        }`}
        style={{ 
          borderRadius, 
          minHeight: fullWidth ? "100vh" : "100%" 
        }}
      >
        {accent && accent.url && !isBackground && (
          <div 
            className="relative flex-shrink-0 group/accent z-0" 
            style={{ 
              width: isVertical ? "100%" : `${localAccentSize}%`,
              height: isVertical ? `${localAccentSize}%` : "auto",
              minHeight: isVertical ? "200px" : "auto",
              overflow: "hidden", 
              borderTopLeftRadius: (accent.position === "left" || accent.position === "top") ? borderRadius : "0",
              borderBottomLeftRadius: (accent.position === "left" || accent.position === "bottom") ? borderRadius : "0",
              borderTopRightRadius: (accent.position === "right" || accent.position === "top") ? borderRadius : "0",
              borderBottomRightRadius: (accent.position === "right" || accent.position === "bottom") ? borderRadius : "0",
            }}
          >
            {accent.url && (
              <img 
                src={accent.url} 
                alt="Accent" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/10 transition-opacity opacity-0 group-hover/accent:opacity-100" />
            
            {!readOnly && accentControls}

            {/* Resize Handle - Subtle Ghost Line */}
            {!readOnly && (
              <div
                onMouseDown={handleAccentResizeStart}
                className={`absolute z-50 transition-all duration-300 ${
                  isVertical 
                    ? `left-0 w-full h-[1px] cursor-row-resize ${accent.position === "top" ? "bottom-0" : "top-0"}`
                    : `top-0 w-[1px] h-full cursor-col-resize ${accent.position === "left" ? "right-0" : "left-0"}`
                } ${
                  isResizingAccent ? "opacity-100 scale-[2]" : "opacity-0 group-hover/accent:opacity-30 hover:opacity-100"
                }`}
                style={{ backgroundColor: theme.primary }}
              >
                {/* Visual indicator dot - only on hover/active */}
                <div 
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-primary bg-white transition-all ${
                    isResizingAccent ? "scale-100 opacity-100" : "scale-0 opacity-0 group-hover/accent:scale-100 group-hover/accent:opacity-100"
                  }`}
                />
              </div>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className={`relative flex-1 flex flex-col justify-center min-w-0 z-10 ${isBackground ? "z-20" : ""}`}>
          {/* Background Controls (Special case since image is in bg layer) */}
          {isBackground && !readOnly && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none group/accent-bg">
              <div className="pointer-events-auto">
                {accentControls}
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
});

