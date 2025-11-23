"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Palette,
  Plus,
  LayoutTemplate,
  ExternalLink,
  Play,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectActiveSlide } from "@/store/slices/slidesSlice";
import { SidebarTrigger } from "@/components/ui/sidebar";

type EditorHeaderProps = {
  onOpenInsertPanel: () => void;
  onOpenBackgroundPanel: () => void;
  onOpenThemePanel: () => void;
};

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onOpenInsertPanel,
  onOpenBackgroundPanel,
  onOpenThemePanel,
}) => {
  const activeSlide = useAppSelector(selectActiveSlide);

  return (
    <header className="pointer-events-auto w-full bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 h-14 z-50 transition-all duration-300">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors" />
        <div className="h-6 w-px bg-black/5 dark:bg-white/10" />
        <h1 className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors cursor-text">
          Presentation Title
        </h1>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-200"
            onClick={onOpenInsertPanel}
          >
            <Plus className="mr-2 h-3.5 w-3.5" />
            Insert
          </Button>

          <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-200 disabled:opacity-50"
            disabled={!activeSlide}
            onClick={onOpenBackgroundPanel}
          >
            <Palette className="mr-2 h-3.5 w-3.5" />
            Background
          </Button>

          <div className="h-4 w-px bg-black/10 dark:bg-white/10 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-lg px-3 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white dark:hover:bg-neutral-800 hover:shadow-sm transition-all duration-200 disabled:opacity-50"
            disabled={!activeSlide}
            onClick={onOpenThemePanel}
          >
            <LayoutTemplate className="mr-2 h-3.5 w-3.5" />
            Theme
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-4 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-200"
        >
          <Play className="mr-2 h-3.5 w-3.5 fill-current" />
          Play
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-9 rounded-lg px-4 text-xs font-medium bg-primary text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/90 transition-all duration-300 active:scale-[0.98]"
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          Share
        </Button>
      </div>
    </header>
  );
};
