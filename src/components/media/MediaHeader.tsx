"use client";

import React from "react";
import { motion } from "framer-motion";
import { IconUpload, IconLoader2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

interface MediaHeaderProps {
  isUploading: boolean;
  onUpload: () => void;
}

export const MediaHeader: React.FC<MediaHeaderProps> = ({ 
  isUploading, 
  onUpload 
}) => {
  return (
    <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6"
    >
        <div className="space-y-4">
            <h1 className="font-serif text-3xl md:text-5xl text-foreground tracking-tight leading-tight">
            Media <span className="italic text-primary">library</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/80 font-medium max-w-md">
            Manage your images and assets in one central place.
            </p>
        </div>

      <Button
        onClick={onUpload}
        disabled={isUploading}
        variant="default"
        className="shadow-coral-glow hover:scale-105 transition-transform"
      >
        {isUploading ? (
          <IconLoader2 size={18} className="mr-2 animate-spin" />
        ) : (
          <IconUpload size={18} className="mr-2" />
        )}
        Upload Media
      </Button>
    </motion.div>
  );
};
