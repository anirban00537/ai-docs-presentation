"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSearchUnsplashPhotos,
  useRandomUnsplashPhotos,
  useTrackUnsplashDownload,
} from "@/hooks/use-images";
import { useDebouncedCallback } from "use-debounce";
import type { UnsplashPhoto } from "@/services/images";
import { useImageCreation } from "@/components/editor/widgets/image";

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

type UnsplashMediaTabProps = {
  isDarkTheme: boolean;
  onImageAdded?: () => void;
  onImageClick?: (imageUrl: string) => void;
};

export const UnsplashMediaTab: React.FC<UnsplashMediaTabProps> = ({
  isDarkTheme,
  onImageAdded,
  onImageClick,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const { handleAddImage } = useImageCreation();
  const trackDownloadMutation = useTrackUnsplashDownload();

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

  return (
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
            className={cn(
              "pl-11 pr-4 h-11 border shadow-sm focus-visible:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all duration-300 ease-out rounded-xl",
              isDarkTheme
                ? "bg-black/50 border-white/10 hover:bg-black/70"
                : "bg-background/60 border-border/40 hover:bg-background/80"
            )}
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2.5 overflow-x-auto scroll-smooth">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "relative shrink-0 h-9 px-4 text-xs font-semibold rounded-full whitespace-nowrap",
                "transition-all duration-300 ease-out",
                "hover:scale-[1.03] active:scale-[0.98]",
                selectedCategory === category.id
                  ? "bg-primary text-black shadow-lg shadow-primary/40 scale-105 ring-2 ring-primary/30"
                  : cn(
                      category.color,
                      "text-black shadow-sm hover:shadow-md hover:shadow-black/10 border border-white/30 hover:border-white/50 backdrop-blur-sm"
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
      <div
        className={cn(
          "flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar",
          isDarkTheme ? "custom-scrollbar-dark" : "custom-scrollbar-light"
        )}
      >
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
            <p className="text-xs text-muted-foreground/50">Please try again</p>
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
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => handleImageClick(photo)}
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
                  src={photo.urls.small}
                  alt={
                    photo.altDescription ||
                    photo.description ||
                    "Unsplash photo"
                  }
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300 ease-out" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-3 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
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
  );
};
