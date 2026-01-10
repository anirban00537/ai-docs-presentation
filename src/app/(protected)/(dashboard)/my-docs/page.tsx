"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  usePresentationsList,
  useDeletePresentation,
} from "@/hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
} from "@/components/ui";
import { toast } from "sonner";
import { IconPresentation, IconPlus } from "@tabler/icons-react";

// Shared components
import { EmptyState, GridSkeleton, Pagination, PageHeader } from "@/components/shared";

import {
  PresentationCard,
} from "@/components/my-docs";

export default function MyPresentationsPage() {
  const router = useRouter();
  const [page, setPage] = React.useState(1);
  const LIMIT = 15;

  const { data: presentationsResponse, isLoading } = usePresentationsList({
    page,
    limit: LIMIT,
  });

  const deletePresentationMutation = useDeletePresentation();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [presentationToDelete, setPresentationToDelete] = React.useState<{
    id: string;
    title: string;
  } | null>(null);

  const presentations = presentationsResponse?.success
    ? presentationsResponse.data?.list || []
    : [];

  // Safely access meta data, defaulting to reasonable values if missing
  const meta = presentationsResponse?.success
    ? presentationsResponse.data?.meta
    : null;

  const totalPages = meta?.lastPage || 1;

  const handleEdit = (id: string) => {
    router.push(`/docs/${id}`);
  };

  const handleDelete = (id: string, title: string) => {
    setPresentationToDelete({ id, title });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!presentationToDelete) return;
    try {
      await deletePresentationMutation.mutateAsync(presentationToDelete.id);
      toast.success("Presentation deleted successfully");
      setDeleteDialogOpen(false);
      setPresentationToDelete(null);
    } catch {
      toast.error("Failed to delete presentation");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    // Scroll to top when changing pages
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  };

  return (
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)] ">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

      <div className="relative z-10 w-full flex-1 px-4 py-8 md:px-8 overflow-y-auto">
        <PageHeader
          title={<>My <span className="text-primary italic">Presentations</span></>}
          action={
            <Button
              onClick={() => router.push("/home")}
              variant="default"
              className="shadow-coral-glow hover:scale-105 transition-transform"
            >
              <IconPlus size={18} className="mr-2" />
              New Project
            </Button>
          }
        />

        {isLoading ? (
          <GridSkeleton count={LIMIT} aspectRatio="video" />
        ) : presentations.length === 0 ? (
          <EmptyState
            icon={IconPresentation}
            title="No presentations yet"
            description="Create your first presentation to get started. Our AI will help you design beautiful slides in seconds."
            actionText="Create Presentation"
            onAction={() => router.push("/home")}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              <AnimatePresence mode="popLayout">
                {presentations.map((presentation: any, index: number) => (
                  <PresentationCard
                    key={presentation.id}
                    presentation={presentation}
                    index={index}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-0 bg-card/90 backdrop-blur-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{presentationToDelete?.title}&rdquo;?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              disabled={deletePresentationMutation.isPending}
            >
              {deletePresentationMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
