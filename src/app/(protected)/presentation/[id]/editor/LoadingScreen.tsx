"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconLoader2 } from "@tabler/icons-react";

interface LoadingScreenProps {
  isGenerating?: boolean;
  progress?: { current: number; total: number } | null;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isGenerating,
  progress,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            left: "20%",
            top: "20%",
          }}
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 30, 0],
            scale: [1, 1.1, 0.95, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
          style={{
            background: "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
            right: "15%",
            bottom: "20%",
          }}
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 25, -15, 0],
            scale: [1, 0.95, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo / Spinner Container */}
        <div className="relative">
          {/* Outer ring */}
          <motion.div
            className="w-20 h-20 rounded-full border-2 border-white/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Inner spinning arc */}
          <motion.div
            className="absolute inset-0 w-20 h-20 rounded-full"
            style={{
              border: "2px solid transparent",
              borderTopColor: "#8b5cf6",
              borderRightColor: "#8b5cf6",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <IconLoader2 
                size={28} 
                className="text-white/80"
                style={{ animation: "none" }}
              />
            </motion.div>
          </div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center gap-3">
          <motion.h2
            className="text-xl font-semibold text-white/90"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {isGenerating ? "Generating your presentation" : "Loading presentation"}
          </motion.h2>
          
          {/* Progress indicator for generation */}
          {isGenerating && progress && progress.total > 0 && (
            <motion.div
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/50">
                  Slide {progress.current} of {progress.total}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-48 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #8b5cf6, #a855f7)",
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(progress.current / progress.total) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}

          {/* Loading dots */}
          {!isGenerating && (
            <motion.div
              className="flex items-center gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/40"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
