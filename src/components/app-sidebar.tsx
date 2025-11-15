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
        "border-r border-border/50 bg-gradient-to-b from-background via-background to-muted/30",
        className
      )}
    >
      <SidebarContent className="p-4">
        <SidebarGroup>
          <div className="flex items-center justify-between mb-4 px-1">
            <SidebarGroupLabel className="text-xs font-bold uppercase tracking-widest text-foreground/80 px-0">
              Slides
            </SidebarGroupLabel>
            <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
              {slides.length}
            </span>
          </div>
          
          {/* Add slide button at the top */}
          <div className="px-1 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSlide}
              className="w-full justify-center gap-2 h-11 font-semibold border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-xl bg-gradient-to-br from-primary/5 to-primary/0"
            >
              <Plus className="h-4 w-4" />
              Add slide
            </Button>
          </div>

          <SidebarGroupContent>
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <div key={slide.id} className="space-y-1">
                  <div
                    className={cn(
                      "group relative cursor-pointer rounded-lg border-2 transition-all duration-200 ease-out overflow-hidden",
                      "hover:scale-[1.01] hover:shadow-md",
                      slide.id === activeSlideId
                        ? "border-primary/60 ring-2 ring-primary/20 bg-primary/5 shadow-sm"
                        : "border-border/40 hover:border-primary/30 hover:bg-accent/20"
                    )}
                    onClick={() => handleSelectSlide(slide.id)}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted/60 via-muted/40 to-muted/30 pointer-events-none">
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
                      {slide.id === activeSlideId && (
                        <div className="absolute inset-0 bg-primary/10 ring-1 ring-primary/30 rounded-lg" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg" />
                    </div>
                    
                    {/* Slide number badge */}
                    <div className={cn(
                      "absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold transition-all duration-200",
                      slide.id === activeSlideId
                        ? "bg-primary text-primary-foreground"
                        : "bg-background/90 text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground"
                    )}>
                      {index + 1}
                    </div>
                  </div>

                  {/* Slide name below the box */}
                  <div className="ml-1">
                    <span className={cn(
                      "text-[10px] font-medium block text-left",
                      slide.id === activeSlideId
                        ? "text-primary"
                        : "text-foreground/70"
                    )}>
                      {slide.title || `Slide ${index + 1}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
