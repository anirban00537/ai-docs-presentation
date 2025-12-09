"use client";

import React, { useState, useEffect } from "react";
import { MarkdownViewer } from "@/components/markdown-viewer";
import { cn } from "@/lib/utils";
import type { OutlineResponse } from "@/services/presentation";

interface OutlineViewerProps {
  outline: OutlineResponse | null;
  isLoading?: boolean;
  className?: string;
}

export const OutlineViewer: React.FC<OutlineViewerProps> = ({
  outline,
  isLoading = false,
  className,
}) => {
  const [revealedItems, setRevealedItems] = useState<number>(0);

  // Progressive reveal animation (simulate streaming)
  useEffect(() => {
    if (!outline || isLoading) {
      setRevealedItems(0);
      return;
    }

    setRevealedItems(0);
    const totalItems = outline.outlines.length;

    // Reveal items one by one
    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i <= totalItems; i++) {
      const timer = setTimeout(() => {
        setRevealedItems(i);
      }, i * 150); // 150ms delay between each item
      timers.push(timer);
    }

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [outline, isLoading]);

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

  if (!outline) {
    return null;
  }

  return (
    <div
      className={cn("w-full space-y-6 transition-all duration-300", className)}
    >
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{outline.title}</h1>
      </div>

      {/* Outline Items */}
      <div className="space-y-4">
        {outline.outlines.map((item, index) => {
          const isVisible = index < revealedItems;
          if (!isVisible) return null;

          return (
            <div
              key={index}
              className={cn(
                "rounded-xl bg-white dark:bg-card p-6 shadow-sm border transition-all duration-300",
                "hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800",
                "animate-in fade-in-0 slide-in-from-bottom-4"
              )}
              style={{
                animationDelay: `${index * 150}ms`,
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
                  <MarkdownViewer content={item.content} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
