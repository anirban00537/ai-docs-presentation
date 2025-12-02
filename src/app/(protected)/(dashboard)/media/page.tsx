"use client";

import React, { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Search,
  Grid3x3,
  List,
  MoreVertical,
  Trash2,
  Download,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Dummy media data for UI display (images only)
const dummyMedia = [
  {
    id: "1",
    name: "hero-image.jpg",
    type: "image",
    size: "2.4 MB",
    uploadedAt: "2 hours ago",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
  },
  {
    id: "2",
    name: "background.png",
    type: "image",
    size: "1.2 MB",
    uploadedAt: "3 days ago",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: "banner.jpg",
    type: "image",
    size: "4.1 MB",
    uploadedAt: "2 weeks ago",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "product-shot.jpg",
    type: "image",
    size: "3.5 MB",
    uploadedAt: "1 week ago",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    name: "landscape.jpg",
    type: "image",
    size: "5.2 MB",
    uploadedAt: "3 weeks ago",
    url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    name: "portrait.jpg",
    type: "image",
    size: "2.8 MB",
    uploadedAt: "1 month ago",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  },
];

const categories = ["All", "Recent", "Favorites"];

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const filteredMedia = dummyMedia.filter((item) => {
    const matchesCategory = selectedCategory === "All";
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <div className="flex h-full w-full flex-col overflow-auto">
        <div className="mx-auto w-full max-w-[1500px] px-6 py-12">
          {/* Header */}
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
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="h-9 w-9 p-0"
              >
                {viewMode === "grid" ? (
                  <List className="h-4 w-4" />
                ) : (
                  <Grid3x3 className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={() => setIsUploadModalOpen(true)}
                className="h-9"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* Search and Categories */}
          <div className="mb-8 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-10"
              />
            </div>
            <div className="flex items-center gap-1">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "h-9 rounded-md px-3 text-xs font-medium transition-colors",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
          {/* Media Grid/List */}
          {filteredMedia.length === 0 ? (
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
                <Button onClick={() => setIsUploadModalOpen(true)} size="lg">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "flex flex-col gap-2"
              )}
            >
              {filteredMedia.map((item) => {
                return (
                  <div
                    key={item.id}
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
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                              >
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
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsUploadModalOpen(false)}
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
                onClick={() => setIsUploadModalOpen(false)}
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
              <Button
                variant="ghost"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setIsUploadModalOpen(false)}>
                Upload
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
