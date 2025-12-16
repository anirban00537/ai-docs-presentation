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
      {/* === FIXED BACKGROUND LAYER === */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, #fdfbfb 0%, #f8f9ff 50%, #f5f7ff 100%)",
          zIndex: 0,
        }}
      >
        {/* Soft lavender blob - Top Left */}
        <div
          className="absolute"
          style={{
            width: "70vw",
            height: "60vh",
            top: "-20%",
            left: "-20%",
            background: "radial-gradient(circle at center, rgba(196, 181, 253, 0.6) 0%, rgba(196, 181, 253, 0.25) 40%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        
        {/* Soft sky blue blob - Top Right */}
        <div
          className="absolute"
          style={{
            width: "60vw",
            height: "55vh",
            top: "-15%",
            right: "-15%",
            background: "radial-gradient(circle at center, rgba(147, 197, 253, 0.55) 0%, rgba(147, 197, 253, 0.2) 50%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        
        {/* Soft rose blob - Left */}
        <div
          className="absolute"
          style={{
            width: "50vw",
            height: "60vh",
            top: "20%",
            left: "-15%",
            background: "radial-gradient(ellipse at center, rgba(251, 207, 232, 0.6) 0%, rgba(251, 207, 232, 0.2) 50%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Soft mint blob - Right */}
        <div
          className="absolute"
          style={{
            width: "55vw",
            height: "55vh",
            top: "30%",
            right: "-10%",
            background: "radial-gradient(ellipse at center, rgba(167, 243, 208, 0.5) 0%, rgba(167, 243, 208, 0.15) 50%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Soft peach blob - Bottom Left */}
        <div
          className="absolute"
          style={{
            width: "60vw",
            height: "50vh",
            bottom: "-15%",
            left: "-10%",
            background: "radial-gradient(circle at center, rgba(254, 215, 170, 0.55) 0%, rgba(254, 215, 170, 0.15) 50%, transparent 70%)",
            filter: "blur(90px)",
          }}
        />
        
        {/* Soft lilac blob - Bottom Right */}
        <div
          className="absolute"
          style={{
            width: "55vw",
            height: "50vh",
            bottom: "-20%",
            right: "-15%",
            background: "radial-gradient(circle at center, rgba(221, 214, 254, 0.6) 0%, rgba(196, 181, 253, 0.2) 50%, transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        
        {/* Center soft glow */}
        <div
          className="absolute"
          style={{
            width: "50vw",
            height: "50vh",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at center, rgba(255, 255, 255, 0.9) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      {/* === SCROLLABLE CONTENT LAYER === */}
      <div className="relative z-10 w-full flex-1 px-8 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex items-end justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">
              My Presentations
            </h1>
            <p className="text-sm text-muted-foreground">
              {presentations.length > 0 
                ? `${presentations.length} presentation${presentations.length !== 1 ? 's' : ''} in your library`
                : "Create and manage your presentations"
              }
            </p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Button
              onClick={() => router.push("/home")}
              className="gap-2 px-5 h-10 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
            >
              <IconPlus size={18} />
              New Presentation
            </Button>
          </motion.div>
        </motion.div>

        {/* Content */}
        {presentations.length === 0 ? (
          <EmptyState onCreateClick={() => router.push("/home")} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
