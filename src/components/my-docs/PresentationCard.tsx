"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconPresentation,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconCalendar,
  IconStack2,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_THEME, Theme } from "@/store/slices/slidesSlice";
import { SlidePreview } from "./SlidePreview";

interface PresentationCardProps {
  presentation: any;
  index: number;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const PresentationCard: React.FC<PresentationCardProps> = ({
  presentation,
  index,
  onEdit,
  onDelete,
}) => {
  const theme: Theme = {
    ...DEFAULT_THEME,
    ...(presentation.globalTheme || {}),
  };
  
  const firstSlide = presentation.slides?.[0];
  const slideCount = presentation._count?.slides || presentation.slides?.length || 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative"
    >
      <Link href={`/docs/${presentation.id}`}>
        <div 
          className="relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer bg-white/40 border border-secondary/20 hover:border-primary/20 hover:shadow-depth-3 hover:bg-white"
        >
          {/* Slide Preview */}
          <div className="relative border-b border-black/5">
            {firstSlide ? (
              <SlidePreview slide={firstSlide} theme={theme} />
            ) : (
              <div 
                className="aspect-video flex items-center justify-center bg-secondary/5"
              >
                <IconPresentation size={48} className="text-secondary/50" />
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
          </div>

          {/* Content */}
          <div className="relative p-4 z-10">
            <h3 className="font-serif text-sm font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {presentation.title || "Untitled Presentation"}
            </h3>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
              <span className="flex items-center gap-1.5 p-1 px-2 rounded-full bg-secondary/10">
                <IconStack2 size={12} />
                {slideCount}
              </span>
              <span className="flex items-center gap-1.5">
                <IconCalendar size={12} />
                {formatDate(presentation.updatedAt || presentation.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions dropdown */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-1.5 rounded-lg bg-white/80 backdrop-blur-sm border border-black/5 shadow-sm hover:bg-white transition-colors"
              onClick={(e) => e.preventDefault()}
            >
              <IconDotsVertical size={16} className="text-foreground/70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className="rounded-xl border border-secondary/20 shadow-lg bg-white/95 backdrop-blur-md"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(presentation.id);
              }}
              className="rounded-lg cursor-pointer"
            >
              <IconEdit className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(presentation.id, presentation.title || "Untitled Presentation");
              }}
              className="text-destructive focus:text-destructive rounded-lg cursor-pointer"
            >
              <IconTrash className="size-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
};
