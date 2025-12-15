import React from "react";
import { motion } from "framer-motion";
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

  const isVertical = orientation === "vertical";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: "absolute",
        zIndex: 50,
        pointerEvents: "none",
        ...(isVertical
          ? {
              top: 0,
              bottom: 0,
              left: position,
              width: "2px",
              height: length,
              transform: "translateX(-50%)",
            }
          : {
              left: 0,
              right: 0,
              top: position,
              height: "2px",
              width: length,
              transform: "translateY(-50%)",
            }),
      }}
    >
      {/* Main line */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: theme.primary,
          borderRadius: "1px",
        }}
      />
      
      {/* Start dot */}
      <div
        style={{
          position: "absolute",
          top: isVertical ? "-3px" : "50%",
          left: isVertical ? "50%" : "-3px",
          width: "6px",
          height: "6px",
          backgroundColor: theme.primary,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
      
      {/* End dot */}
      <div
        style={{
          position: "absolute",
          bottom: isVertical ? "-3px" : "auto",
          top: isVertical ? "auto" : "50%",
          right: isVertical ? "auto" : "-3px",
          left: isVertical ? "50%" : "auto",
          width: "6px",
          height: "6px",
          backgroundColor: theme.primary,
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </motion.div>
  );
};
