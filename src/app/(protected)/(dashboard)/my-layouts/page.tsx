"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { useLayoutsList, useDeleteLayout } from "@/hooks/use-layouts";
import { LayoutCard } from "@/components/layout-card";
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

export default function MyLayoutsPage() {
  const router = useRouter();
  const deleteLayoutMutation = useDeleteLayout();
  const { data: layoutsResponse, isLoading, error } = useLayoutsList();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [layoutToDelete, setLayoutToDelete] = useState<string | null>(null);
  const [layoutToDeleteName, setLayoutToDeleteName] = useState<string>("");

  const handleUseLayout = (layoutId: string) => {
    // Navigate to editor with layoutId to apply the layout
    router.push(`/editor?layoutId=${layoutId}`);
  };

  const handleDeleteClick = (
    layoutId: string,
    layoutName: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    setLayoutToDelete(layoutId);
    setLayoutToDeleteName(layoutName);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!layoutToDelete) return;

    deleteLayoutMutation.mutate(layoutToDelete, {
      onSuccess: (response) => {
        if (response?.success) {
          toast.success("Layout deleted successfully", {
            description: `${layoutToDeleteName} has been removed.`,
          });
        } else {
          toast.error("Failed to delete layout", {
            description:
              response?.message ||
              "An error occurred while deleting the layout.",
          });
        }
        setDeleteDialogOpen(false);
        setLayoutToDelete(null);
        setLayoutToDeleteName("");
      },
      onError: (error: any) => {
        toast.error("Failed to delete layout", {
          description: error?.message || "An unexpected error occurred.",
        });
        setDeleteDialogOpen(false);
        setLayoutToDelete(null);
        setLayoutToDeleteName("");
      },
    });
  };

  // Handle both response formats: data as array or data.list
  const layouts = useMemo(() => {
    return layoutsResponse?.success
      ? Array.isArray(layoutsResponse.data)
        ? layoutsResponse.data
        : layoutsResponse.data?.list || []
      : [];
  }, [layoutsResponse]);

  // Debug: Log the response to see what we're getting
  React.useEffect(() => {
    console.log("Layouts Response:", layoutsResponse);
    console.log("Layouts Array:", layouts);
    console.log("Is Loading:", isLoading);
    console.log("Error:", error);
  }, [layoutsResponse, layouts, isLoading, error]);

  return (
    <div className="flex h-full w-full flex-col overflow-auto">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-12">
        {/* Header */}
        <div className="mb-10 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              My Layouts
            </h1>
            <p className="text-base text-muted-foreground">
              Browse and manage your saved layout templates
            </p>
          </div>
        </div>

        {error ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-destructive">
                Error loading layouts:{" "}
                {error instanceof Error ? error.message : "Unknown error"}
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Loading layouts...
              </p>
            </div>
          </div>
        ) : layouts.length === 0 ? (
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex max-w-md flex-col items-center gap-6 text-center">
              <div className="rounded-full bg-primary/10 p-4">
                <LayoutTemplate className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  No layouts yet
                </h2>
                <p className="text-muted-foreground">
                  Save slides as layouts to reuse them in your presentations
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {layouts.map((layout) => (
              <LayoutCard
                key={layout.id}
                layout={layout}
                onUse={handleUseLayout}
                onDelete={(layoutId, e) =>
                  handleDeleteClick(layoutId, layout.name, e)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Layout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{layoutToDeleteName}&quot;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLayoutMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteLayoutMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLayoutMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
