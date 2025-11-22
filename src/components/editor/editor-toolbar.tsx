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

export type TextPreset = {
  id: string;
  title: string;
};

export type ShapeCategory = "essential" | "outlined" | "lines";

export type ShapePreset = {
  id: string;
  title: string;
  category: ShapeCategory;
  preview: React.ReactNode;
};

export type FeatureCardPreset = {
  id: string;
  title: string;
  description: string;
};

type EditorHeaderProps = {
  onAddText: (preset: TextPreset) => void;
  onAddShape?: (preset: ShapePreset) => void;
  onAddFeatureCard?: (preset: FeatureCardPreset) => void;
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
    <header className="pointer-events-auto w-full bg-background/95 border-b border-border/40 flex items-center justify-center gap-1 px-4 py-2 z-50">
      <div className="absolute left-4 flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="text-sm font-semibold text-foreground">
          Presentation Title
        </h1>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-md px-3 text-xs font-medium transition-colors hover:bg-primary/10 hover:text-primary"
        onClick={onOpenInsertPanel}
      >
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Insert
      </Button>

      <div className="h-4 w-px bg-border/40 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-50"
        disabled={!activeSlide}
        onClick={onOpenBackgroundPanel}
      >
        <Palette className="mr-1.5 h-3.5 w-3.5" />
        Background
      </Button>

      <div className="h-4 w-px bg-border/40 mx-1" />

      <Button
        variant="ghost"
        size="sm"
        className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary disabled:opacity-50"
        disabled={!activeSlide}
        onClick={onOpenThemePanel}
      >
        <LayoutTemplate className="mr-1.5 h-3.5 w-3.5" />
        Theme
      </Button>

      <div className="absolute right-4 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-md px-3 text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80"
        >
          <Play className="mr-1.5 h-3.5 w-3.5" />
          Play
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-8 rounded-md px-3 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Share
        </Button>
      </div>
    </header>
  );
};
