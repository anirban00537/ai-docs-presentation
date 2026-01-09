"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconPlus } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface PresentationsHeaderProps {
  count: number;
  onNew: () => void;
}

export const PresentationsHeader: React.FC<PresentationsHeaderProps> = ({ 
  count, 
  onNew 
}) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6"
    >
        <div className="space-y-4">
            <h1 className="font-serif text-3xl md:text-5xl text-foreground tracking-tight leading-tight">
            My <span className="italic text-primary">presentations</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/80 font-medium max-w-md">
            {count > 0
                ? `You have ${count} presentation${count !== 1 ? 's' : ''} in your library.`
                : "Create and manage your professional presentations."
            }
            </p>
        </div>
        
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
        >
            <Button
                onClick={onNew}
                variant="default"
                className="shadow-coral-glow hover:scale-105 transition-transform"
            >
                <IconPlus size={18} className="mr-2" />
                New Project
            </Button>
        </motion.div>
    </motion.div>
  );
};
