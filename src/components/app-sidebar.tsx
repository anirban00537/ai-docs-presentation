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
      className={cn("border-none shadow-none bg-white", className)}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Slides</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-2 px-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={cn(
                    "relative cursor-pointer rounded-lg border-2 transition-all",
                    slide.id === activeSlideId
                      ? "border-primary shadow-md"
                      : "border-transparent hover:border-border hover:shadow-sm"
                  )}
                  onClick={() => handleSelectSlide(slide.id)}
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-md bg-white pointer-events-none">
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
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 rounded-b-md">
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-medium">{`Slide ${
                        index + 1
                      }`}</span>
                      {slide.title && (
                        <span className="text-xs opacity-90 truncate ml-2">
                          {slide.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
          <div className="px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddSlide}
              className="mt-2 w-full justify-start gap-2"
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
