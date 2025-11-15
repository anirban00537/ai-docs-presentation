"use client";

import React from "react";
import { Button } from "@/components/ui/button";

interface BackgroundImageSectionProps {
  backgroundImage: string | undefined;
  onImageUpload: (imageData: string) => void;
  onImageRemove: () => void;
}

export function BackgroundImageSection({
  backgroundImage,
  onImageUpload,
  onImageRemove,
}: BackgroundImageSectionProps) {
  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          onImageUpload(result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-1 w-1 rounded-full bg-primary"></div>
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Image
        </label>
      </div>
      {backgroundImage ? (
        <div className="space-y-3">
          <div className="relative w-full h-36 rounded-xl overflow-hidden border-2 border-border/60 group bg-muted/20">
            <img
              src={backgroundImage}
              alt="Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <Button
            variant="outline"
            className="w-full h-11 border-2 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive transition-all rounded-xl font-semibold"
            onClick={onImageRemove}
          >
            Remove Image
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full h-12 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/10 hover:text-primary transition-all rounded-xl font-semibold bg-gradient-to-br from-primary/5 to-transparent"
          onClick={handleFileUpload}
        >
          <span className="text-base">+</span>
          <span>Upload Background Image</span>
        </Button>
      )}
    </div>
  );
}

