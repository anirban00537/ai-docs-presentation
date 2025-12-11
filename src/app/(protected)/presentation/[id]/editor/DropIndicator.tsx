import React from "react";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";

interface DropIndicatorProps {
  isVisible: boolean;
  orientation: "vertical" | "horizontal";
  // For vertical: left offset in % or px
  // For horizontal: top offset in % or px
  position: string | number;
  // Optional custom length/height
  length?: string | number;
}

export const DropIndicator: React.FC<DropIndicatorProps> = ({
  isVisible,
  orientation,
  position,
  length = "100%",
}) => {
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

  if (!isVisible) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    backgroundColor: theme.primary,
    zIndex: 50,
    pointerEvents: "none",
    boxShadow: `0 0 0 2px ${theme.primary}33`,
  };

  if (orientation === "vertical") {
    // Vertical Line (for column sorting)
    Object.assign(style, {
      top: 0,
      bottom: 0,
      left: position,
      width: "4px",
      height: length,
      transform: "translateX(-50%)",
      borderRadius: "2px",
    });
  } else {
    // Horizontal Line (for row sorting - not used much here but good to have)
    Object.assign(style, {
      left: 0,
      right: 0,
      top: position,
      height: "4px",
      width: length,
      transform: "translateY(-50%)",
      borderRadius: "2px",
    });
  }

  return (
    <div style={style} className="animate-in fade-in duration-200">
      {/* Pill handle at the top/start for visual flare */}
      <div
        style={{
          position: "absolute",
          top: orientation === "vertical" ? "-6px" : "50%",
          left: orientation === "vertical" ? "50%" : "-6px",
          width: orientation === "vertical" ? "12px" : "12px",
          height: orientation === "vertical" ? "12px" : "12px",
          backgroundColor: theme.primary,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          border: "2px solid white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};
