"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppleButton } from "@/components/editor/apple-button";
import { Plus, MoreVertical, Trash2, Sparkles } from "lucide-react";
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
                presentationTitle:
                  presentation.title || "Untitled Presentation",
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
    <div className="flex h-full w-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              My Presentations
            </h1>
            <p className="text-base text-muted-foreground">
              Create and manage your beautiful presentations
            </p>
          </div>
          <AppleButton
            onClick={handleCreatePresentation}
            disabled={createPresentationMutation.isPending}
            variant="primary"
            size="lg"
            className="min-w-[160px]"
          >
            <Plus className="h-4 w-4" />
            {createPresentationMutation.isPending
              ? "Creating..."
              : "New Presentation"}
          </AppleButton>
        </div>

        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading presentations...
              </p>
            </div>
          </div>
        ) : presentations.length === 0 ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex max-w-md flex-col items-center gap-6 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  No presentations yet
                </h2>
                <p className="text-muted-foreground">
                  Create your first presentation to get started with beautiful
                  slides
                </p>
              </div>
              <AppleButton
                onClick={handleCreatePresentation}
                disabled={createPresentationMutation.isPending}
                variant="primary"
                size="lg"
              >
                <Plus className="h-4 w-4" />
                Create New Presentation
              </AppleButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {presentations.map((presentation, index) => {
              const firstSlide = presentation.slides?.[0];
              const slideData = (firstSlide?.data as SlideModel) || {};

              return (
                <div
                  key={presentation.id}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-border hover:bg-card hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1"
                  onClick={() => handleOpenPresentation(presentation.id)}
                >
                  {/* Presentation Preview */}
                  <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5">
                    {firstSlide ? (
                      <div className="absolute inset-0 flex items-center justify-center p-2">
                        <div className="relative h-full w-full rounded-lg overflow-hidden shadow-lg">
                          <Slide
                            slide={slideData}
                            selectedId={null}
                            editingId={null}
                            liveOverrides={{}}
                            onSelectWidget={() => {}}
                            onSetLiveOverride={() => {}}
                            onClearLiveOverride={() => {}}
                            globalTheme={presentation.globalTheme}
                            scale={0.2}
                            padding={0}
                            showSnapLines={false}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center space-y-2">
                          <div className="mx-auto h-12 w-12 rounded-lg bg-muted/50 flex items-center justify-center">
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground/80">
                              No slides yet
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Click to start editing
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Presentation Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                          {presentation.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {presentation._count?.slides || 0} slide
                          {(presentation._count?.slides || 0) !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <AppleButton
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 opacity-0 transition-all duration-200 group-hover:opacity-100"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </AppleButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onClick={(e) =>
                              handleDeletePresentation(presentation.id, e)
                            }
                            className="text-destructive focus:text-destructive"
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
    </div>
  );
}
