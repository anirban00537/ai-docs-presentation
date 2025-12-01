"use client";

import React, { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchUnsplashPhotos, useRandomUnsplashPhotos } from "@/hooks/use-images";
import { useDebouncedCallback } from "use-debounce";
import type { UnsplashPhoto } from "@/services/images";

const categories = [
  { id: "gradient", label: "Gradient", color: "from-pink-500 via-purple-500 to-orange-500", searchQuery: "gradient" },
  { id: "data", label: "Data", color: "from-green-900 to-black", searchQuery: "data visualization" },
  { id: "abstract", label: "Abstract", color: "from-purple-600 to-blue-600", searchQuery: "abstract" },
  { id: "tech", label: "Tech", color: "from-gray-900 to-black", searchQuery: "technology" },
  { id: "3d", label: "3D Shapes", color: "from-blue-600 to-purple-600", searchQuery: "3d shapes" },
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

  const randomPhotosQuery = useRandomUnsplashPhotos(
    { count: 20 },
    !hasQuery
  );

  // Get the active query result
  const activeQuery = hasQuery ? searchQueryResult : randomPhotosQuery;
  const photos = useMemo(() => {
    if (!activeQuery.data?.data) return [];
    
    if (hasQuery) {
      const searchData = activeQuery.data.data as { results: UnsplashPhoto[] };
      return searchData?.results || [];
    } else {
      const randomData = activeQuery.data.data as UnsplashPhoto | UnsplashPhoto[];
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
    <div className="w-[600px] max-h-[500px] flex flex-col bg-background">
      {/* Search Bar */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search Unsplash"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 border-2 focus-visible:border-primary"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="px-4 py-3 border-b flex items-center gap-2 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => handleCategoryClick(category.id)}
            className={cn(
              "h-8 px-3 text-xs font-medium rounded-md whitespace-nowrap transition-all",
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "bg-gradient-to-br " + category.color + " text-white border-0 hover:opacity-90"
            )}
          >
            {category.label}
          </Button>
        ))}
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeQuery.isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : activeQuery.isError ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-muted-foreground">
              Failed to load images. Please try again.
            </p>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-muted-foreground">
              No images found. Try a different search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              >
                <img
                  src={photo.urls.small}
                  alt={photo.altDescription || photo.description || "Unsplash photo"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-xs text-white font-medium">
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

