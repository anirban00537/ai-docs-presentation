"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IconPlus } from "@tabler/icons-react";
import {
  usePresentationsList,
  useDeletePresentation,
} from "@/hooks/use-presentation";
import { Button } from "@/components/ui/button";
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
} from "./components";

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

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)]">
      {/* === SCROLLABLE CONTENT LAYER === */}
      <div className="relative z-10 w-full flex-1 px-8 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6"
        >
          <div className="text-center sm:text-left">

            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">
              My <span className="text-primary/80 font-normal italic">presentations</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/70 mt-3 font-medium max-w-md">
              {presentations.length > 0 
                ? `You have ${presentations.length} presentation${presentations.length !== 1 ? 's' : ''} in your library.`
                : "Create and manage your professional presentations."
              }
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => router.push("/home")}
              variant="default"
             
            >
              <IconPlus size={18} />
              New Project
            </Button>
          </motion.div>
        </motion.div>

        {/* Content */}
        {presentations.length === 0 ? (
          <EmptyState onCreateClick={() => router.push("/home")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent
          className="rounded-2xl border-0"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: `
              0 1px 0 0 rgba(255, 255, 255, 1) inset,
              0 25px 50px rgba(0, 0, 0, 0.15)
            `,
          }}
        >
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
