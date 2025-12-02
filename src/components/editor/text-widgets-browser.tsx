"use client";

import React from "react";
import { Heading1, Heading2, Pilcrow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextPreset } from "@/components/editor/types";

type TextWidgetsBrowserProps = {
  onTextAdded?: () => void;
  onTextClick?: (preset: TextPreset) => void;
};

const textOptions: Array<{
  id: TextPreset["id"];
  title: string;
  description: string;
  icon: React.ReactNode;
  preset: TextPreset;
}> = [
  {
    id: "heading",
    title: "Heading",
    description: "Large heading text",
    icon: <Heading1 className="h-5 w-5" />,
    preset: { id: "heading", title: "Heading" },
  },
  {
    id: "subheading",
    title: "Subhead",
    description: "Medium subheading text",
    icon: <Heading2 className="h-5 w-5" />,
    preset: { id: "subheading", title: "Subheading" },
  },
  {
    id: "body",
    title: "Body",
    description: "Regular body text",
    icon: <Pilcrow className="h-5 w-5" />,
    preset: { id: "body", title: "Body Text" },
  },
];

export const TextWidgetsBrowser: React.FC<TextWidgetsBrowserProps> = ({
  onTextAdded,
  onTextClick,
}) => {
  const handleTextClick = (preset: TextPreset) => {
    if (onTextClick) {
      onTextClick(preset);
      onTextAdded?.();
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-background/95 backdrop-blur-xl rounded-lg overflow-hidden min-h-0 shadow-lg border border-border/40 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground/90 mb-1">
          Typography
        </h3>
        <p className="text-xs text-muted-foreground/70">
          Choose a text widget to add to your slide
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30 transition-colors duration-300">
        {textOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleTextClick(option.preset)}
            className={cn(
              "group flex items-center gap-4 rounded-xl border border-border/40 bg-background/60 dark:bg-background/40 p-4",
              "transition-all duration-300 ease-out",
              "hover:border-primary/50 hover:bg-accent/80 hover:shadow-lg hover:shadow-primary/10",
              "active:scale-[0.98] transform"
            )}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/80 dark:bg-muted/60 text-muted-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110">
              {option.icon}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                {option.title}
              </div>
              <div className="text-xs text-muted-foreground/80 mt-0.5">
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

