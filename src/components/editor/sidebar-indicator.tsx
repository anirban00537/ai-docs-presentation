import React from "react";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/hooks";
import { selectSlides, selectActiveSlideId } from "@/store/slices/slidesSlice";

interface SidebarIndicatorProps {
  className?: string;
}

export const SidebarIndicator: React.FC<SidebarIndicatorProps> = ({
  className,
}) => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);

  // We'll show a max of say 10 lines to keep it clean, or maybe all of them if they fit?
  // Let's try showing all for now, but maybe scale them down if there are too many.
  // The user image shows about 6 lines.
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 py-4 h-full w-full",
        className
      )}
    >
      {slides.map((slide) => {
        const isActive = slide.id === activeSlideId;
        return (
          <div
            key={slide.id}
            className={cn(
              "w-4 rounded-full transition-all duration-300",
              isActive 
                ? "h-0.5 bg-white w-8 shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                : "h-0.5 bg-white/20 w-4"
            )}
          />
        );
      })}
    </div>
  );
};
