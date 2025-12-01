"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AppleButton } from "@/components/editor/apple-button";
import { Plus, ExternalLink, Play, Image } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectPresentationTitle,
  selectPresentationId,
  updatePresentationTitle,
} from "@/store/slices/slidesSlice";
import { EditorSidebarTrigger } from "@/components/editor/editor-sidebar-shell";
import { useDebouncedCallback } from "use-debounce";
import { useUpdatePresentationTitle } from "@/hooks/use-presentation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MediaBrowser } from "@/components/editor/media-browser";

type EditorHeaderProps = {
  onOpenInsertPanel: () => void;
  onStartPresentation: () => void;
};

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onOpenInsertPanel,
  onStartPresentation,
}) => {
  const presentationTitle = useAppSelector(selectPresentationTitle);
  const presentationId = useAppSelector(selectPresentationId);
  const dispatch = useAppDispatch();
  const updateTitleMutation = useUpdatePresentationTitle();
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Use local title when editing, otherwise use Redux title
  const displayTitle = isEditingTitle
    ? localTitle
    : presentationTitle || "Untitled Presentation";

  // Debounced update to Redux and API
  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    // Update Redux state immediately for UI responsiveness
    dispatch(updatePresentationTitle({ title: value }));

    // Update API only if we have a presentationId and the title is not empty
    if (presentationId && value.trim().length > 0) {
      updateTitleMutation.mutate({
        id: presentationId,
        title: value.trim(),
      });
    }
  }, 500);

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
      <span className="pointer-events-none absolute inset-px rounded-[18px] border border-white/10 dark:border-white/5 opacity-80" />
      <div className="flex items-center gap-5">
        <EditorSidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8 hover:bg-accent/50 rounded-md" />
        <div className="h-7 w-px bg-border/60" />
        <div className="relative flex items-center min-w-0">
          <input
            ref={titleInputRef}
            type="text"
            value={displayTitle}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalTitle(newValue);
              debouncedUpdateTitle(newValue);
            }}
            onFocus={() => {
              setIsEditingTitle(true);
              setLocalTitle(presentationTitle || "Untitled Presentation");
            }}
            onBlur={() => {
              setIsEditingTitle(false);
              setLocalTitle("");
            }}
            className="text-sm font-semibold text-foreground/85 cursor-text tracking-tight focus:outline-none bg-transparent border-none p-0 min-w-0 max-w-[300px]"
            placeholder="Untitled Presentation"
          />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background dark:hover:bg-neutral-800/80 hover:shadow-sm transition-all duration-200 active:scale-[0.97]"
          onClick={onOpenInsertPanel}
        >
          <Plus className="mr-2 h-4 w-4" />
          Insert
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-background dark:hover:bg-neutral-800/80 hover:shadow-sm transition-all duration-200 active:scale-[0.97]"
            >
              <Image className="mr-2 h-4 w-4" />
              Media
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="p-0" sideOffset={8}>
            <MediaBrowser />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-9 rounded-lg px-4 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 active:scale-[0.97] border border-border/60 dark:border-border/40"
          onClick={onStartPresentation}
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
