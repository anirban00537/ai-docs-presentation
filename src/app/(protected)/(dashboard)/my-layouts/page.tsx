"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  IconFileText,
  IconTrash,
  IconDotsVertical,
  IconPlus,
  IconDownload,
} from "@tabler/icons-react";
import { useLayoutsList, useDeleteLayout } from "@/hooks/use-layouts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { SlideCard } from "@/app/(protected)/presentation/[id]/editor/SlideCard";
import { GoogleFontsLoader } from "@/components/GoogleFontsLoader";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { convertApiSlideToRedux } from "@/lib/editor/adapters";
import type { Slide } from "@/lib/editor/types";

export default function MyLayoutsPage() {
  const router = useRouter();
  const { data: layoutsResponse, isLoading } = useLayoutsList();
  const deleteLayoutMutation = useDeleteLayout();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [layoutToDelete, setLayoutToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;

  const layouts = layoutsResponse?.success ? layoutsResponse.data || [] : [];

  const handleDelete = (id: string, name: string) => {
    setLayoutToDelete({ id, name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!layoutToDelete) return;

    try {
      await deleteLayoutMutation.mutateAsync(layoutToDelete.id);
      toast.success("Layout deleted successfully");
      setDeleteDialogOpen(false);
      setLayoutToDelete(null);
    } catch {
      toast.error("Failed to delete layout");
    }
  };

  // Convert layout data to slides for rendering
  const layoutSlides = useMemo(() => {
    return layouts.map((layout: any) => {
      const layoutData = layout.data || {};
      const layoutSlidesData = layoutData.slides || [];

      // Convert API slide format to Redux slide format
      const slides: Slide[] = layoutSlidesData.map(
        (slideData: any, index: number) => {
          // Handle both formats: slideData.data.rows or slideData.rows
          const slideRows = slideData.data?.rows || slideData.rows || [];
          return convertApiSlideToRedux({
            id: slideData.id || `slide-${index}`,
            data: { rows: slideRows },
          });
        }
      );

      return {
        ...layout,
        slides,
        layoutTheme: layoutData.theme || theme,
      };
    });
  }, [layouts, theme]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <GoogleFontsLoader />
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">
              My Layouts
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage your saved presentation layouts
            </p>
          </div>
        </div>

        {/* Layouts Grid */}
        {layouts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <IconFileText className="size-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No layouts yet</h3>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
                Save layouts from your presentations to reuse them later. Go to
                a presentation and hover over a slide to save it as a layout.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {layoutSlides.map((layout: any, layoutIndex: number) => (
              <Card
                key={layout.id}
                className="group hover:shadow-lg transition-shadow flex flex-col overflow-hidden"
              >
                {/* Layout Header */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg line-clamp-2 mb-1">
                        {layout.name}
                      </CardTitle>
                      {layout.description && (
                        <CardDescription className="line-clamp-2 text-xs">
                          {layout.description}
                        </CardDescription>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                        <span>
                          {layout.slides?.length || 0} slide
                          {(layout.slides?.length || 0) !== 1 ? "s" : ""}
                        </span>
                        {layout.createdAt && (
                          <>
                            <span>•</span>
                            <span>
                              {new Date(layout.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconDotsVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.info("Use layout feature coming soon");
                          }}
                        >
                          <IconDownload className="size-4 mr-2" />
                          Use Layout
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(layout.id, layout.name);
                          }}
                          className="text-destructive"
                        >
                          <IconTrash className="size-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {layout.tags && layout.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {layout.tags.slice(0, 3).map((tag: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </CardHeader>

                {/* Layout Slides Preview - Scaled Down */}
                <CardContent className="pt-0 pb-4 flex-1 flex flex-col">
                  <div
                    className="rounded-lg overflow-hidden relative"
                    style={{
                      backgroundColor:
                        layout.layoutTheme?.pageBackground ||
                        theme.pageBackground,
                      backgroundImage: layout.layoutTheme?.primary
                        ? `radial-gradient(circle at 20% 18%, ${layout.layoutTheme.primary}14, transparent 32%), radial-gradient(circle at 80% 12%, ${layout.layoutTheme.primary}10, transparent 28%)`
                        : undefined,
                      height: "200px",
                      aspectRatio: "16/9",
                    }}
                  >
                    {layout.slides && layout.slides.length > 0 ? (
                      <div className="relative w-full h-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 pointer-events-none"
                          style={{
                            transform: "scale(0.25)",
                            transformOrigin: "top left",
                            width: "400%",
                            height: "400%",
                          }}
                        >
                          <div className="flex flex-col gap-8">
                            {layout.slides
                              .slice(0, 3)
                              .map((slide: Slide, slideIndex: number) => (
                                <div key={slide.id || `slide-${slideIndex}`}>
                                  <SlideCard
                                    slide={slide}
                                    onUpdateBlock={() => {}}
                                    onDeleteRow={() => {}}
                                    onAddColumn={() => {}}
                                    onAddRowAtTop={() => {}}
                                    onAddRowAtBottom={() => {}}
                                    onUpdateColumnWidths={() => {}}
                                    enableDragHints={false}
                                  />
                                </div>
                              ))}
                            {layout.slides.length > 3 && (
                              <div
                                className="text-center py-4 text-xs font-medium opacity-75"
                                style={{
                                  color:
                                    layout.layoutTheme?.bodyColor ||
                                    theme.bodyColor,
                                }}
                              >
                                +{layout.slides.length - 3} more slide
                                {layout.slides.length - 3 !== 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Slide Count Badge */}
                        {layout.slides.length > 1 && (
                          <div
                            className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium z-10 backdrop-blur-sm"
                            style={{
                              backgroundColor: "rgba(37,99,235,0.85)",
                              color: "white",
                            }}
                          >
                            {layout.slides.length} slides
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-muted-foreground text-sm">
                          No slides in this layout
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Layout</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &ldquo;{layoutToDelete?.name}
                &rdquo;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteLayoutMutation.isPending}
              >
                {deleteLayoutMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
