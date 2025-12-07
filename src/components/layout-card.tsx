"use client";

import React from "react";
import { MoreVertical, Trash2, LayoutTemplate } from "lucide-react";
import { AppleButton } from "@/components/editor/apple-button";
import Slide from "@/components/editor/slide";
import type { SlideModel } from "@/store/slices/slidesSlice";
import type { LayoutListItem } from "@/services/layouts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LayoutCardProps {
  layout: LayoutListItem;
  onUse: (layoutId: string) => void;
  onDelete: (layoutId: string, e: React.MouseEvent) => void;
}

export function LayoutCard({ layout, onUse, onDelete }: LayoutCardProps) {
  // Extract slide data from layout.data
  const layoutData = layout.data || {};
  const slideData: SlideModel = {
    id: layout.id,
    title: layoutData.title || layout.name,
    widgets: layoutData.widgets || [],
    backgroundColor: layoutData.backgroundColor,
    backgroundImage: layoutData.backgroundImage,
    backgroundBlur: layoutData.backgroundBlur,
    showSlideNumber: layoutData.showSlideNumber ?? false,
    slideStyle: layoutData.slideStyle,
  };

  // Create a mock globalTheme for preview (use default if not available)
  const mockGlobalTheme = {
    id: "default",
    background: "#ffffff",
    surface: "#f8f9fa",
    text: "#000000",
    accent: "#3b82f6",
    font: "var(--font-poppins), Poppins, sans-serif",
    cardBackgroundType: "solid" as const,
    tone: "light" as const,
  };

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-card/95 border border-border/30 transition-all duration-500 ease-out"
      style={{
        transformStyle: "preserve-3d",
        perspective: "1000px",
        boxShadow: `
          0 2px 8px rgba(0, 0, 0, 0.04),
          0 8px 24px rgba(0, 0, 0, 0.06),
          0 16px 48px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05)
        `,
      }}
      onClick={() => onUse(layout.id)}
      onMouseMove={(e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `
          translateY(-8px) 
          rotateX(${rotateX}deg) 
          rotateY(${rotateY}deg) 
          scale(1.02)
        `;
        card.style.boxShadow = `
          0 8px 16px rgba(0, 0, 0, 0.08),
          0 16px 32px rgba(0, 0, 0, 0.06),
          0 32px 64px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(0, 0, 0, 0.1)
        `;
      }}
      onMouseLeave={(e) => {
        const card = e.currentTarget;
        card.style.transform = "translateY(0) rotateX(0) rotateY(0) scale(1)";
        card.style.boxShadow = `
          0 2px 8px rgba(0, 0, 0, 0.04),
          0 8px 24px rgba(0, 0, 0, 0.06),
          0 16px 48px rgba(0, 0, 0, 0.04),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          inset 0 -1px 0 rgba(0, 0, 0, 0.05)
        `;
      }}
    >
      {/* Shine effect overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%)",
        }}
      />

      {/* Bottom shadow for depth */}
      <div
        className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0, 0, 0, 0.2) 0%, transparent 70%)",
        }}
      />
      {/* Layout Preview */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted/30 via-muted/20 to-muted/10 rounded-t-2xl">
        {slideData.widgets && slideData.widgets.length > 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="relative h-full w-full rounded-lg overflow-hidden transition-transform duration-500 group-hover:scale-[1.02]">
              <Slide
                slide={slideData}
                selectedId={null}
                editingId={null}
                liveOverrides={{}}
                onSelectWidget={() => {}}
                onSetLiveOverride={() => {}}
                onClearLiveOverride={() => {}}
                globalTheme={mockGlobalTheme}
                scale={0.12}
                padding={0}
                showSnapLines={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-1.5">
              <div className="mx-auto h-10 w-10 rounded-lg bg-muted/50 flex items-center justify-center">
                <LayoutTemplate className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/80">
                  Empty layout
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Click to use
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Layout Info */}
      <div className="relative p-3 bg-gradient-to-b from-transparent to-card/50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="truncate text-xs font-semibold text-foreground transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5">
              {layout.name}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-[10px] text-muted-foreground/80 font-medium">
                {layout.type === "admin" ? "Butterfast" : "Your"} Layout
              </p>
              {layout.usageCount > 0 && (
                <p className="text-[10px] text-muted-foreground/60">
                  • {layout.usageCount} use{layout.usageCount !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <AppleButton
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 opacity-80 hover:opacity-100 hover:bg-destructive/10 transition-all duration-200"
                  title="More options"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </AppleButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={(e) => onDelete(layout.id, e)}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
