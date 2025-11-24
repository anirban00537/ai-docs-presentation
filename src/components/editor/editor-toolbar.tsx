"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppleButton } from "@/components/editor/apple-button";
import {
  Palette,
  Plus,
  LayoutTemplate,
  ExternalLink,
  Play,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectActiveSlide } from "@/store/slices/slidesSlice";
import { EditorSidebarTrigger } from "@/components/editor/editor-sidebar-shell";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [titleActive, setTitleActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.document?.documentElement?.scrollTop ?? window.scrollY ?? 0;
      setIsScrolled(scrollTop > 2);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  return (
    <header
      className={cn(
        "pointer-events-auto w-full relative overflow-hidden flex items-center justify-between px-5 h-16 z-50 border-b transition-all duration-300 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-lg border-white/20 dark:border-white/5",
        isHovered && "bg-white/80 dark:bg-neutral-900/80 backdrop-blur-2xl",
        isScrolled && "shadow-[0_10px_35px_-25px_rgba(0,0,0,0.8)]"
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span className="pointer-events-none absolute inset-[1px] rounded-[18px] border border-white/10 dark:border-white/5 opacity-80" />
      <div className="flex items-center gap-5">
        <EditorSidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8 hover:bg-accent/50 rounded-md" />
        <div className="h-7 w-px bg-border/60" />
        <div className="relative flex items-center">
          <h1
            className={cn(
              "text-sm font-semibold text-foreground/85 transition-all duration-200 cursor-text tracking-tight focus:outline-none",
              titleActive && "text-foreground translate-y-[-1px] tracking-[0.08em]"
            )}
            tabIndex={0}
            onMouseEnter={() => setTitleActive(true)}
            onMouseLeave={() => setTitleActive(false)}
            onFocus={() => setTitleActive(true)}
            onBlur={() => setTitleActive(false)}
          >
            Presentation Title
          </h1>
          <span
            className={cn(
              "absolute -right-2 top-1/2 h-4 w-px bg-primary origin-bottom transition-all duration-200 opacity-0 -translate-y-1/2",
              titleActive && "opacity-100 animate-pulse"
            )}
          />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex items-center gap-0.5 p-1 rounded-xl">
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
          className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-[0.97] border border-border/60 dark:border-border/40"
        >
          <Play className="mr-2 h-4 w-4 fill-current" />
          Play
        </Button>
        <AppleButton
          variant="primary"
          size="lg"
          className="text-xs font-semibold px-4"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Share
        </AppleButton>
      </div>
    </header>
  );
};
