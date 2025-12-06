"use client";

import React from "react";
import { Plus, MoreVertical, Trash2 } from "lucide-react";
import { AppleButton } from "@/components/editor/apple-button";
import Slide from "@/components/editor/slide";
import type { SlideModel } from "@/store/slices/slidesSlice";
import type { PresentationListItem } from "@/services/presentation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PresentationCardProps {
  presentation: PresentationListItem;
  onOpen: (presentationId: string) => void;
  onDelete: (presentationId: string, e: React.MouseEvent) => void;
}

export function PresentationCard({
  presentation,
  onOpen,
  onDelete,
}: PresentationCardProps) {
  const firstSlide = presentation.slides?.[0];
  const slideData = (firstSlide?.data as SlideModel) || {};

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-border hover:bg-card hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
      onClick={() => onOpen(presentation.id)}
    >
      {/* Presentation Preview */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5">
        {firstSlide ? (
          <div className="absolute inset-0 flex items-center justify-center p-2">
            <div className="relative h-full w-full rounded-lg overflow-hidden shadow-lg">
              <Slide
                slide={slideData}
                selectedId={null}
                editingId={null}
                liveOverrides={{}}
                onSelectWidget={() => {}}
                onSetLiveOverride={() => {}}
                onClearLiveOverride={() => {}}
                globalTheme={presentation.globalTheme}
                scale={0.2}
                padding={0}
                showSnapLines={false}
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/80">
                  No slides yet
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Click to start editing
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Presentation Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {presentation.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {presentation._count?.slides || 0} slide
              {(presentation._count?.slides || 0) !== 1 ? "s" : ""}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <AppleButton
                variant="ghost"
                size="sm"
                className="h-7 w-7 opacity-0 transition-all duration-200 group-hover:opacity-100"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </AppleButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => onDelete(presentation.id, e)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

