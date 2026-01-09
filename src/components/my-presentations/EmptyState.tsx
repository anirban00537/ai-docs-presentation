"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconPresentation, IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 px-8"
  >
    {/* Glassmorphic icon container */}
    <motion.div
      className="relative w-24 h-24 rounded-3xl flex items-center justify-center mb-8 overflow-hidden bg-white shadow-depth-3 border border-secondary/20"
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <IconPresentation size={42} className="text-secondary opacity-80" />
    </motion.div>
    
    <h3 className="text-xl font-bold font-serif text-foreground mb-2">
      No presentations yet
    </h3>
    <p className="text-sm text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
      Create your first presentation to get started. Our AI will help you design beautiful slides in seconds.
    </p>
    
    <Button
      onClick={onCreateClick}
      className="gap-2 px-6 h-11 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02] shadow-coral-glow"
    >
      <IconPlus size={18} />
      Create Your First Presentation
    </Button>
  </motion.div>
);
