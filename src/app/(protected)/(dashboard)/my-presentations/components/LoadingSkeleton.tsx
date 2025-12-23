"use client";

import React from "react";
import { motion } from "framer-motion";

export const LoadingSkeleton: React.FC = () => (
  <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)]">
    {/* === FIXED BACKGROUND LAYER === */}
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{
        background: "linear-gradient(135deg, var(--background) 0%, var(--sidebar) 100%)",
        zIndex: 0,
      }}
    >
      {/* Soft primary blob - Top Left */}
      <div
        className="absolute"
        style={{
          width: "70vw",
          height: "60vh",
          top: "-20%",
          left: "-20%",
          background: "radial-gradient(circle at center, color-mix(in srgb, var(--primary) 15%, transparent) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      
      {/* Soft secondary blob - Top Right */}
      <div
        className="absolute"
        style={{
          width: "60vw",
          height: "55vh",
          top: "-15%",
          right: "-15%",
          background: "radial-gradient(circle at center, color-mix(in srgb, var(--secondary) 20%, transparent) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
      
      {/* Soft accent blob - Left */}
      <div
        className="absolute"
        style={{
          width: "50vw",
          height: "60vh",
          top: "20%",
          left: "-15%",
          background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      
      {/* Soft chart-1 blob - Right */}
      <div
        className="absolute"
        style={{
          width: "55vw",
          height: "55vh",
          top: "30%",
          right: "-10%",
          background: "radial-gradient(ellipse at center, color-mix(in srgb, var(--chart-1) 10%, transparent) 0%, transparent 70%)",
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
            style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 6%, transparent)" }}
          />
          <div 
            className="h-5 w-72 rounded-lg animate-pulse" 
            style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}
          />
        </div>
        <div 
          className="h-10 w-40 rounded-xl animate-pulse"
          style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 6%, transparent)" }}
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
              backgroundColor: "color-mix(in srgb, var(--card) 40%, transparent)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow: `
                0 1px 0 0 color-mix(in srgb, var(--foreground) 10%, transparent) inset,
                0 -1px 0 0 color-mix(in srgb, var(--foreground) 5%, transparent) inset,
                0 4px 16px rgba(0, 0, 0, 0.06)
              `,
            }}
          >
            {/* Glass shine overlay */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, var(--card) 50%, transparent) 0%, transparent 40%, transparent 60%, color-mix(in srgb, var(--card) 20%, transparent) 100%)",
              }}
            />
            
            <div 
              className="aspect-video animate-pulse"
              style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}
            />
            <div className="p-4">
              <div 
                className="h-5 w-3/4 rounded-lg mb-3 animate-pulse" 
                style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 6%, transparent)" }}
              />
              <div 
                className="h-4 w-1/2 rounded-lg animate-pulse"
                style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 4%, transparent)" }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
