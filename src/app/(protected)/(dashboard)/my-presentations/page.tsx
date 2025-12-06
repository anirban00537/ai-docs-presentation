"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AppleButton } from "@/components/editor/apple-button";
import { Plus, Sparkles } from "lucide-react";
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
import { PresentationCard } from "@/components/presentation-card";

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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {presentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                onOpen={handleOpenPresentation}
                onDelete={handleDeletePresentation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
