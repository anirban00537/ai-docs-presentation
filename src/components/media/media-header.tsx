"use client";

import React from "react";
import { Upload, Grid3x3, List } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MediaHeaderProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  onUploadClick: () => void;
}

export function MediaHeader({
  viewMode,
  onViewModeChange,
  onUploadClick,
}: MediaHeaderProps) {
  return (
    <div className="mb-10 flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Media
        </h1>
        <p className="text-base text-muted-foreground">
          Upload and manage your images
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewModeChange(viewMode === "grid" ? "list" : "grid")}
          className="h-9 w-9 p-0"
        >
          {viewMode === "grid" ? (
            <List className="h-4 w-4" />
          ) : (
            <Grid3x3 className="h-4 w-4" />
          )}
        </Button>
        <Button size="sm" onClick={onUploadClick} className="h-9">
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </div>
    </div>
  );
}

