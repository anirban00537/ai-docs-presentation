"use client";

import React from "react";
import { motion } from "framer-motion";

export const LoadingSkeleton: React.FC = () => (
  <div className="flex-1 bg-background">
    <div className="w-full px-8 py-8">
      {/* Header skeleton */}
      <div className="mb-10">
        <div className="h-9 w-56 bg-muted rounded-lg mb-3 animate-pulse" />
        <div className="h-5 w-72 bg-muted rounded-lg animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl overflow-hidden border border-border"
          >
            <div className="aspect-video bg-muted animate-pulse" />
            <div className="p-4">
              <div className="h-5 w-3/4 bg-muted rounded-lg mb-3 animate-pulse" />
              <div className="h-4 w-1/2 bg-muted rounded-lg animate-pulse" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);
