"use client";

import React, { useState, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Loader2,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSearchUnsplashPhotos,
  useRandomUnsplashPhotos,
  useTrackUnsplashDownload,
  useListMedia,
  useUploadMedia,
  useDeleteMedia,
} from "@/hooks/use-images";
import { useDebouncedCallback } from "use-debounce";
import type { UnsplashPhoto, MediaItem } from "@/services/images";
import { useImageCreation } from "@/components/editor/widgets/image";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const categories = [
  {
    id: "gradient",
    label: "Gradient",
    color: "bg-rose-200",
    searchQuery: "gradient",
  },
  {
    id: "data",
    label: "Data",
    color: "bg-teal-200",
    searchQuery: "data visualization",
  },
  {
    id: "abstract",
    label: "Abstract",
    color: "bg-violet-200",
    searchQuery: "abstract",
  },
  {
    id: "tech",
    label: "Tech",
    color: "bg-slate-200",
    searchQuery: "technology",
  },
  {
    id: "3d",
    label: "3D Shapes",
    color: "bg-blue-200",
    searchQuery: "3d shapes",
  },
  {
    id: "nature",
    label: "Nature",
    color: "bg-emerald-200",
    searchQuery: "nature",
  },
];

type MediaBrowserProps = {
  onImageAdded?: () => void;
  onImageClick?: (imageUrl: string) => void;
};

export const MediaBrowser: React.FC<MediaBrowserProps> = ({
  onImageAdded,
  onImageClick,
}) => {
  const [activeTab, setActiveTab] = useState<"unsplash" | "your-media">(
    "unsplash"
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleAddImage } = useImageCreation();
  const trackDownloadMutation = useTrackUnsplashDownload();
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();

  // Fetch user's media
  const { data: mediaResponse, isLoading: isLoadingMedia } = useListMedia({
    page: 1,
    perPage: 50,
    category: "all",
  });

  const userMedia = mediaResponse?.data?.list || [];

  // Debounce search query
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearchQuery(value);
  }, 500);

  // Determine which query to use
  const effectiveQuery = useMemo(() => {
    if (debouncedSearchQuery.trim()) {
      return debouncedSearchQuery;
    }
    if (selectedCategory) {
      const category = categories.find((c) => c.id === selectedCategory);
      return category?.searchQuery || "";
    }
    return "";
  }, [debouncedSearchQuery, selectedCategory]);

  // Use search API when there's a query, otherwise use random photos
  const hasQuery = effectiveQuery.trim().length > 0;

  const searchQueryResult = useSearchUnsplashPhotos(
    {
      query: effectiveQuery,
      perPage: 20,
      page: 1,
    },
    hasQuery
  );

  const randomPhotosQuery = useRandomUnsplashPhotos({ count: 20 }, !hasQuery);

  // Get the active query result
  const activeQuery = hasQuery ? searchQueryResult : randomPhotosQuery;
  const photos = useMemo(() => {
    if (!activeQuery.data?.data) return [];

    if (hasQuery) {
      const searchData = activeQuery.data.data as { results: UnsplashPhoto[] };
      return searchData?.results || [];
    } else {
      const randomData = activeQuery.data.data as
        | UnsplashPhoto
        | UnsplashPhoto[];
      return Array.isArray(randomData) ? randomData : [randomData];
    }
  }, [activeQuery.data, hasQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
    // Clear category when typing
    if (value.trim()) {
      setSelectedCategory(null);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    const newCategory = selectedCategory === categoryId ? null : categoryId;
    setSelectedCategory(newCategory);
    // Clear search when selecting category
    if (newCategory) {
      setSearchQuery("");
      setDebouncedSearchQuery("");
    }
  };

  const handleImageClick = (photo: UnsplashPhoto) => {
    // Use regular URL for the image
    const imageUrl = photo.urls.regular;

    // If custom onImageClick is provided, use it (for background images, etc.)
    if (onImageClick) {
      onImageClick(imageUrl);
      // Track download if download location is available
      if (photo.links.downloadLocation) {
        trackDownloadMutation.mutate({
          downloadLocation: photo.links.downloadLocation,
        });
      }
      onImageAdded?.();
      return;
    }

    // Default behavior: add as widget
    handleAddImage(imageUrl);

    // Track download if download location is available
    if (photo.links.downloadLocation) {
      trackDownloadMutation.mutate({
        downloadLocation: photo.links.downloadLocation,
      });
    }

    // Callback to close dropdown or notify parent
    onImageAdded?.();
  };

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
    <div className="w-full h-full flex flex-col bg-background/95 backdrop-blur-xl rounded-lg overflow-hidden min-h-0 shadow-lg border border-border/40">
      {/* Tabs */}
      <div className="px-4 pt-4 pb-3 border-b border-border/30">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "unsplash" | "your-media")
          }
        >
          <TabsList className="w-full grid grid-cols-2 bg-muted/30 p-1 rounded-xl">
            <TabsTrigger
              value="unsplash"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg"
            >
              Unsplash
            </TabsTrigger>
            <TabsTrigger
              value="your-media"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-300 ease-out rounded-lg"
            >
              Your Media
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Unsplash Tab Content */}
      {activeTab === "unsplash" && (
        <>
          {/* Search Bar */}
          <div className="px-4 pt-4 pb-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-300 ease-out z-10" />
              <Input
                type="text"
                placeholder="Search Unsplash"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-11 pr-4 h-11 bg-background/60 border border-border/40 shadow-sm focus-visible:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all duration-300 ease-out rounded-xl hover:bg-background/80"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="px-4 pb-3">
            <div className="flex items-center gap-2.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={cn(
                    "relative shrink-0 h-9 px-4 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-300 ease-out",
                    "transform hover:scale-105 active:scale-[0.98]",
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40 scale-105 ring-2 ring-primary/30"
                      : cn(
                          category.color,
                          "text-slate-700 dark:text-slate-300 shadow-sm hover:shadow-md hover:shadow-black/10 border border-white/30 hover:border-white/50 backdrop-blur-sm"
                        )
                  )}
                >
                  <span className="relative z-10">{category.label}</span>
                  {selectedCategory === category.id && (
                    <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30 transition-colors duration-300">
            {activeQuery.isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                  <p className="text-xs text-muted-foreground/60 font-medium">
                    Loading images...
                  </p>
                </div>
              </div>
            ) : activeQuery.isError ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive/70" />
                </div>
                <p className="text-sm text-muted-foreground/70 font-medium">
                  Failed to load images
                </p>
                <p className="text-xs text-muted-foreground/50">
                  Please try again
                </p>
              </div>
            ) : photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 gap-2">
                <div className="p-3 rounded-full bg-muted/30">
                  <Search className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground/70 font-medium">
                  No images found
                </p>
                <p className="text-xs text-muted-foreground/50">
                  Try a different search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    onClick={() => handleImageClick(photo)}
                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/30 active:scale-[0.98] border border-border/20 hover:border-primary/30"
                  >
                    <img
                      src={photo.urls.small}
                      alt={
                        photo.altDescription ||
                        photo.description ||
                        "Unsplash photo"
                      }
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 ease-out" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      <p className="text-xs text-white font-semibold drop-shadow-2xl">
                        by {photo.user.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Your Media Tab Content */}
      {activeTab === "your-media" && (
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
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
          <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/30 transition-colors duration-300">
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
                {userMedia.map((media) => (
                  <div
                    key={media.id}
                    onClick={() => handleUserMediaClick(media)}
                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer transform transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-[1.03] hover:shadow-2xl hover:shadow-black/30 active:scale-[0.98] border border-border/20 hover:border-primary/30"
                  >
                    <img
                      src={media.url}
                      alt={media.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500 ease-out" />

                    {/* Delete Button */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out transform translate-y-[-4px] group-hover:translate-y-0">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 rounded-full p-0 bg-destructive/95 hover:bg-destructive backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 ease-out hover:scale-110"
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
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
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
      )}
    </div>
  );
};
