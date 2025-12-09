"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  IconPresentation,
  IconEdit,
  IconTrash,
  IconDotsVertical,
  IconPlus,
} from "@tabler/icons-react";
import {
  usePresentationsList,
  useDeletePresentation,
} from "@/hooks/use-presentation";
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
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-lg" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/2" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            My Presentations
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your presentations
          </p>
        </div>
        <Button onClick={() => router.push("/home")} className="gap-2">
          <IconPlus className="size-4" />
          Create New
        </Button>
      </div>

      {/* Presentations Grid */}
      {presentations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <IconPresentation className="size-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No presentations yet</h3>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Get started by creating your first presentation. Click the button
              above to begin.
            </p>
            <Button
              onClick={() => router.push("/home")}
              variant="outline"
              className="gap-2"
            >
              <IconPlus className="size-4" />
              Create Presentation
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {presentations.map((presentation) => (
            <Card
              key={presentation.id}
              className="group hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 mb-1">
                      {presentation.title || "Untitled Presentation"}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {presentation.slides?.length || 0} slides
                    </CardDescription>
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
                          router.push(`/editor?id=${presentation.id}`);
                        }}
                      >
                        <IconEdit className="size-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(
                            presentation.id,
                            presentation.title || "Untitled Presentation"
                          );
                        }}
                        className="text-destructive"
                      >
                        <IconTrash className="size-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <Link href={`/editor?id=${presentation.id}`}>
                <CardContent className="pb-3">
                  {presentation.thumbnail ? (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border bg-muted relative">
                      <Image
                        src={presentation.thumbnail}
                        alt={presentation.title || "Presentation"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video w-full rounded-lg border bg-linear-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <IconPresentation className="size-12 text-primary/40" />
                    </div>
                  )}
                </CardContent>
              </Link>
              <CardFooter className="pt-3 text-xs text-muted-foreground">
                {(() => {
                  const date = presentation.updatedAt || presentation.createdAt;
                  if (!date) return "No date";
                  const d = new Date(date);
                  return d.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                })()}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;
              {presentationToDelete?.title}&rdquo;? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
