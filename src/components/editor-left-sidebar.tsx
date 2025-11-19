import * as React from "react";
import { Plus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addSlide,
  selectActiveSlideId,
  selectSlides,
  setActiveSlide,
} from "@/store/slices/slidesSlice";
import Slide from "@/components/editor/slide";

export function AppSidebar({
  className,
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const dispatch = useAppDispatch();

  const handleSelectSlide = React.useCallback(
    (slideId: string) => {
      if (slideId !== activeSlideId) {
        dispatch(setActiveSlide(slideId));
      }
    },
    [activeSlideId, dispatch]
  );

  const handleAddSlide = React.useCallback(() => {
    dispatch(addSlide());
  }, [dispatch]);

  return (
    <Sidebar
      {...props}
      className={cn(
        "border-r border-border/50 bg-gradient-to-b from-background via-background to-muted/10",
        className
      )}
    >
      <SidebarContent className="p-0">
        <div className="p-4 border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddSlide}
            className="w-full justify-center gap-2 h-10 font-medium border-dashed border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all duration-300 rounded-lg group"
          >
            <div className="w-5 h-5 rounded-md bg-muted group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Plus className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs">New Slide</span>
          </Button>
        </div>

        <div className="p-3 space-y-3">
          {slides.map((slide, index) => (
            <div key={slide.id} className="group/slide relative">
              <div
                className={cn(
                  "relative cursor-pointer rounded-xl border transition-all duration-300 ease-out overflow-hidden",
                  slide.id === activeSlideId
                    ? "border-primary ring-1 ring-primary/20 shadow-md shadow-primary/10 scale-[1.02]"
                    : "border-border/40 hover:border-primary/30 hover:shadow-sm hover:scale-[1.01] bg-card/50"
                )}
                onClick={() => handleSelectSlide(slide.id)}
              >
                <div className="relative aspect-video w-full bg-muted/30 pointer-events-none">
                  <div className="absolute inset-0 flex items-center justify-center opacity-50">
                     {/* Placeholder for slide preview if needed, or keep the actual slide component */}
                  </div>
                  <Slide
                    slide={slide}
                    selectedId={null}
                    editingId={null}
                    liveOverrides={{}}
                    onSelectElement={() => {}}
                    onSetLiveOverride={() => {}}
                    onClearLiveOverride={() => {}}
                    scale={0.15}
                  />
                  
                  {/* Active overlay */}
                  {slide.id === activeSlideId && (
                    <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
                  )}
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover/slide:bg-black/5 transition-colors duration-300 pointer-events-none" />
                </div>
              </div>

              {/* Slide Info */}
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className={cn(
                  "text-[11px] font-medium truncate max-w-[120px] transition-colors",
                  slide.id === activeSlideId
                    ? "text-primary"
                    : "text-muted-foreground group-hover/slide:text-foreground"
                )}>
                  {slide.title || `Slide ${index + 1}`}
                </span>
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-colors",
                  slide.id === activeSlideId
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground group-hover/slide:bg-muted/80"
                )}>
                  {index + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
