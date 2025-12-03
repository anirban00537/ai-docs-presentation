"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AppleButton } from "@/components/editor/apple-button";
import { Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";

type EditorToolbarActionsProps = {
  onStartPresentation: () => void;
};

export const EditorToolbarActions: React.FC<EditorToolbarActionsProps> = ({
  onStartPresentation,
}) => {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <div
      className={cn(
        "pointer-events-auto overflow-hidden flex items-center px-4 h-11 transition-all duration-300 rounded-2xl",
        // Simple border and shadow - theme-aware
        isDarkTheme
          ? "border border-neutral-800 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
          : "border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
      )}
      style={{
        // Use darker colors from globals.css - theme-aware
        backgroundColor: isDarkTheme ? "oklch(0.1 0.01 250)" : "oklch(1 0 0)",
        // Simple shadow without 3D effects
        boxShadow: isDarkTheme
          ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
          : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 rounded-lg px-3 text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
            isDarkTheme
              ? "text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
              : "text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border/60"
          )}
          onClick={onStartPresentation}
        >
          <Play className="mr-2 h-4 w-4 fill-current" />
          Play
        </Button>
        <AppleButton
          variant="primary"
          size="sm"
          className="text-xs font-semibold px-3"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Share
        </AppleButton>
      </div>
    </div>
  );
};
