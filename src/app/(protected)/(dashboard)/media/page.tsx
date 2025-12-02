"use client";

import React, { useState } from "react";
import {
  UploadModal,
  MediaGrid,
  MediaHeader,
  MediaSearch,
  type MediaItem,
} from "@/components/media";

// Dummy media data for UI display (images only)
const dummyMedia: MediaItem[] = [
  {
    id: "1",
    name: "hero-image.jpg",
    type: "image",
    size: "2.4 MB",
    uploadedAt: "2 hours ago",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "background.png",
    type: "image",
    size: "1.2 MB",
    uploadedAt: "3 days ago",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: "banner.jpg",
    type: "image",
    size: "4.1 MB",
    uploadedAt: "2 weeks ago",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "product-shot.jpg",
    type: "image",
    size: "3.5 MB",
    uploadedAt: "1 week ago",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    name: "landscape.jpg",
    type: "image",
    size: "5.2 MB",
    uploadedAt: "3 weeks ago",
    url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    name: "portrait.jpg",
    type: "image",
    size: "2.8 MB",
    uploadedAt: "1 month ago",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  },
];

const categories = ["All", "Recent", "Favorites"];

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filteredMedia = dummyMedia.filter((item) => {
    const matchesCategory = selectedCategory === "All";
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

          <MediaGrid
            items={filteredMedia}
            viewMode={viewMode}
            onUploadClick={() => setIsUploadModalOpen(true)}
          />
        </div>
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </>
  );
}
