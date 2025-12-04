"use client";

import React from "react";
import { Heading1, Heading2, Pilcrow } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TextPreset } from "@/components/editor/types";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";

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
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  const handleTextClick = (preset: TextPreset) => {
    if (onTextClick) {
      onTextClick(preset);
      onTextAdded?.();
    }
  };

  return (
    <div
      className={cn(
        "w-full h-full flex flex-col overflow-hidden min-h-0 border p-4",
        isDarkTheme ? "bg-black border-white/10" : "bg-white border-border/40"
      )}
    >
      <div className="mb-4">
        <h3
          className={cn(
            "text-sm font-semibold mb-1",
            isDarkTheme ? "text-white/90" : "text-foreground/90"
          )}
        >
          Typography
        </h3>
        <p
          className={cn(
            "text-xs",
            isDarkTheme ? "text-white/60" : "text-muted-foreground/70"
          )}
        >
          Choose a text widget to add to your slide
        </p>
      </div>

      <div
        className={cn(
          "grid grid-cols-1 gap-3 flex-1 overflow-y-auto custom-scrollbar",
          isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
        )}
      >
        {textOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleTextClick(option.preset)}
            className={cn(
              "group flex items-center gap-4 rounded-xl border p-4",
              "transition-all duration-300 ease-out",
              "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
              "active:scale-[0.98] transform",
              isDarkTheme
                ? "border-white/10 bg-black/50 hover:bg-black/70"
                : "border-border/40 bg-background/60 hover:bg-accent/80"
            )}
          >
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground transition-all duration-300 group-hover:bg-primary/10 group-hover:text-primary group-hover:scale-110",
                isDarkTheme ? "bg-black/60" : "bg-muted/80"
              )}
            >
              {option.icon}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div
                className={cn(
                  "text-sm font-semibold group-hover:text-primary transition-colors duration-300",
                  isDarkTheme ? "text-white/90" : "text-foreground"
                )}
              >
                {option.title}
              </div>
              <div
                className={cn(
                  "text-xs mt-0.5",
                  isDarkTheme ? "text-white/60" : "text-muted-foreground/80"
                )}
              >
                {option.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
