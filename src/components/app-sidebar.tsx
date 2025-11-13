import * as React from "react";
import { Plus } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
            <SidebarMenu>
              {slides.map((slide, index) => (
                <SidebarMenuItem key={slide.id}>
                  <SidebarMenuButton
                    isActive={slide.id === activeSlideId}
                    onClick={() => handleSelectSlide(slide.id)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="font-medium">{`Slide ${index + 1}`}</span>
                    {slide.title ? (
                      <span className="text-xs text-muted-foreground">
                        {slide.title}
                      </span>
                    ) : null}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
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
