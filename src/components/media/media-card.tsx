"use client";

import React from "react";
import {
  MoreVertical,
  Trash2,
  Download,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface MediaItem {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  url: string;
}

interface MediaCardProps {
  item: MediaItem;
  viewMode: "grid" | "list";
}

export function MediaCard({ item, viewMode }: MediaCardProps) {
  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out hover:border-border hover:bg-card hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] hover:-translate-y-1",
        viewMode === "grid"
          ? "aspect-video"
          : "flex items-center gap-3 p-3"
      )}
    >
      {viewMode === "grid" ? (
        <>
          {/* Grid View */}
          <div className="relative h-full w-full">
            <img
              src={item.url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 bg-background/95 backdrop-blur-sm"
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 bg-background/95 backdrop-blur-sm"
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 w-7 rounded-full bg-background/95 backdrop-blur-sm p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-3">
            <p className="truncate text-xs font-medium text-white">
              {item.name}
            </p>
            <p className="text-xs text-white/70">{item.size}</p>
          </div>
        </>
      ) : (
        <>
          {/* List View */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
            <img
              src={item.url}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {item.name}
            </p>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
              <span>{item.size}</span>
              <span>•</span>
              <span>{item.uploadedAt}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <Download className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
}

