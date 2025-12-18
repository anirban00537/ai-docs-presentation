"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconUpload,
  IconTrash,
  IconEdit,
  IconHeart,
  IconHeartFilled,
  IconSearch,
  IconX,
  IconPhoto,
  IconCheck,
  IconLoader2,
  IconDownload,
  IconCopy,
  IconDots,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  useListMedia,
  useUploadMedia,
  useUpdateMedia,
  useDeleteMedia,
} from "@/hooks/use-images";
import { type MediaItem, type ListMediaParams } from "@/services/images";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePreviewModal } from "./components/ImagePreviewModal";

// Category filter type
type CategoryFilter = "all" | "recent" | "favorites";

// Format file size
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Media Card Component
const MediaCard = ({
  media,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  isDeleting,
}: {
  media: MediaItem;
  onEdit: (media: MediaItem) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (media: MediaItem) => void;
  onClick: (media: MediaItem) => void;
  isDeleting: boolean;
}) => {
  const isImage = media.mimeType.startsWith("image/");

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(media.url);
    toast.success("URL copied to clipboard");
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = media.url;
    a.download = media.name;
    a.click();
    toast.success("Download started");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="group relative rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.5)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        boxShadow: `
          0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
          0 -1px 0 0 rgba(0, 0, 0, 0.03) inset,
          0 4px 16px rgba(0, 0, 0, 0.06)
        `,
      }}
    >
      {/* Glass shine overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none rounded-2xl z-10" />

      {/* Thumbnail */}
      <div 
        className="relative aspect-square bg-muted/30 overflow-hidden cursor-pointer"
        onClick={() => onClick(media)}
      >
        {isImage ? (
          <img
            src={media.url}
            alt={media.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconPhoto size={48} className="text-muted-foreground/40" />
          </div>
        )}

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-20">
          <button
            onClick={handleCopyUrl}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <IconCopy size={18} className="text-white" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
          >
            <IconDownload size={18} className="text-white" />
          </button>
        </div>

        {/* Favorite badge */}
        <button
          onClick={() => onToggleFavorite(media)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-20"
        >
          {media.isFavorite ? (
            <IconHeartFilled size={16} className="text-red-500" />
          ) : (
            <IconHeart size={16} className="text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="relative p-3 z-20">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {media.name}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatFileSize(media.size)} • {formatDate(media.createdAt)}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-lg hover:bg-white/50 transition-colors">
                <IconDots size={16} className="text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border-0"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.85)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
              }}
            >
              <DropdownMenuItem
                onClick={() => onEdit(media)}
                className="rounded-lg cursor-pointer"
              >
                <IconEdit size={16} className="mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCopyUrl}
                className="rounded-lg cursor-pointer"
              >
                <IconCopy size={16} className="mr-2" />
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDownload}
                className="rounded-lg cursor-pointer"
              >
                <IconDownload size={16} className="mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/50" />
              <DropdownMenuItem
                onClick={() => onDelete(media.id)}
                className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                disabled={isDeleting}
              >
                <IconTrash size={16} className="mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tags */}
        {media.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {media.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
            {media.tags.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-muted/50 text-muted-foreground">
                +{media.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Deleting overlay */}
      {isDeleting && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
          <IconLoader2 size={24} className="animate-spin text-primary" />
        </div>
      )}
    </motion.div>
  );
};

// Empty state component
const EmptyState = ({ onUpload }: { onUpload: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20"
  >
    <div
      className="relative w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(20px)",
        boxShadow: `
          0 1px 0 0 rgba(255, 255, 255, 1) inset,
          0 8px 32px rgba(0, 0, 0, 0.08)
        `,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent rounded-3xl" />
      <IconPhoto size={40} className="text-primary/60 relative z-10" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">
      No media yet
    </h3>
    <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
      Upload images to use in your presentations. They&apos;ll be stored securely
      and accessible from anywhere.
    </p>
    <Button
      onClick={onUpload}
      className="rounded-xl px-6"
    >
      <IconUpload size={18} className="mr-2" />
      Upload Media
    </Button>
  </motion.div>
);

// Loading skeleton
const LoadingSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse rounded-2xl overflow-hidden"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.4)",
        }}
      >
        <div className="aspect-square bg-muted/30" />
        <div className="p-3 space-y-2">
          <div className="h-4 w-3/4 bg-muted/40 rounded" />
          <div className="h-3 w-1/2 bg-muted/30 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Main Media Page
export default function MediaPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [editName, setEditName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaItem | null>(null);

  // API hooks
  const listParams: ListMediaParams = {
    search: searchQuery || undefined,
    category: category,
    perPage: 50,
  };

  const { data: mediaResponse, isLoading, error } = useListMedia(listParams);
  const uploadMutation = useUploadMedia();
  const updateMutation = useUpdateMedia();
  const deleteMutation = useDeleteMedia();

  const mediaItems = mediaResponse?.data?.list || [];

  // Handle file upload
  const handleUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      try {
        await uploadMutation.mutateAsync({ file, name: file.name });
        return { success: true, name: file.name };
      } catch {
        return { success: false, name: file.name };
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    if (successful > 0) {
      toast.success(`${successful} file${successful > 1 ? "s" : ""} uploaded successfully`);
    }
    if (failed > 0) {
      toast.error(`${failed} file${failed > 1 ? "s" : ""} failed to upload`);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle edit
  const handleEdit = (media: MediaItem) => {
    setEditingMedia(media);
    setEditName(media.name);
  };

  const handleSaveEdit = async () => {
    if (!editingMedia || !editName.trim()) return;

    try {
      await updateMutation.mutateAsync({
        id: editingMedia.id,
        params: { name: editName.trim() },
      });
      toast.success("Media renamed successfully");
      setEditingMedia(null);
    } catch {
      toast.error("Failed to rename media");
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (media: MediaItem) => {
    try {
      await updateMutation.mutateAsync({
        id: media.id,
        params: { isFavorite: !media.isFavorite },
      });
      toast.success(media.isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update favorite status");
    }
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setMediaToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!mediaToDelete) return;

    setDeletingId(mediaToDelete);
    setShowDeleteDialog(false);

    try {
      await deleteMutation.mutateAsync(mediaToDelete);
      toast.success("Media deleted successfully");
    } catch {
      toast.error("Failed to delete media");
    } finally {
      setDeletingId(null);
      setMediaToDelete(null);
    }
  };

  // Preview navigation
  const handlePreviewPrevious = useCallback(() => {
    if (!previewMedia) return;
    const currentIndex = mediaItems.findIndex((m) => m.id === previewMedia.id);
    if (currentIndex > 0) {
      setPreviewMedia(mediaItems[currentIndex - 1]);
    }
  }, [previewMedia, mediaItems]);

  const handlePreviewNext = useCallback(() => {
    if (!previewMedia) return;
    const currentIndex = mediaItems.findIndex((m) => m.id === previewMedia.id);
    if (currentIndex < mediaItems.length - 1) {
      setPreviewMedia(mediaItems[currentIndex + 1]);
    }
  }, [previewMedia, mediaItems]);

  const handlePreviewDownload = useCallback(() => {
    if (!previewMedia) return;
    const a = document.createElement("a");
    a.href = previewMedia.url;
    a.download = previewMedia.name;
    a.click();
    toast.success("Download started");
  }, [previewMedia]);

  const handlePreviewCopyUrl = useCallback(async () => {
    if (!previewMedia) return;
    await navigator.clipboard.writeText(previewMedia.url);
    toast.success("URL copied to clipboard");
  }, [previewMedia]);

  const handlePreviewToggleFavorite = useCallback(async () => {
    if (!previewMedia) return;
    try {
      await updateMutation.mutateAsync({
        id: previewMedia.id,
        params: { isFavorite: !previewMedia.isFavorite },
      });
      setPreviewMedia({ ...previewMedia, isFavorite: !previewMedia.isFavorite });
      toast.success(previewMedia.isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch {
      toast.error("Failed to update favorite status");
    }
  }, [previewMedia, updateMutation]);

  // Category tabs
  const categories: { label: string; value: CategoryFilter }[] = [
    { label: "All", value: "all" },
    { label: "Recent", value: "recent" },
    { label: "Favorites", value: "favorites" },
  ];

  return (
    <div className="relative flex-1 flex flex-col min-h-[calc(100vh-80px)]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Content */}
      <div className="relative z-10 w-full flex-1 px-8 py-8 overflow-y-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6"
        >
          <div className="text-center sm:text-left">

            <h1 className="text-3xl md:text-4xl font-semibold text-foreground tracking-tight leading-tight">
              Media <span className="text-primary/80 font-normal italic">library</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground/70 mt-3 font-medium max-w-md">
              Manage your images and media files in one central place.
            </p>
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="rounded-2xl h-12 px-6 shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all font-semibold"
          >
            {uploadMutation.isPending ? (
              <IconLoader2 size={18} className="mr-2 animate-spin" />
            ) : (
              <IconUpload size={18} className="mr-2" />
            )}
            Upload Media
          </Button>
        </motion.div>

        {/* Search and filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col sm:flex-row gap-4"
        >
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <IconSearch
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-0 h-11"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                backdropFilter: "blur(16px)",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted/50"
              >
                <IconX size={14} className="text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Category tabs */}
          <div
            className="flex items-center gap-1 p-1 rounded-xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(16px)",
            }}
          >
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  category === cat.value
                    ? "bg-white shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/50"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Media count */}
        {!isLoading && mediaItems.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-muted-foreground mb-4"
          >
            {mediaItems.length} item{mediaItems.length !== 1 ? "s" : ""}
          </motion.p>
        )}

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-destructive/30 p-6 text-sm text-destructive"
            style={{
              backgroundColor: "rgba(254, 202, 202, 0.3)",
              backdropFilter: "blur(24px)",
            }}
          >
            Failed to load media. Please try again.
          </motion.div>
        ) : mediaItems.length === 0 ? (
          <EmptyState onUpload={handleUpload} />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {mediaItems.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleFavorite={handleToggleFavorite}
                  onClick={setPreviewMedia}
                  isDeleting={deletingId === media.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewMedia && (
          <ImagePreviewModal
            media={previewMedia}
            onClose={() => setPreviewMedia(null)}
            onPrevious={handlePreviewPrevious}
            onNext={handlePreviewNext}
            onToggleFavorite={handlePreviewToggleFavorite}
            onDownload={handlePreviewDownload}
            onCopyUrl={handlePreviewCopyUrl}
            hasPrevious={mediaItems.findIndex((m) => m.id === previewMedia.id) > 0}
            hasNext={mediaItems.findIndex((m) => m.id === previewMedia.id) < mediaItems.length - 1}
          />
        )}
      </AnimatePresence>

      {/* Edit Dialog */}
      <Dialog open={!!editingMedia} onOpenChange={() => setEditingMedia(null)}>
        <DialogContent
          className="sm:max-w-md rounded-2xl border-0"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: `
              0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
              0 25px 50px rgba(0, 0, 0, 0.15)
            `,
          }}
        >
          <DialogHeader>
            <DialogTitle>Rename Media</DialogTitle>
            <DialogDescription>
              Enter a new name for this media file.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Enter name..."
              className="rounded-xl h-11"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditingMedia(null)}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={!editName.trim() || updateMutation.isPending}
              className="rounded-xl"
            >
              {updateMutation.isPending ? (
                <IconLoader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <IconCheck size={16} className="mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          className="rounded-2xl border-0"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            boxShadow: `
              0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
              0 25px 50px rgba(0, 0, 0, 0.15)
            `,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Media</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this media? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
