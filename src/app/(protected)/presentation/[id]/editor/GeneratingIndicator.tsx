"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Theme } from "@/store/slices/slidesSlice";

interface GeneratingIndicatorProps {
  isGenerating: boolean;
  progress: { current: number; total: number } | null;
  theme: Theme;
}

export const GeneratingIndicator: React.FC<GeneratingIndicatorProps> = ({
  isGenerating,
  progress,
  theme,
}) => {
  const isDark = theme.themeType === "dark";

  return (
    <AnimatePresence>
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <div
            className="flex items-center gap-3 px-5 py-3 rounded-2xl border shadow-lg"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 30, 35, 0.85)"
                : "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.08)",
              boxShadow: isDark
                ? "0 8px 32px rgba(0, 0, 0, 0.4)"
                : "0 8px 32px rgba(0, 0, 0, 0.12)",
            }}
          >
            {/* Spinner */}
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{
                borderColor: `${theme.primary}30`,
                borderTopColor: theme.primary,
              }}
            />

            {/* Text */}
            <span
              className="text-sm font-medium"
              style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
            >
              {progress
                ? `Generating slide ${progress.current} of ${progress.total}`
                : "Generating slides"}
            </span>

            {/* Progress dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ 
                    backgroundColor: theme.secondaryColors && theme.secondaryColors[i] 
                      ? theme.secondaryColors[i] 
                      : theme.primary 
                  }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
