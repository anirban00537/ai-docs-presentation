"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Theme } from "@/store/slices/slidesSlice";

interface ProgressIndicatorProps {
  isGenerating: boolean;
  progress: { 
    current: number; 
    total: number;
    stage?: string;
    message?: string;
    estimatedSeconds?: number;
  } | null;
  theme: Theme;
}

// Helper function to get human-readable stage names
const getStageDisplay = (stage?: string): string => {
  const stageMap: Record<string, string> = {
    'initializing': '🚀 Initializing',
    'analyzing-layout': '🔍 Analyzing layout',
    'generating-content': '✨ AI creating content',
    'saving-slide': '💾 Saving slide',
  };
  return stage ? stageMap[stage] || stage : '';
};

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
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
            className="flex flex-col gap-2 px-6 py-4 rounded-2xl border shadow-lg min-w-[320px]"
            style={{
              backgroundColor: isDark
                ? "rgba(30, 30, 35, 0.95)"
                : "rgba(255, 255, 255, 0.95)",
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
            {/* Top row: Main progress */}
            <div className="flex items-center gap-3">
              {/* Spinner */}
              <div
                className="w-5 h-5 border-2 rounded-full animate-spin flex-shrink-0"
                style={{
                  borderColor: `${theme.primary}30`,
                  borderTopColor: theme.primary,
                }}
              />

              {/* Main Text */}
              <div className="flex-1">
                <div
                  className="text-sm font-semibold"
                  style={{ color: isDark ? "#e5e7eb" : "#1f2937" }}
                >
                  {progress
                    ? `Slide ${progress.current} of ${progress.total}`
                    : "Generating slides"}
                </div>
                
                {/* Stage/Message */}
                {progress?.message && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs mt-0.5"
                    style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
                  >
                    {progress.stage && getStageDisplay(progress.stage)} {progress.message.replace(getStageDisplay(progress.stage), '')}
                  </motion.div>
                )}
              </div>

              {/* Estimated Time (if available) */}
              {progress?.estimatedSeconds && progress.current === 0 && (
                <div
                  className="text-xs font-medium px-2 py-1 rounded-lg"
                  style={{
                    backgroundColor: `${theme.primary}15`,
                    color: theme.primary,
                  }}
                >
                  ~{progress.estimatedSeconds}s
                </div>
              )}
            </div>

            {/* Progress bar */}
            {progress && (
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(0, 0, 0, 0.08)",
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: theme.primary }}
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${(progress.current / progress.total) * 100}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            )}

            {/* Progress dots animation */}
            <div className="flex justify-center gap-1 mt-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: theme.secondaryColors && theme.secondaryColors[i]
                      ? theme.secondaryColors[i]
                      : theme.primary,
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

