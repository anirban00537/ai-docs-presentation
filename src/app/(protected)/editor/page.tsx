"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Editor from "@/components/editor/editor";
import { LeftSidebar } from "@/components/editor/left-sidebar";
import { EditorSidebarProvider } from "@/components/editor/editor-sidebar-shell";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectPresentationId,
  loadPresentation,
  setPresentationId,
} from "@/store/slices/slidesSlice";
import { usePresentation } from "@/hooks/use-presentation";
import type { SlideModel, GlobalTheme } from "@/store/slices/slidesSlice";
import type { SlideWidget } from "@/components/editor/widgets/types";
import type { PresentationSlide } from "@/services/presentation";

export default function Page() {
  return (
    <EditorSidebarProvider>
      <EditorWorkspace />
    </EditorSidebarProvider>
  );
}

const EditorWorkspace = () => {
  const searchParams = useSearchParams();
  const presentationId = searchParams.get("presentationId");
  const dispatch = useAppDispatch();
  const currentPresentationId = useAppSelector(selectPresentationId);

  // Use TanStack Query to fetch presentation data
  const {
    data: presentationResponse,
    isLoading,
    error,
  } = usePresentation(presentationId);

  // Process and load presentation data into Redux when it's fetched
  useEffect(() => {
    if (!presentationId) {
      // If no presentationId, clear the state
      dispatch(setPresentationId({ presentationId: null }));
      return;
    }

    // If already loaded, don't reload
    if (currentPresentationId === presentationId) {
      return;
    }

    if (presentationResponse?.success && presentationResponse?.data) {
      const presentation = presentationResponse.data;

      // Map slides from database to SlideModel
      // Backend already sorts by order, but we'll ensure proper mapping
      const slides: SlideModel[] = [];
      if (presentation.slides && Array.isArray(presentation.slides)) {
        // Sort by order field to ensure correct sequence (backend does this, but double-check)
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
            backgroundBlur: slideData.backgroundBlur,
            showSlideNumber: slideData.showSlideNumber ?? false,
            slideStyle: slideData.slideStyle,
          });
        });
      }

      // Get global theme with proper defaults
      const globalTheme: GlobalTheme =
        presentation.globalTheme || ({} as GlobalTheme);

      // Dispatch to Redux to store all slides data
      dispatch(
        loadPresentation({
          presentationId,
          presentationTitle: presentation.title || "Untitled Presentation",
          slides,
          globalTheme,
        })
      );
    }
  }, [presentationResponse, presentationId, currentPresentationId, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-muted-foreground">Loading presentation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-destructive">
          Failed to load presentation. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex h-[calc(100vh-20px)] w-full transition-all duration-300"
      )}
    >
      <LeftSidebar />
      <div className="flex flex-1 overflow-hidden rounded-2xl border border-border/60 bg-background">
        <Editor />
      </div>
    </div>
  );
};
