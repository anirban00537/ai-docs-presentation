"use client";

import React, { useState, useEffect } from "react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { cn } from "@/lib/utils";
import type { OutlineResponse } from "@/services/presentation";

interface OutlineViewerProps {
  outline: OutlineResponse | null;
  isLoading?: boolean;
  className?: string;
  editable?: boolean;
  onUpdate?: (outline: OutlineResponse) => void;
}

export const OutlineViewer: React.FC<OutlineViewerProps> = ({
  outline,
  isLoading = false,
  className,
  editable = false,
  onUpdate,
}) => {
  const [revealedItems, setRevealedItems] = useState<number>(0);
  const [localOutline, setLocalOutline] = useState<OutlineResponse | null>(
    outline
  );

  // Update local outline when prop changes
  useEffect(() => {
    if (outline) {
      setLocalOutline(outline);
      // For streaming, reveal items as they arrive
      if (outline.outlines.length > 0) {
        setRevealedItems(outline.outlines.length);
      }
    }
  }, [outline]);

  // Progressive reveal animation (only if not streaming)
  useEffect(() => {
    if (!localOutline || isLoading) {
      setRevealedItems(0);
      return;
    }

    // If we're in streaming mode (items arriving progressively), don't animate
    // Otherwise, animate the reveal
    const totalItems = localOutline.outlines.length;
    if (totalItems > 0 && revealedItems < totalItems) {
      const timers: NodeJS.Timeout[] = [];
      for (let i = revealedItems; i <= totalItems; i++) {
        const timer = setTimeout(() => {
          setRevealedItems(i);
        }, (i - revealedItems) * 100);
        timers.push(timer);
      }

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }
  }, [localOutline, isLoading, revealedItems]);

  if (isLoading) {
    return (
      <div className={cn("w-full space-y-4", className)}>
        <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-xl bg-white dark:bg-card p-6 shadow-sm border space-y-2"
            >
              <div className="h-6 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!localOutline) {
    return null;
  }

  const handleContentChange = (index: number, newContent: string) => {
    if (!localOutline) return;

    const updatedOutlines = [...localOutline.outlines];
    updatedOutlines[index] = { ...updatedOutlines[index], content: newContent };

    const updatedOutline: OutlineResponse = {
      ...localOutline,
      outlines: updatedOutlines,
    };

    setLocalOutline(updatedOutline);
    onUpdate?.(updatedOutline);
  };

  return (
    <div
      className={cn("w-full space-y-6 transition-all duration-300", className)}
    >
      {/* Title */}
      <div className="mb-8">
        {editable ? (
          <input
            type="text"
            value={localOutline.title}
            onChange={(e) => {
              const updated = { ...localOutline, title: e.target.value };
              setLocalOutline(updated);
              onUpdate?.(updated);
            }}
            className="text-3xl font-bold text-foreground bg-transparent border-b-2 border-transparent hover:border-muted focus:border-primary focus:outline-none w-full"
          />
        ) : (
          <h1 className="text-3xl font-bold text-foreground">
            {localOutline.title}
          </h1>
        )}
      </div>

      {/* Outline Items */}
      <div className="space-y-4">
        {localOutline.outlines.map((item, index) => {
          const isVisible = index < revealedItems;
          if (!isVisible) return null;

          return (
            <div
              key={index}
              className={cn(
                "rounded-xl bg-white dark:bg-card p-6 shadow-sm border transition-all duration-300",
                "hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800",
                !isLoading && "animate-in fade-in-0 slide-in-from-bottom-4"
              )}
              style={{
                animationDelay: isLoading ? undefined : `${index * 100}ms`,
              }}
            >
              <div className="flex gap-4">
                {/* Number Badge */}
                <div className="shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xl shadow-sm">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <MarkdownViewer
                    content={item.content}
                    editable={editable}
                    onChange={(newContent) =>
                      handleContentChange(index, newContent)
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
