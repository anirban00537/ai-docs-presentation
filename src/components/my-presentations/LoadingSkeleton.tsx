"use client";

import React from "react";
import { motion } from "framer-motion";

export const LoadingSkeleton: React.FC = () => (
  <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)] bg-gradient-to-b ">
    {/* Background Blobs */}
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

    {/* === SCROLLABLE CONTENT LAYER === */}
    <div className="relative z-10 w-full px-4 py-8 md:px-8">
      {/* Header skeleton */}
      <div className="mb-12 flex items-end justify-between">
        <div>
          <div className="h-9 w-56 rounded-xl mb-3 animate-pulse bg-slate-100" />
          <div className="h-5 w-72 rounded-lg animate-pulse bg-slate-100" />
        </div>
        <div className="h-10 w-40 rounded-xl animate-pulse bg-slate-100" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl overflow-hidden bg-white/40 border border-slate-100"
          >
            <div className="aspect-video animate-pulse bg-slate-100" />
            <div className="p-4">
              <div className="h-5 w-3/4 rounded-lg mb-3 animate-pulse bg-slate-100" />
              <div className="h-4 w-1/2 rounded-lg animate-pulse bg-slate-100" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
