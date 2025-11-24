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
    <header className="pointer-events-auto w-full bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border-b border-border/60 dark:border-border/40 flex items-center justify-between px-5 h-16 z-50 transition-all duration-300 shadow-sm">
      <div className="flex items-center gap-5">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8 hover:bg-accent/50 rounded-md" />
        <div className="h-7 w-px bg-border/60" />
        <h1 className="text-sm font-semibold text-foreground/90 hover:text-foreground transition-colors cursor-text tracking-tight">
          Presentation Title
        </h1>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-0.5 p-1 rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/40 backdrop-blur-md shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background dark:hover:bg-neutral-800/80 hover:shadow-sm transition-all duration-200 active:scale-[0.97]"
            onClick={onOpenInsertPanel}
          >
            <Plus className="mr-2 h-4 w-4" />
            Insert
          </Button>

          <div className="h-5 w-px bg-border/60 mx-0.5" />

          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background dark:hover:bg-neutral-800/80 hover:shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-[0.97]"
            disabled={!activeSlide}
            onClick={onOpenBackgroundPanel}
          >
            <Palette className="mr-2 h-4 w-4" />
            Background
          </Button>

          <div className="h-5 w-px bg-border/60 mx-0.5" />

          <Button
            variant="ghost"
            size="sm"
            className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background dark:hover:bg-neutral-800/80 hover:shadow-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent active:scale-[0.97]"
            disabled={!activeSlide}
            onClick={onOpenThemePanel}
          >
            <LayoutTemplate className="mr-2 h-4 w-4" />
            Theme
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-[0.97]"
        >
          <Play className="mr-2 h-4 w-4 fill-current" />
          Play
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-9 rounded-lg px-4 text-xs font-semibold bg-primary text-primary-foreground shadow-md hover:shadow-lg hover:bg-primary/95 transition-all duration-200 active:scale-[0.97]"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
    </header>
  );
};
