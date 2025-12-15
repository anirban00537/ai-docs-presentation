"use client";

import React, { useState, useEffect } from "react";
import { MarkdownViewer } from "@/components/markdown-viewer/markdown-viewer";
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
        <div className="h-8 w-3/4 animate-pulse rounded-xl bg-muted/30" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl p-6 space-y-2 animate-pulse"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(16px) saturate(180%)",
                WebkitBackdropFilter: "blur(16px) saturate(180%)",
                boxShadow: `
                  0 1px 0 0 rgba(255, 255, 255, 0.8) inset,
                  0 4px 16px rgba(0, 0, 0, 0.06)
                `,
              }}
            >
              <div className="h-6 w-2/3 rounded-xl bg-muted/40" />
              <div className="h-4 w-full rounded-xl bg-muted/30" />
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
                "relative rounded-2xl p-6 overflow-hidden transition-all duration-300",
                "hover:scale-[1.01]",
                !isLoading && "animate-in fade-in-0 slide-in-from-bottom-4"
              )}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                backdropFilter: "blur(16px) saturate(180%)",
                WebkitBackdropFilter: "blur(16px) saturate(180%)",
                boxShadow: `
                  0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                  0 -1px 0 0 rgba(0, 0, 0, 0.03) inset,
                  1px 0 0 0 rgba(255, 255, 255, 0.7) inset,
                  -1px 0 0 0 rgba(0, 0, 0, 0.02) inset,
                  0 4px 16px rgba(0, 0, 0, 0.06),
                  0 1px 4px rgba(0, 0, 0, 0.03)
                `,
                animationDelay: isLoading ? undefined : `${index * 100}ms`,
              }}
            >
              {/* Glass shine overlay */}
              <div 
                className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, transparent 70%, rgba(255, 255, 255, 0.15) 100%)",
                }}
              />
              
              <div className="relative flex gap-4">
                {/* Number Badge */}
                <div className="shrink-0">
                  <div 
                    className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-bold text-xl"
                    style={{
                      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
                      boxShadow: `
                        0 4px 12px rgba(139, 92, 246, 0.3),
                        0 1px 0 0 rgba(255, 255, 255, 0.2) inset
                      `,
                    }}
                  >
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
