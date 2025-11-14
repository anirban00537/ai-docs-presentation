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
            <div className="space-y-3 px-1">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "group relative cursor-pointer rounded-2xl border-2 transition-all duration-300 ease-out overflow-hidden",
                    "hover:scale-[1.02] hover:-translate-y-0.5",
                    slide.id === activeSlideId
                      ? "border-primary/60 ring-2 ring-primary/20 bg-primary/5"
                      : "border-border/60 hover:border-primary/40 hover:bg-accent/30"
                  )}
                  onClick={() => handleSelectSlide(slide.id)}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-gradient-to-br from-muted/60 via-muted/40 to-muted/30 pointer-events-none">
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
                      <div className="absolute inset-0 bg-primary/10 ring-1 ring-primary/30 rounded-xl" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  
                  {/* Slide number badge */}
                  <div className={cn(
                    "absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold transition-all duration-200",
                    slide.id === activeSlideId
                      ? "bg-primary text-primary-foreground"
                      : "bg-background/90 text-foreground/80 group-hover:bg-primary group-hover:text-primary-foreground"
                  )}>
                    {index + 1}
                  </div>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 rounded-b-2xl">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs font-bold",
                        slide.id === activeSlideId
                          ? "text-primary"
                          : "text-foreground/70"
                      )}>
                        {slide.title || `Slide ${index + 1}`}
                      </span>
                      {slide.id === activeSlideId && (
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Active indicator */}
                  {slide.id === activeSlideId && (
                    <>
                      <div className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary ring-2 ring-background" />
                      <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary/50 animate-ping" />
                    </>
                  )}
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
