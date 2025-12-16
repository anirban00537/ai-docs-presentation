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
      <Link href={`/presentation/${presentation.id}`}>
        <div 
          className="relative overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.35)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: `
              0 1px 0 0 rgba(255, 255, 255, 1) inset,
              0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
              1px 0 0 0 rgba(255, 255, 255, 0.8) inset,
              -1px 0 0 0 rgba(0, 0, 0, 0.03) inset,
              0 4px 16px rgba(0, 0, 0, 0.06),
              0 1px 4px rgba(0, 0, 0, 0.03)
            `,
          }}
        >
          {/* Glass shine overlay */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-2xl z-10"
            style={{
              background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)",
            }}
          />

          {/* Colored glow on hover */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${theme.primary}15 0%, transparent 60%)`,
            }}
          />

          {/* Slide Preview */}
          <div className="relative" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
            {firstSlide ? (
              <SlidePreview slide={firstSlide} theme={theme} />
            ) : (
              <div 
                className="aspect-video flex items-center justify-center"
                style={{ backgroundColor: `${theme.primary}08` }}
              >
                <IconPresentation size={48} style={{ color: `${theme.primary}50` }} />
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />
          </div>

          {/* Content */}
          <div className="relative p-4 z-10">
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
      <div className="absolute top-3 right-3 z-30">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
              onClick={(e) => e.preventDefault()}
            >
              <IconDotsVertical size={16} className="text-foreground/70" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end"
            className="rounded-xl border-0"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
            }}
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit(presentation.id);
              }}
              className="rounded-lg"
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
              className="text-destructive focus:text-destructive rounded-lg"
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
