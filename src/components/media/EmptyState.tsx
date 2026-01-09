"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUpload: () => void;
}

export const EmptyState = ({ onUpload }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20"
  >
    <div
      className="relative w-24 h-24 rounded-3xl flex items-center justify-center mb-6 bg-white shadow-depth-3 border border-secondary/20"
    >
      <IconPhoto size={40} className="text-secondary/50" />
    </div>
    <h3 className="text-lg font-serif font-bold text-foreground mb-2">
      No media yet
    </h3>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-6 leading-relaxed">
      Upload images to use in your presentations. They&apos;ll be stored securely
      and accessible from anywhere.
    </p>
    <Button
      onClick={onUpload}
      className="shadow-coral-glow hover:scale-105 transition-transform"
    >
      <IconUpload size={18} className="mr-2" />
      Upload Media
    </Button>
  </motion.div>
);
