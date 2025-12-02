"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { MediaCard } from "./media-card";
import { EmptyState } from "./empty-state";
import type { MediaItem } from "@/services/images";

interface MediaGridProps {
  items: MediaItem[];
  viewMode: "grid" | "list";
  onUploadClick: () => void;
  onDelete?: () => void;
}

export function MediaGrid({
  items,
  viewMode,
  onUploadClick,
  onDelete,
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
        <MediaCard
          key={item.id}
          item={item}
          viewMode={viewMode}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

