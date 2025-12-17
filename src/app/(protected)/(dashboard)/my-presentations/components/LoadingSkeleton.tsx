"use client";

import React from "react";
import { motion } from "framer-motion";

export const LoadingSkeleton: React.FC = () => (
  <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)]">
    {/* === FIXED BACKGROUND LAYER === */}
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #fdfbfb 0%, #f8f9ff 50%, #f5f7ff 100%)",
        zIndex: 0,
      }}
    >
      {/* Soft lavender blob - Top Left */}
      <div
        className="absolute"
        style={{
          width: "70vw",
          height: "60vh",
          top: "-20%",
          left: "-20%",
          background: "radial-gradient(circle at center, rgba(196, 181, 253, 0.6) 0%, rgba(196, 181, 253, 0.25) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      
      {/* Soft sky blue blob - Top Right */}
      <div
        className="absolute"
        style={{
          width: "60vw",
          height: "55vh",
          top: "-15%",
          right: "-15%",
          background: "radial-gradient(circle at center, rgba(147, 197, 253, 0.55) 0%, rgba(147, 197, 253, 0.2) 50%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      
      {/* Soft rose blob - Left */}
      <div
        className="absolute"
        style={{
          width: "50vw",
          height: "60vh",
          top: "20%",
          left: "-15%",
          background: "radial-gradient(ellipse at center, rgba(251, 207, 232, 0.6) 0%, rgba(251, 207, 232, 0.2) 50%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      
      {/* Soft mint blob - Right */}
      <div
        className="absolute"
        style={{
          width: "55vw",
          height: "55vh",
          top: "30%",
          right: "-10%",
          background: "radial-gradient(ellipse at center, rgba(167, 243, 208, 0.5) 0%, rgba(167, 243, 208, 0.15) 50%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
    </div>

    {/* === SCROLLABLE CONTENT LAYER === */}
    <div className="relative z-10 w-full px-8 py-8">
      {/* Header skeleton */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <div 
            className="h-9 w-56 rounded-xl mb-3 animate-pulse"
            style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
          />
          <div 
            className="h-5 w-72 rounded-lg animate-pulse" 
            style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
          />
        </div>
        <div 
          className="h-10 w-40 rounded-xl animate-pulse"
          style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
        />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl overflow-hidden"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.35)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow: `
                0 1px 0 0 rgba(255, 255, 255, 1) inset,
                0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
                0 4px 16px rgba(0, 0, 0, 0.06)
              `,
            }}
          >
            {/* Glass shine overlay */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)",
              }}
            />
            
            <div 
              className="aspect-video animate-pulse"
              style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
            />
            <div className="p-4">
              <div 
                className="h-5 w-3/4 rounded-lg mb-3 animate-pulse" 
                style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
              />
              <div 
                className="h-4 w-1/2 rounded-lg animate-pulse"
                style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
