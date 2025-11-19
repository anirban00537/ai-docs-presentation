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
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Image
        </label>
      </div>
      {backgroundImage ? (
        <div className="space-y-3">
          <div className="relative w-full h-40 rounded-xl overflow-hidden border border-border/60 group bg-muted/20 shadow-sm">
            <img
              src={backgroundImage}
              alt="Background"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-xs font-medium"
                onClick={onImageRemove}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={handleFileUpload}
          className="w-full h-24 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <span className="text-lg text-muted-foreground group-hover:text-primary transition-colors">+</span>
          </div>
          <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
            Upload Image
          </span>
        </button>
      )}
    </div>
  );
}

