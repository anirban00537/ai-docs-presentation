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
      className="relative w-24 h-24 rounded-3xl flex items-center justify-center mb-8 overflow-hidden"
      animate={{ scale: [1, 1.03, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.4)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: `
          0 1px 0 0 rgba(255, 255, 255, 1) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
          1px 0 0 0 rgba(255, 255, 255, 0.8) inset,
          -1px 0 0 0 rgba(0, 0, 0, 0.03) inset,
          0 8px 32px rgba(139, 92, 246, 0.12),
          0 2px 8px rgba(0, 0, 0, 0.04)
        `,
      }}
    >
      {/* Glass shine overlay */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background: "linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.3) 100%)",
        }}
      />
      
      {/* Purple glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 100%, rgba(139, 92, 246, 0.2) 0%, transparent 60%)",
        }}
      />
      
      <IconPresentation size={42} className="text-primary relative z-10" />
    </motion.div>
    
    <h3 className="text-xl font-semibold text-foreground mb-2">
      No presentations yet
    </h3>
    <p className="text-sm text-muted-foreground mb-8 text-center max-w-md leading-relaxed">
      Create your first presentation to get started. Our AI will help you design beautiful slides in seconds.
    </p>
    
    <Button
      onClick={onCreateClick}
      className="gap-2 px-6 h-11 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
      style={{
        boxShadow: "0 4px 16px rgba(139, 92, 246, 0.25)",
      }}
    >
      <IconPlus size={18} />
      Create Your First Presentation
    </Button>
  </motion.div>
);
