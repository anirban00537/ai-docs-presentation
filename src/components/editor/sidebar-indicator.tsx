import React from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectSlides, selectActiveSlideId, selectGlobalTheme } from "@/store/slices/slidesSlice";

interface SidebarIndicatorProps {
  className?: string;
}

export const SidebarIndicator: React.FC<SidebarIndicatorProps> = ({
  className,
}) => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const accentColor = globalTheme?.accent || "#3b82f6"; // Default to blue-500 if undefined
  const isDark = globalTheme?.tone === "dark";

  // New Design: "Sleek Wide Bars"
  // Wider, shorter rectangles for a more modern, minimal look.
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full w-full",
        className
      )}
    >
      <div className="flex flex-col gap-1.5 items-center w-full px-1">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          return (
            <div
              key={slide.id}
              className="relative flex items-center justify-center w-full"
            >
              <div
                className={cn(
                  "transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) rounded-[1px]",
                  isActive 
                    ? "w-8 h-[4px] shadow-sm" // Active: Wide, thin bar
                    : "w-4 h-[2px] bg-muted-foreground/30 hover:bg-muted-foreground/50 hover:w-6 hover:h-[3px]" // Inactive: Shorter, thinner bar
                )}
                style={{
                  backgroundColor: isActive ? accentColor : undefined,
                  boxShadow: isActive ? `0 0 10px ${accentColor}80` : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
