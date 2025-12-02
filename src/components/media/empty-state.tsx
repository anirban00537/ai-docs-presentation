"use client";

import React from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onUploadClick: () => void;
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="flex max-w-md flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <ImageIcon className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">
            No images yet
          </h2>
          <p className="text-muted-foreground">
            Upload your first image to get started
          </p>
        </div>
        <Button onClick={onUploadClick} size="lg">
          <Upload className="mr-2 h-4 w-4" />
          Upload Image
        </Button>
      </div>
    </div>
  );
}

