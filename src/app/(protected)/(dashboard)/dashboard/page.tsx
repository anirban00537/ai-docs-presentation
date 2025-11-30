"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { loadPresentation } from "@/store/slices/slidesSlice";
import { useCreatePresentation } from "@/hooks/use-presentation";
import type { SlideModel, GlobalTheme } from "@/store/slices/slidesSlice";
import type { SlideWidget } from "@/components/editor/widgets/types";
import type { PresentationSlide } from "@/services/presentation";
import { SLIDE_THEMES } from "@/lib/slide-themes";

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createPresentationMutation = useCreatePresentation();

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

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold">Create Your Presentation</h1>
        <p className="text-lg text-muted-foreground">
          Start building beautiful presentations with our intuitive editor
        </p>
        <Button
          onClick={handleCreatePresentation}
          disabled={createPresentationMutation.isPending}
          size="lg"
          className="mt-4"
        >
          <Plus className="mr-2 h-5 w-5" />
          {createPresentationMutation.isPending
            ? "Creating..."
            : "Create New Presentation"}
        </Button>
      </div>
    </div>
  );
}
