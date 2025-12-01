import React, { useEffect, useRef, useState } from "react";
import Slide from "@/components/editor/slide";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { store } from "@/store";
import {
  selectSlides,
  selectActiveSlideId,
  selectGlobalTheme,
  selectPresentationId,
  setActiveSlide,
  addSlide,
  removeSlide,
  reorderSlides,
  updateSlideId,
  type SlideModel,
  type GlobalTheme,
} from "@/store/slices/slidesSlice";
import { useAddSlide, useDeleteSlide } from "@/hooks/use-presentation";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import { AppleButton } from "@/components/editor/apple-button";
import {
  EditorSidebarShell,
  useEditorSidebar,
} from "@/components/editor/editor-sidebar-shell";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { createPortal } from "react-dom";

// Sortable Slide Item Component
interface SortableSlideItemProps {
  slide: SlideModel;
  isActive: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  showDelete: boolean;
  globalTheme: GlobalTheme;
}

const SortableSlideItem = ({
  slide,
  isActive,
  onClick,
  onRemove,
  showDelete,
  globalTheme,
}: SortableSlideItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });
  console.log(globalTheme, "globalTheme");
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : "auto",
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group outline-none"
    >
      <div
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(
          "relative flex-1 aspect-video rounded-xl overflow-hidden transition-all duration-300 outline-none group/btn cursor-pointer",
          "ring-1 shadow-md bg-background",
          isActive
            ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
            : "ring-border/50 hover:ring-primary/60 hover:shadow-lg hover:scale-[1.01]",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        {/* Delete button */}
        {showDelete && (
          <div
            className={cn(
              "absolute right-2 top-2 z-20 opacity-0 transition-all duration-200 transform translate-y-1 scale-95",
              "group-hover/btn:opacity-100 group-hover/btn:translate-y-0 group-hover/btn:scale-100"
            )}
          >
            <button
              type="button"
              onPointerDown={(e) => e.stopPropagation()} // Prevent drag start
              onClick={onRemove}
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-background/95 backdrop-blur-sm text-muted-foreground shadow-lg ring-1 ring-border/60 hover:bg-destructive hover:text-destructive-foreground hover:ring-destructive transition-all duration-200 active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Slide Content Preview */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <Slide
              slide={slide}
              selectedId={null}
              editingId={null}
              liveOverrides={{}}
              onSelectWidget={() => {}}
              onSetLiveOverride={() => {}}
              onClearLiveOverride={() => {}}
              globalTheme={globalTheme}
              padding={0}
              showSnapLines={false}
            />
          </div>
        </div>

        {/* Active Overlay */}
        {!isActive && (
          <div className="absolute inset-0 bg-background/5 group-hover/btn:bg-transparent transition-colors duration-300" />
        )}
      </div>
    </div>
  );
};

export const LeftSidebar = () => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const presentationId = useAppSelector(selectPresentationId);
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { collapsed } = useEditorSidebar();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const addSlideMutation = useAddSlide();
  const deleteSlideMutation = useDeleteSlide();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Scroll to active slide when it changes
  useEffect(() => {
    if (activeSlideId && scrollContainerRef.current && !activeDragId) {
      const activeElement = scrollContainerRef.current.querySelector(
        `[data-slide-id="${activeSlideId}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeSlideId, activeDragId]);

  const handleSlideClick = (slideId: string) => {
    dispatch(setActiveSlide(slideId));
  };

  const handleRemoveSlide = (slideId: string) => {
    // Don't allow deleting if it's the last slide
    if (slides.length <= 1) {
      return;
    }

    // Delete from Redux first (optimistic update)
    // The Redux slice will handle switching active slide if needed
    dispatch(removeSlide(slideId));

    // Send delete request to API (fire and forget - don't wait for response)
    if (presentationId) {
      deleteSlideMutation.mutate(
        { presentationId, slideId },
        {
          onError: (error) => {
            console.error("Failed to delete slide in API:", error);
            // Optionally: You could revert the Redux deletion here if needed
            // But since user said don't wait, we'll just log the error
          },
        }
      );
    }
  };

  const handleAddSlide = async () => {
    if (!presentationId) {
      console.error("No presentation ID available");
      return;
    }

    // Calculate insert index
    const insertIndex = slides.findIndex((slide) => slide.id === activeSlideId);
    const defaultTitle = `Slide ${slides.length + 1}`;
    const targetIndex = insertIndex >= 0 ? insertIndex + 1 : slides.length;

    // Add to Redux first (creates slide with temporary nanoid ID)
    // The new slide becomes the active slide
    dispatch(addSlide({ title: defaultTitle }));

    // Get the new slide from Redux state (it's now the active slide)
    // Use setTimeout to ensure Redux state has updated
    setTimeout(async () => {
      const currentState = store.getState();
      const newSlideId = currentState.slides.activeSlideId;
      const newSlide = currentState.slides.slides.find(
        (slide) => slide.id === newSlideId
      );

      if (!newSlide) {
        console.error("Failed to find newly created slide");
        return;
      }

      // Create slide in API immediately
      try {
        const response = await addSlideMutation.mutateAsync({
          presentationId,
          payload: {
            data: {
              id: newSlide.id,
              title: newSlide.title,
              widgets: newSlide.widgets,
              backgroundColor: newSlide.backgroundColor,
              backgroundImage: newSlide.backgroundImage,
              showSlideNumber: newSlide.showSlideNumber,
              slideStyle: newSlide.slideStyle,
            },
            order: targetIndex,
          },
        });

        if (response.success && response.data) {
          // Update the slide ID in Redux with the database ID
          dispatch(
            updateSlideId({
              oldId: newSlide.id,
              newId: response.data.id,
            })
          );
        }
      } catch (error) {
        console.error("Failed to create slide in API:", error);
        // Optionally remove the slide from Redux if API call fails
        // dispatch(removeSlide(newSlide.id));
      }
    }, 0);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      dispatch(
        reorderSlides({
          activeId: active.id as string,
          overId: over.id as string,
        })
      );
    }

    setActiveDragId(null);
  };

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: "0.5",
        },
      },
    }),
  };

  const activeDragSlide = activeDragId
    ? slides.find((s) => s.id === activeDragId)
    : null;

  return (
    <EditorSidebarShell>
      <div
        className={cn(
          "border-b border-border/50 p-4 pb-3 transition-all duration-200",
          collapsed && "px-2"
        )}
      >
        <AppleButton
          onClick={handleAddSlide}
          variant="primary"
          size={collapsed ? "default" : "lg"}
          className={cn("w-full justify-center", collapsed && "w-10 h-10 p-0")}
        >
          <Plus className="w-4 h-4" />
          {!collapsed && (
            <span className="font-semibold tracking-tight whitespace-nowrap">
              New Slide
            </span>
          )}
        </AppleButton>
      </div>

      <div
        ref={scrollContainerRef}
        className={cn(
          "slides-scroll-container flex-1 overflow-y-auto py-3 px-4 space-y-3 transition-all duration-200",
          collapsed && "px-2"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style jsx>{`
          .slides-scroll-container::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={slides.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {slides.map((slide) => (
                <div key={slide.id} data-slide-id={slide.id}>
                  <SortableSlideItem
                    slide={slide}
                    isActive={slide.id === activeSlideId}
                    onClick={() => handleSlideClick(slide.id)}
                    onRemove={(e) => {
                      e.stopPropagation();
                      handleRemoveSlide(slide.id);
                    }}
                    showDelete={slides.length > 1}
                    globalTheme={globalTheme}
                  />
                </div>
              ))}
            </div>
          </SortableContext>

          {createPortal(
            <DragOverlay dropAnimation={dropAnimation}>
              {activeDragSlide ? (
                <div className="w-[220px] opacity-90 cursor-grabbing">
                  <div
                    className={cn(
                      "relative flex-1 aspect-video rounded-xl overflow-hidden shadow-2xl ring-2 ring-primary scale-105 bg-background"
                    )}
                  >
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-full flex items-center justify-center overflow-hidden">
                        <Slide
                          slide={activeDragSlide}
                          selectedId={null}
                          editingId={null}
                          liveOverrides={{}}
                          onSelectWidget={() => {}}
                          onSetLiveOverride={() => {}}
                          onClearLiveOverride={() => {}}
                          globalTheme={globalTheme}
                          padding={0}
                          showSnapLines={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </div>
    </EditorSidebarShell>
  );
};
