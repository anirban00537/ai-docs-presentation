"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MediaCard, type MediaItem } from "./media-card";
import { EmptyState } from "./empty-state";

interface MediaGridProps {
  items: MediaItem[];
  viewMode: "grid" | "list";
  onUploadClick: () => void;
}

export function MediaGrid({
  items,
  viewMode,
  onUploadClick,
}: MediaGridProps) {
  if (items.length === 0) {
    return <EmptyState onUploadClick={onUploadClick} />;
  }

  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "flex flex-col gap-2"
      )}
    >
      {items.map((item) => (
        <MediaCard key={item.id} item={item} viewMode={viewMode} />
      ))}
    </div>
  );
}

