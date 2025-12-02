"use client";

import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MediaSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function MediaSearch({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
}: MediaSearchProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search images..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-10"
        />
      </div>
      <div className="flex items-center gap-1">
        {categories.map((category) => (
          <Button
            key={category}
            variant="ghost"
            size="sm"
            onClick={() => onCategoryChange(category)}
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
  );
}

