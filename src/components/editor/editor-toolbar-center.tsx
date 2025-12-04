"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Image, Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MediaBrowser } from "@/components/editor/media-browser";
import { TextWidgetsBrowser } from "@/components/editor/text-widgets-browser";
import { InsertPanelContent } from "@/components/editor/right-sidebar/insert-panel-content";
import { useWidgetCreation } from "@/hooks/use-widget-creation";
import type { TextPreset } from "@/components/editor/types";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";

type EditorToolbarCenterProps = Record<string, never>;

export const EditorToolbarCenter: React.FC<EditorToolbarCenterProps> = () => {
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";
  const [isInsertDropdownOpen, setIsInsertDropdownOpen] = useState(false);
  const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
  const [isTextDropdownOpen, setIsTextDropdownOpen] = useState(false);
  const { handleAddText } = useWidgetCreation();
  const {
    handleAddFeatureCard,
    handleAddIconCard,
    handleAddImageCard,
    handleAddLabelCard,
    handleAddListCard,
    handleAddQuote,
    handleAddComparisonCard,
    handleAddTitleCard,
    handleAddPricingCard,
  } = useWidgetCreation();

  const handleTextClick = useCallback(
    (preset: TextPreset) => {
      handleAddText(preset);
      setIsTextDropdownOpen(false);
    },
    [handleAddText]
  );

  return (
    <div
      className={cn(
        "pointer-events-auto overflow-hidden flex items-center justify-center px-4 h-11 transition-all duration-300 rounded-2xl",
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
      <div className="flex items-center gap-2">
        <DropdownMenu
          open={isInsertDropdownOpen}
          onOpenChange={setIsInsertDropdownOpen}
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
              <Plus className="mr-2 h-4 w-4" />
              Insert
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className={cn(
              "p-0 w-[320px] max-h-[500px] border-0 shadow-none custom-scrollbar",
              isDarkTheme
                ? "bg-black custom-scrollbar-dark"
                : "bg-white custom-scrollbar-light"
            )}
            sideOffset={8}
          >
            <div className="w-full h-full">
              <InsertPanelContent
                onAddFeatureCard={handleAddFeatureCard}
                onAddIconCard={handleAddIconCard}
                onAddImageCard={handleAddImageCard}
                onAddLabelCard={handleAddLabelCard}
                onAddListCard={handleAddListCard}
                onAddQuote={handleAddQuote}
                onAddComparisonCard={handleAddComparisonCard}
                onAddTitleCard={handleAddTitleCard}
                onAddPricingCard={handleAddPricingCard}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
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
            className={cn(
              "p-0 w-[400px] max-h-[400px] border-0 shadow-none custom-scrollbar",
              isDarkTheme
                ? "bg-black custom-scrollbar-dark"
                : "bg-white custom-scrollbar-light"
            )}
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
            className={cn(
              "p-0 w-[600px] max-h-[500px] border-0 shadow-none custom-scrollbar",
              isDarkTheme
                ? "bg-black custom-scrollbar-dark"
                : "bg-white custom-scrollbar-light"
            )}
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
    </div>
  );
};
