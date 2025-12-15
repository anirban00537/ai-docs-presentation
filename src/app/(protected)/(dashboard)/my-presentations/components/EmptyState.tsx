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
    <motion.div
      className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 bg-primary/10"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity }}
    >
      <IconPresentation size={36} className="text-primary" />
    </motion.div>
    
    <h3 className="text-xl font-semibold text-foreground mb-2">
      No presentations yet
    </h3>
    <p className="text-sm text-muted-foreground mb-8 text-center max-w-md">
      Create your first presentation to get started. Our AI will help you design beautiful slides in seconds.
    </p>
    
    <Button
      onClick={onCreateClick}
      className="gap-2 px-6 h-11 rounded-xl text-sm font-medium"
    >
      <IconPlus size={18} />
      Create Your First Presentation
    </Button>
  </motion.div>
);
