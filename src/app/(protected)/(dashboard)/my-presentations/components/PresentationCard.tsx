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
      className="group relative"
    >
      <Link href={`/presentation/${presentation.id}`}>
        <div className="relative overflow-hidden rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-lg hover:border-primary/20 cursor-pointer">
          {/* Slide Preview */}
          <div className="relative border-b border-border">
            {firstSlide ? (
              <SlidePreview slide={firstSlide} theme={theme} />
            ) : (
              <div 
                className="aspect-video flex items-center justify-center bg-muted/50"
              >
                <IconPresentation size={48} className="text-primary/30" />
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {presentation.title || "Untitled Presentation"}
            </h3>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <IconStack2 size={14} />
                {slideCount} {slideCount === 1 ? "slide" : "slides"}
              </span>
              <span className="flex items-center gap-1.5">
                <IconCalendar size={14} />
                {formatDate(presentation.updatedAt || presentation.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Actions dropdown */}
      <div className="absolute top-3 right-3 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border opacity-0 group-hover:opacity-100 transition-all hover:bg-background"
              onClick={(e) => e.preventDefault()}
            >
              <IconDotsVertical size={16} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(presentation.id);
              }}
            >
              <IconEdit className="size-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete(presentation.id, presentation.title || "Untitled Presentation");
              }}
              className="text-destructive focus:text-destructive"
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
