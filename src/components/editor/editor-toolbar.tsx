"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Image, Type, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectPresentationTitle,
  selectPresentationId,
  updatePresentationTitle,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import { useUpdatePresentationTitle } from "@/hooks/use-presentation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MediaBrowser } from "@/components/editor/media-browser";
import { TextWidgetsBrowser } from "@/components/editor/text-widgets-browser";
import { useWidgetCreation } from "@/hooks/use-widget-creation";
import type { TextPreset } from "@/components/editor/types";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";

type EditorHeaderProps = {
  onOpenInsertPanel: () => void;
};

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  onOpenInsertPanel,
}) => {
  const router = useRouter();
  const presentationTitle = useAppSelector(selectPresentationTitle);
  const presentationId = useAppSelector(selectPresentationId);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const dispatch = useAppDispatch();
  const updateTitleMutation = useUpdatePresentationTitle();
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState("");
  const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
  const [isTextDropdownOpen, setIsTextDropdownOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { handleAddText } = useWidgetCreation();
  const isDarkTheme = globalTheme?.tone === "dark";

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

  const handleTextClick = useCallback(
    (preset: TextPreset) => {
      handleAddText(preset);
      setIsTextDropdownOpen(false);
    },
    [handleAddText]
  );

  return (
    <header
      className={cn(
        "pointer-events-auto overflow-hidden flex items-center px-4 h-11 transition-all duration-300",
        // Rounded corners
        "rounded-2xl",
        // Simple border and shadow - theme-aware
        isDarkTheme
          ? "border border-neutral-800 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
          : "border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]",
        isHovered && isDarkTheme
          ? "shadow-[0_12px_40px_0_rgba(0,0,0,0.5)]"
          : isHovered
          ? "shadow-[0_12px_40px_0_rgba(0,0,0,0.15)]"
          : "",
        isScrolled && "shadow-[0_10px_35px_-25px_rgba(0,0,0,0.8)]"
      )}
      style={{
        // Use darker colors from globals.css - theme-aware
        backgroundColor: isDarkTheme ? "oklch(0.1 0.01 250)" : "oklch(1 0 0)",
        // Simple shadow without 3D effects
        boxShadow: isDarkTheme
          ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
          : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center gap-5">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-colors h-8 w-8 hover:bg-accent/50 rounded-md",
            isDarkTheme
              ? "text-white/80 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => router.push("/dashboard")}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div
          className={cn(
            "h-5 w-px",
            isDarkTheme ? "bg-white/20" : "bg-border/60"
          )}
        />
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
            className={cn(
              "text-sm font-semibold cursor-text tracking-tight focus:outline-none bg-transparent border-none p-0 min-w-0 max-w-[300px]",
              isDarkTheme
                ? "text-white/90 placeholder:text-white/50"
                : "text-foreground/85"
            )}
            placeholder="Untitled Presentation"
          />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 rounded-lg px-3 text-xs font-semibold hover:shadow-sm transition-all duration-200 active:scale-[0.97]",
            isDarkTheme
              ? "text-white/80 hover:text-white hover:bg-white/10"
              : "text-muted-foreground hover:text-foreground hover:bg-background"
          )}
          onClick={onOpenInsertPanel}
        >
          <Plus className="mr-2 h-4 w-4" />
          Insert
        </Button>
        <DropdownMenu
          open={isTextDropdownOpen}
          onOpenChange={setIsTextDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold hover:shadow-sm transition-all duration-200 active:scale-[0.97]",
                isDarkTheme
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              )}
            >
              <Type className="mr-2 h-4 w-4" />
              Text
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="p-0 w-[400px] max-h-[400px]"
            sideOffset={8}
          >
            <div className="w-full h-full">
              <TextWidgetsBrowser
                onTextClick={handleTextClick}
                onTextAdded={() => setIsTextDropdownOpen(false)}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu
          open={isMediaDropdownOpen}
          onOpenChange={setIsMediaDropdownOpen}
        >
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-8 rounded-lg px-3 text-xs font-semibold hover:shadow-sm transition-all duration-200 active:scale-[0.97]",
                isDarkTheme
                  ? "text-white/80 hover:text-white hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-background"
              )}
            >
              <Image className="mr-2 h-4 w-4" />
              Media
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="p-0 w-[600px] max-h-[500px]"
            sideOffset={8}
          >
            <div className="w-full h-full">
              <MediaBrowser
                onImageAdded={() => setIsMediaDropdownOpen(false)}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
