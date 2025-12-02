"use client";

import React from "react";
import {
  MoreVertical,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useDeleteMedia } from "@/hooks/use-images";
import type { MediaItem } from "@/services/images";

interface MediaCardProps {
  item: MediaItem;
  viewMode: "grid" | "list";
  onDelete?: () => void;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

export function MediaCard({ item, viewMode, onDelete }: MediaCardProps) {
  const deleteMediaMutation = useDeleteMedia();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this image?")) {
      try {
        await deleteMediaMutation.mutateAsync(item.id);
        onDelete?.();
      } catch (error) {
        console.error("Failed to delete media:", error);
      }
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, "_blank");
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(item.url, "_blank");
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-border hover:bg-card hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1",
        viewMode === "grid"
          ? "aspect-video"
          : "flex items-center gap-3 p-3"
      )}
    >
      {viewMode === "grid" ? (
        <>
          {/* Grid View */}
          <div className="relative h-full w-full">
            <img
              src={item.url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 bg-background/95 backdrop-blur-sm"
                onClick={handleView}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 bg-background/95 backdrop-blur-sm"
                onClick={handleDownload}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 rounded-full bg-background/95 backdrop-blur-sm p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleView}>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={handleDelete}
                    disabled={deleteMediaMutation.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteMediaMutation.isPending ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-3">
            <p className="truncate text-xs font-medium text-white">
              {item.name}
            </p>
            <p className="text-xs text-white/70">{formatFileSize(item.size)}</p>
          </div>
        </>
      ) : (
        <>
          {/* List View */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <img
              src={item.url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {item.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatFileSize(item.size)}</span>
              <span>•</span>
              <span>{formatDate(item.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleView}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleView}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                  disabled={deleteMediaMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteMediaMutation.isPending ? "Deleting..." : "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
}

