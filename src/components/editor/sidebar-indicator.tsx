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

  // New Design: "Timeline / Ruler"
  // A continuous vertical line with ticks for each slide.
  // The active slide is a distinct node on the timeline.
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-full w-full relative",
        className
      )}
    >
      {/* Continuous vertical track - visible on all backgrounds */}
      <div 
        className={cn(
          "absolute left-1/2 top-8 bottom-8 w-[2px] -translate-x-1/2 rounded-full",
          isDark ? "bg-white/10" : "bg-black/10"
        )} 
      />

      <div className="flex flex-col gap-3 items-center z-10">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId;
          return (
            <div
              key={slide.id}
              className="relative flex items-center justify-center w-4 h-4"
            >
              <div
                className={cn(
                  "transition-all duration-300 ease-out rounded-full",
                  isActive 
                    ? "w-3 h-3 shadow-lg ring-2 ring-offset-2 ring-offset-transparent" 
                    : "w-1.5 h-1.5 hover:scale-150"
                )}
                style={{
                  backgroundColor: isActive ? accentColor : (isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"),
                  boxShadow: isActive ? `0 0 12px ${accentColor}` : undefined,
                  borderColor: isActive ? accentColor : undefined,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
