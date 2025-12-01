"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, Trash2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { loadPresentation } from "@/store/slices/slidesSlice";
import {
  useCreatePresentation,
  usePresentationsList,
  useDeletePresentation,
} from "@/hooks/use-presentation";
import type { SlideModel, GlobalTheme } from "@/store/slices/slidesSlice";
import type { SlideWidget } from "@/components/editor/widgets/types";
import type { PresentationSlide } from "@/services/presentation";
import { SLIDE_THEMES } from "@/lib/slide-themes";
import Slide from "@/components/editor/slide";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createPresentationMutation = useCreatePresentation();
  const deletePresentationMutation = useDeletePresentation();
  const { data: presentationsResponse, isLoading } = usePresentationsList();

  const handleCreatePresentation = async () => {
    const defaultTheme = SLIDE_THEMES[0];

    // Create presentation with default theme using TanStack Query mutation
    createPresentationMutation.mutate(
      {
        title: "Untitled Presentation",
        globalTheme: {
          id: defaultTheme.id,
          background: defaultTheme.background,
          surface: defaultTheme.surface,
          text: defaultTheme.text,
          accent: defaultTheme.accent,
          font: defaultTheme.font,
          cardBackgroundType: defaultTheme.cardBackgroundType,
          tone: defaultTheme.tone,
        },
      },
      {
        onSuccess: (response) => {
          if (response.success && response.data) {
            const presentation = response.data;
            const presentationId = presentation.id;

            // Load presentation data into Redux (no initial slide)
            const slides: SlideModel[] = [];
            if (presentation.slides && Array.isArray(presentation.slides)) {
              // Sort by order field
              const sortedSlides = [...presentation.slides].sort(
                (a: PresentationSlide, b: PresentationSlide) =>
                  (a.order ?? 0) - (b.order ?? 0)
              );

              sortedSlides.forEach((slide: PresentationSlide) => {
                const slideData = slide.data || {};
                slides.push({
                  id: slide.id, // Use database slide ID
                  title: slideData.title || `Slide ${slides.length + 1}`,
                  widgets: (slideData.widgets || []) as SlideWidget[],
                  backgroundColor: slideData.backgroundColor,
                  backgroundImage: slideData.backgroundImage,
                  showSlideNumber: slideData.showSlideNumber ?? false,
                  slideStyle: slideData.slideStyle,
                });
              });
            }

            const globalTheme: GlobalTheme = presentation.globalTheme || {
              id: defaultTheme.id,
              background: defaultTheme.background,
              surface: defaultTheme.surface,
              text: defaultTheme.text,
              accent: defaultTheme.accent,
              font: defaultTheme.font,
              cardBackgroundType: defaultTheme.cardBackgroundType,
              tone: defaultTheme.tone,
            };

            dispatch(
              loadPresentation({
                presentationId,
                presentationTitle: presentation.title || "Untitled Presentation",
                slides,
                globalTheme,
              })
            );

            // Navigate to editor with presentationId
            router.push(`/editor?presentationId=${presentationId}`);
          }
        },
        onError: (error) => {
          console.error("Failed to create presentation:", error);
        },
      }
    );
  };

  const handleOpenPresentation = (presentationId: string) => {
    router.push(`/editor?presentationId=${presentationId}`);
  };

  const handleDeletePresentation = (
    presentationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    deletePresentationMutation.mutate(presentationId);
  };

  const presentations = presentationsResponse?.success
    ? presentationsResponse.data?.list || []
    : [];

  return (
    <div className="flex h-full w-full flex-col p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Presentations</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your presentations
          </p>
        </div>
        <Button
          onClick={handleCreatePresentation}
          disabled={createPresentationMutation.isPending}
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          {createPresentationMutation.isPending
            ? "Creating..."
            : "New Presentation"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="text-muted-foreground">Loading presentations...</div>
        </div>
      ) : presentations.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="text-2xl font-semibold">No presentations yet</h2>
            <p className="text-muted-foreground">
              Create your first presentation to get started
            </p>
            <Button
              onClick={handleCreatePresentation}
              disabled={createPresentationMutation.isPending}
              size="lg"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create New Presentation
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {presentations.map((presentation) => {
            const firstSlide = presentation.slides?.[0];
            const slideData = firstSlide?.data || {};
            const slideModel: SlideModel = {
              id: firstSlide?.id || "",
              title: slideData.title || presentation.title,
              widgets: (slideData.widgets || []) as SlideWidget[],
              backgroundColor: slideData.backgroundColor,
              backgroundImage: slideData.backgroundImage,
              showSlideNumber: slideData.showSlideNumber ?? false,
              slideStyle: slideData.slideStyle,
            };

            return (
              <div
                key={presentation.id}
                className="group relative cursor-pointer rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-lg"
                onClick={() => handleOpenPresentation(presentation.id)}
              >
                {/* Presentation Preview */}
                <div className="relative aspect-video overflow-hidden rounded-t-lg bg-background">
                  {firstSlide ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Slide
                        slide={slideModel}
                        selectedId={null}
                        editingId={null}
                        liveOverrides={{}}
                        onSelectWidget={() => {}}
                        onSetLiveOverride={() => {}}
                        onClearLiveOverride={() => {}}
                        theme={presentation.globalTheme}
                        scale={0.2}
                        padding={0}
                        showSnapLines={false}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <p className="text-sm font-medium">No slides yet</p>
                        <p className="text-xs">Click to start editing</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Presentation Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate font-semibold text-sm">
                        {presentation.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {presentation._count?.slides || 0} slide
                        {(presentation._count?.slides || 0) !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) =>
                            handleDeletePresentation(presentation.id, e)
                          }
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
