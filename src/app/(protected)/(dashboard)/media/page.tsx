"use client";

import React, { useState, useMemo } from "react";
import {
  UploadModal,
  MediaGrid,
  MediaHeader,
  MediaSearch,
} from "@/components/media";
import { useListMedia } from "@/hooks/use-images";

const categories = ["All", "Recent", "Favorites"];

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [page] = useState(1);

  // Map category to API category
  const apiCategory = useMemo(() => {
    if (selectedCategory === "Favorites") return "favorites";
    if (selectedCategory === "Recent") return "recent";
    return "all";
  }, [selectedCategory]);

  // Fetch media from API
  const {
    data: mediaResponse,
    isLoading,
    error,
  } = useListMedia({
    page,
    perPage: 20,
    search: searchQuery || undefined,
    category: apiCategory as "all" | "recent" | "favorites",
  });

  const mediaItems = mediaResponse?.data?.list || [];

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-auto">
        <div className="mx-auto w-full max-w-[1500px] px-6 py-12">
          <MediaHeader
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onUploadClick={() => setIsUploadModalOpen(true)}
          />

          <MediaSearch
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {isLoading ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">
                  Loading media...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[500px] items-center justify-center">
              <div className="flex max-w-md flex-col items-center gap-6 text-center">
                <div className="rounded-full bg-destructive/10 p-4">
                  <p className="text-destructive text-sm font-medium">
                    Failed to load media
                  </p>
                </div>
                <p className="text-muted-foreground">
                  {error instanceof Error ? error.message : "An error occurred"}
                </p>
              </div>
            </div>
          ) : (
            <MediaGrid
              items={mediaItems}
              viewMode={viewMode}
              onUploadClick={() => setIsUploadModalOpen(true)}
            />
          )}
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
