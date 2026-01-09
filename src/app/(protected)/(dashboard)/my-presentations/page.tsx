"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  usePresentationsList,
  useDeletePresentation,
} from "@/hooks/use-presentation";
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
import {
  LoadingSkeleton,
  EmptyState,
  PresentationCard,
  PresentationsHeader,
} from "../../../../components/my-presentations";

export default function MyPresentationsPage() {
  const router = useRouter();
  const { data: presentationsResponse, isLoading } = usePresentationsList();
  const deletePresentationMutation = useDeletePresentation();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [presentationToDelete, setPresentationToDelete] = React.useState<{
    id: string;
    title: string;
  } | null>(null);

  const presentations = presentationsResponse?.success
    ? presentationsResponse.data?.list || []
    : [];

  const handleEdit = (id: string) => {
    router.push(`/presentation/${id}`);
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

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)] ">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-30 pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/40 rounded-full blur-3xl opacity-30 pointer-events-none translate-y-1/2" />

      <div className="relative z-10 w-full flex-1 px-4 py-8 md:px-8 overflow-y-auto">
        <PresentationsHeader 
          count={presentations.length} 
          onNew={() => router.push("/home")} 
        />

        {presentations.length === 0 ? (
          <EmptyState onCreateClick={() => router.push("/home")} />
        ) : (
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
