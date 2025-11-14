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
        "border-r border-border/50 bg-gradient-to-b from-background to-muted/20",
        className
      )}
    >
      <SidebarContent className="p-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Slides
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 px-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "group relative cursor-pointer rounded-xl border-2 transition-all duration-200 ease-out",
                    "hover:scale-[1.02]",
                    slide.id === activeSlideId
                      ? "border-primary ring-2 ring-primary/10"
                      : "border-border/50 hover:border-primary/50"
                  )}
                  onClick={() => handleSelectSlide(slide.id)}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gradient-to-br from-muted/50 to-muted/30 pointer-events-none">
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
                      <div className="absolute inset-0 bg-primary/5 ring-2 ring-primary/20 rounded-lg" />
                    )}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-3 py-2 rounded-b-lg">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-semibold drop-shadow-sm">
                        {`Slide ${index + 1}`}
                      </span>
                      {slide.title && (
                        <span className="text-xs opacity-90 truncate ml-2 font-medium">
                          {slide.title}
                        </span>
                      )}
                    </div>
                  </div>
                  {slide.id === activeSlideId && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
                  )}
                </div>
              ))}
            </div>
          </SidebarGroupContent>
          <div className="px-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSlide}
              className="w-full justify-center gap-2 h-10 font-medium border-dashed hover:border-primary hover:bg-primary/5 hover:text-primary transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Add slide
            </Button>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
