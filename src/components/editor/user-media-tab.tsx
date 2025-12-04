"use client";

import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useListMedia,
  useUploadMedia,
  useDeleteMedia,
} from "@/hooks/use-images";
import type { MediaItem } from "@/services/images";
import { useImageCreation } from "@/components/editor/widgets/image";

type UserMediaTabProps = {
  isDarkTheme: boolean;
  onImageAdded?: () => void;
  onImageClick?: (imageUrl: string) => void;
};

export const UserMediaTab: React.FC<UserMediaTabProps> = ({
  isDarkTheme,
  onImageAdded,
  onImageClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleAddImage } = useImageCreation();
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();

  // Fetch user's media
  const { data: mediaResponse, isLoading: isLoadingMedia } = useListMedia({
    page: 1,
    perPage: 50,
    category: "all",
  });

  const userMedia = mediaResponse?.data?.list || [];

  const handleUserMediaClick = (media: MediaItem) => {
    const imageUrl = media.url;

    // If custom onImageClick is provided, use it
    if (onImageClick) {
      onImageClick(imageUrl);
      onImageAdded?.();
      return;
    }

    // Default behavior: add as widget
    handleAddImage(imageUrl);
    onImageAdded?.();
  };

  const handleDeleteMedia = async (
    e: React.MouseEvent,
    mediaId: string,
    mediaName: string
  ) => {
    e.stopPropagation(); // Prevent triggering the click handler

    if (confirm(`Are you sure you want to delete "${mediaName}"?`)) {
      try {
        await deleteMediaMutation.mutateAsync(mediaId);
      } catch (error) {
        console.error("Failed to delete media:", error);
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Upload all selected files
    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        console.warn(`Invalid file type: ${file.type}`);
        return;
      }

      // Validate file size (50MB max)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        console.warn(`File too large: ${file.name}`);
        return;
      }

      try {
        await uploadMediaMutation.mutateAsync({
          file,
          name: file.name,
        });
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
      }
    });

    await Promise.all(uploadPromises);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Upload Button */}
      <div className="px-4 pt-4 pb-3">
        <Button
          onClick={handleUploadClick}
          disabled={uploadMediaMutation.isPending}
          className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-300 ease-out rounded-xl font-medium"
          variant="default"
        >
          {uploadMediaMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Media
            </>
          )}
        </Button>
      </div>

      {/* Media Grid */}
      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar",
          isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
        )}
      >
        {isLoadingMedia ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              <p className="text-xs text-muted-foreground/60 font-medium">
                Loading your media...
              </p>
            </div>
          </div>
        ) : userMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <div className="p-3 rounded-full bg-muted/30">
              <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm text-muted-foreground/70 font-medium">
              No media uploaded yet
            </p>
            <p className="text-xs text-muted-foreground/50">
              Click &quot;Upload Media&quot; to add images
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {userMedia.map((media, index) => (
              <div
                key={media.id}
                onClick={() => handleUserMediaClick(media)}
                className={cn(
                  "group relative aspect-video rounded-xl overflow-hidden cursor-pointer",
                  "transform transition-all duration-300 ease-out",
                  "hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30 active:scale-[0.98]",
                  "border border-border/20 hover:border-primary/30"
                )}
                style={{
                  animationDelay: `${index * 25}ms`,
                  animation: "fadeInUp 0.4s ease-out both",
                }}
              >
                <img
                  src={media.url}
                  alt={media.name}
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 ease-out" />

                {/* Delete Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform translate-y-[-4px] group-hover:translate-y-0">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 rounded-full p-0 bg-destructive/95 hover:bg-destructive backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-[1.08] active:scale-[0.95]"
                    onClick={(e) =>
                      handleDeleteMedia(e, media.id, media.name)
                    }
                    disabled={deleteMediaMutation.isPending}
                  >
                    {deleteMediaMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Media Name */}
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <p className="text-xs text-white font-semibold drop-shadow-2xl truncate">
                    {media.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

