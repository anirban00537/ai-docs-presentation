"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useSearchUnsplashPhotos,
  useRandomUnsplashPhotos,
} from "@/hooks/use-images";
import { useDebouncedCallback } from "use-debounce";
import type { UnsplashPhoto } from "@/services/images";

const categories = [
  {
    id: "gradient",
    label: "Gradient",
    color: "from-pink-500 via-purple-500 to-orange-500",
    searchQuery: "gradient",
  },
  {
    id: "data",
    label: "Data",
    color: "from-green-900 to-black",
    searchQuery: "data visualization",
  },
  {
    id: "abstract",
    label: "Abstract",
    color: "from-purple-600 to-blue-600",
    searchQuery: "abstract",
  },
  {
    id: "tech",
    label: "Tech",
    color: "from-gray-900 to-black",
    searchQuery: "technology",
  },
  {
    id: "3d",
    label: "3D Shapes",
    color: "from-blue-600 to-purple-600",
    searchQuery: "3d shapes",
  },
];

export const MediaBrowser: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

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

  return (
    <div className="w-[600px] max-h-[500px] flex flex-col bg-background/95 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl">
      {/* Search Bar */}
      <div className="px-5 pt-5 pb-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-muted-foreground transition-colors duration-200" />
          <Input
            type="text"
            placeholder="Search Unsplash"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-11 pr-4 h-11 bg-background/50 border-0 shadow-sm focus-visible:shadow-md focus-visible:ring-1 focus-visible:ring-primary/20 transition-all duration-200 rounded-xl"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-2.5 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={cn(
                "relative shrink-0 h-9 px-4 text-xs font-semibold rounded-full whitespace-nowrap transition-all duration-300 ease-out",
                "transform hover:scale-105 active:scale-95",
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                  : cn(
                      "bg-gradient-to-br",
                      category.color,
                      "text-white shadow-md hover:shadow-lg hover:shadow-black/10"
                    )
              )}
            >
              <span className="relative z-10">{category.label}</span>
              {selectedCategory === category.id && (
                <span className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
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
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20"
              >
                <img
                  src={photo.urls.small}
                  alt={
                    photo.altDescription ||
                    photo.description ||
                    "Unsplash photo"
                  }
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                  <p className="text-xs text-white font-semibold drop-shadow-lg">
                    by {photo.user.name}
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
