"use client";

import React, { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Video,
  File,
  Search,
  Filter,
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

// Dummy media data for UI display
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
    name: "product-video.mp4",
    type: "video",
    size: "15.8 MB",
    uploadedAt: "1 day ago",
    url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
  },
  {
    id: "3",
    name: "background.png",
    type: "image",
    size: "1.2 MB",
    uploadedAt: "3 days ago",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&h=300&fit=crop",
  },
  {
    id: "4",
    name: "presentation.pdf",
    type: "file",
    size: "3.5 MB",
    uploadedAt: "1 week ago",
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=300&fit=crop",
  },
  {
    id: "5",
    name: "banner.jpg",
    type: "image",
    size: "4.1 MB",
    uploadedAt: "2 weeks ago",
    url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=300&fit=crop",
  },
  {
    id: "6",
    name: "demo-video.mp4",
    type: "video",
    size: "28.3 MB",
    uploadedAt: "3 weeks ago",
    url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=400&h=300&fit=crop",
  },
];

const categories = ["All", "Images", "Videos", "Documents"];

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const filteredMedia = dummyMedia.filter((item) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "Images" && item.type === "image") ||
      (selectedCategory === "Videos" && item.type === "video") ||
      (selectedCategory === "Documents" && item.type === "file");
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      default:
        return File;
    }
  };

  return (
    <div className="flex h-full w-full max-w-full flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Media</h1>
            <p className="text-sm text-muted-foreground">
              Upload and manage your media files
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="h-9"
            >
              {viewMode === "grid" ? (
                <List className="h-4 w-4" />
              ) : (
                <Grid3x3 className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button size="sm" className="h-9">
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Categories */}
      <div className="border-b bg-background/50 px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "h-9 rounded-full px-4 text-xs font-medium transition-all",
                  selectedCategory === category &&
                    "bg-primary text-primary-foreground"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Upload Area */}
        <div
          className={cn(
            "group relative mb-6 rounded-xl border-2 border-dashed transition-all duration-200",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border/50 bg-muted/20 hover:border-primary/50 hover:bg-primary/5"
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
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Drop files here or click to upload
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Support for images, videos, and documents
            </p>
            <Button size="sm" variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Select Files
            </Button>
          </div>
        </div>

        {/* Media Grid/List */}
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 rounded-full bg-muted p-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              No media found
            </h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search"
                : "Upload your first media file"}
            </p>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
                : "flex flex-col gap-2"
            )}
          >
            {filteredMedia.map((item) => {
              const Icon = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-lg",
                    viewMode === "grid"
                      ? "aspect-square"
                      : "flex items-center gap-4 p-3"
                  )}
                >
                  {viewMode === "grid" ? (
                    <>
                      {/* Grid View */}
                      <div className="relative h-full w-full">
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted/50">
                            <Icon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/40" />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-all duration-200 group-hover:opacity-100">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-9 shadow-lg"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-9 shadow-lg"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm p-0 shadow-lg"
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
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-3">
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
                        {item.type === "image" ? (
                          <img
                            src={item.url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-muted/50">
                            <Icon className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {item.name}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{item.size}</span>
                          <span>•</span>
                          <span>{item.uploadedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <Button size="sm" variant="ghost" className="h-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8">
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
  );
}
