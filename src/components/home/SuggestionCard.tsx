"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { TablerIcon } from "@tabler/icons-react";

interface SuggestionCardProps {
  icon: LucideIcon | TablerIcon | any;
  title: string;
  description: string;
  prompt: string;
  iconColor?: string;
  onClick: (prompt: string) => void;
  index?: number;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  prompt, 
  iconColor, 
  onClick,
  index = 0
}) => {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(prompt)}
      className="group relative flex bg-transparent items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 overflow-hidden border border-slate-200 hover:border-primary/20 hover:shadow-depth-3"
    >
      <div 
        className={cn(
          "relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 bg-primary/10",
          iconColor
        )}
      >
        <Icon size={20} className="opacity-80 group-hover:opacity-100" />
      </div>
      <div className="relative min-w-0 flex-1">
        <h3 className="text-sm font-serif font-bold text-foreground group-hover:text-primary transition-colors truncate mb-0.5">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground truncate opacity-80 group-hover:opacity-100">
          {description}
        </p>
      </div>
    </motion.button>
  );
};
