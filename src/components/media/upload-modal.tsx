"use client";

import React, { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-background rounded-xl shadow-xl border border-border/50 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Upload Media
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Upload images, videos, or documents
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Upload Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            className={cn(
              "group relative rounded-lg border-2 border-dashed transition-all duration-200",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:border-primary/50 hover:bg-primary/5"
            )}
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
          >
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-2 text-base font-semibold text-foreground">
                Drop images here or click to upload
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Support for JPG, PNG, GIF, and WebP formats
              </p>
              <Button size="sm" variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Select Files
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/50 px-6 py-4">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Upload</Button>
        </div>
      </div>
    </div>
  );
}

