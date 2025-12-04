import React, { useEffect, useRef, useState } from "react";
import { SidebarIndicator } from "@/components/editor/sidebar-indicator";
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
import { Plus, Trash2, X, List, Grid3x3 } from "lucide-react";
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

// List Mode Slide Item Component
interface SortableListItemProps {
  slide: SlideModel;
  isActive: boolean;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  showDelete: boolean;
  index: number;
  globalTheme: GlobalTheme;
}

const SortableListItem = ({
  slide,
  isActive,
  onClick,
  onRemove,
  showDelete,
  index,
  globalTheme,
}: SortableListItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });
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
          "relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 outline-none group/btn cursor-pointer",
          "ring-1",
          isActive
            ? "ring-2 ring-primary bg-primary/10 shadow-sm"
            : globalTheme?.tone === "dark"
            ? "ring-white/10 hover:ring-primary/60 hover:bg-white/5"
            : "ring-border/50 hover:ring-primary/60 hover:bg-accent/50",
          "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        )}
      >
        {/* Slide Number */}
        <div
          className={cn(
            "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
          )}
        >
          {index + 1}
        </div>

        {/* Slide Name */}
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              isActive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {slide.title || `Slide ${index + 1}`}
          </p>
        </div>

        {/* Delete button */}
        {showDelete && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onRemove}
            className={cn(
              "h-6 w-6 flex items-center justify-center rounded-md opacity-0 transition-all duration-200",
              "text-muted-foreground hover:bg-destructive hover:text-destructive-foreground",
              "group-hover/btn:opacity-100 active:scale-95"
            )}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Sortable Slide Item Component (Preview Mode)
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
          "relative flex-1 aspect-video rounded-md overflow-hidden transition-all duration-300 outline-none group/btn cursor-pointer",
          "ring-1 shadow-md",
          isActive
            ? "ring-2 ring-primary shadow-lg shadow-primary/20 scale-[1.02]"
            : globalTheme?.tone === "dark"
            ? "ring-white/10 hover:ring-primary/60 hover:shadow-lg hover:scale-[1.01]"
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
          <div
            className={cn(
              "absolute inset-0 group-hover/btn:bg-transparent transition-colors duration-300",
              globalTheme?.tone === "dark"
                ? "bg-transparent"
                : "bg-background/5"
            )}
          />
        )}
      </div>
    </div>
  );
};

type ViewMode = "preview" | "list";

export const LeftSidebar = () => {
  const slides = useAppSelector(selectSlides);
  const activeSlideId = useAppSelector(selectActiveSlideId);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const presentationId = useAppSelector(selectPresentationId);
  const dispatch = useAppDispatch();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { collapsed, toggle } = useEditorSidebar();
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("preview");
  const [justClosed, setJustClosed] = useState(false);
  const addSlideMutation = useAddSlide();
  const deleteSlideMutation = useDeleteSlide();

  // Show full sidebar if not collapsed
  const showFullSidebar = !collapsed;

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

    // Dispatch custom event for the editor to handle scrolling
    const event = new CustomEvent("request-slide-scroll", {
      detail: { slideId },
    });
    window.dispatchEvent(event);
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

  const isDarkTheme = globalTheme?.tone === "dark";

  const handleMouseEnter = () => {
    // If collapsed and not just closed, expand permanently on hover
    if (collapsed && !justClosed) {
      toggle();
    }
  };

  const handleClose = () => {
    setJustClosed(true);
    toggle();
    // Reset the flag after a short delay to allow hover to work again
    setTimeout(() => {
      setJustClosed(false);
    }, 300);
  };

  return (
    <EditorSidebarShell
      globalTheme={globalTheme}
      collapsed={collapsed}
      onMouseEnter={handleMouseEnter}
    >
      {showFullSidebar ? (
        <>
          {/* Header with Mode Toggle Tabs and Close button */}
          <div
            className={cn(
              "border-b p-2.5 transition-all duration-200",
              isDarkTheme ? "border-white/10" : "border-white/20"
            )}
          >
            <div className="flex items-center justify-between gap-2">
              {/* Mode Toggle Tabs */}
              <div
                className={cn(
                  "flex gap-0.5 p-0.5 rounded-lg",
                  isDarkTheme ? "bg-white/5" : "bg-muted/50"
                )}
              >
                <button
                  type="button"
                  onClick={() => setViewMode("preview")}
                  className={cn(
                    "flex items-center justify-center p-1.5 rounded-md transition-all duration-200",
                    viewMode === "preview"
                      ? cn(
                          "text-primary shadow-sm ring-1",
                          isDarkTheme
                            ? "bg-white/10 ring-primary/40"
                            : "bg-background ring-primary/20"
                        )
                      : cn(
                          "text-muted-foreground",
                          isDarkTheme
                            ? "hover:bg-white/5 hover:text-foreground"
                            : "hover:bg-accent/50 hover:text-foreground"
                        )
                  )}
                >
                  <Grid3x3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "flex items-center justify-center p-1.5 rounded-md transition-all duration-200",
                    viewMode === "list"
                      ? cn(
                          "text-primary shadow-sm ring-1",
                          isDarkTheme
                            ? "bg-white/10 ring-primary/40"
                            : "bg-background ring-primary/20"
                        )
                      : cn(
                          "text-muted-foreground",
                          isDarkTheme
                            ? "hover:bg-white/5 hover:text-foreground"
                            : "hover:bg-accent/50 hover:text-foreground"
                        )
                  )}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              {/* Close button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                }}
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-md transition-all duration-200",
                  "text-muted-foreground shadow-sm ring-1",
                  isDarkTheme
                    ? "bg-white/10 backdrop-blur-sm ring-white/10 hover:bg-destructive hover:text-destructive-foreground hover:ring-destructive"
                    : "bg-background/95 backdrop-blur-sm ring-border/60 hover:bg-destructive hover:text-destructive-foreground hover:ring-destructive",
                  "active:scale-95"
                )}
                aria-label="Collapse sidebar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* New Slide button */}
          <div
            className={cn(
              "border-b p-4 pb-3 transition-all duration-200",
              isDarkTheme ? "border-white/10" : "border-white/20"
            )}
          >
            <AppleButton
              onClick={handleAddSlide}
              variant="primary"
              size="lg"
              className="w-full justify-center"
            >
              <Plus className="w-4 h-4" />
              <span className="font-semibold tracking-tight whitespace-nowrap">
                New Slide
              </span>
            </AppleButton>
          </div>

          <div
            ref={scrollContainerRef}
            className={cn(
              "slides-scroll-container flex-1 overflow-y-auto py-3 px-4 space-y-3 transition-all duration-200"
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
                {viewMode === "preview" ? (
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
                ) : (
                  <div className="space-y-1.5">
                    {slides.map((slide, index) => (
                      <div key={slide.id} data-slide-id={slide.id}>
                        <SortableListItem
                          slide={slide}
                          isActive={slide.id === activeSlideId}
                          onClick={() => handleSlideClick(slide.id)}
                          onRemove={(e) => {
                            e.stopPropagation();
                            handleRemoveSlide(slide.id);
                          }}
                          showDelete={slides.length > 1}
                          index={index}
                          globalTheme={globalTheme}
                        />
                      </div>
                    ))}
                  </div>
                )}
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
        </>
      ) : (
        <SidebarIndicator />
      )}
    </EditorSidebarShell>
  );
};
