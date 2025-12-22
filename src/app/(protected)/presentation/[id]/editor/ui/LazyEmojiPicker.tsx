"use client";

import React, { lazy, Suspense, memo } from "react";
import type { EmojiClickData } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Lazy load the emoji picker - this is a heavy component (~200KB)
const EmojiPickerComponent = lazy(() => import("emoji-picker-react"));

// Re-export the type for convenience
export type { EmojiClickData };

interface LazyEmojiPickerProps {
  onEmojiClick: (emojiData: EmojiClickData) => void;
}

/**
 * Loading placeholder for the emoji picker
 */
const EmojiPickerSkeleton = memo(function EmojiPickerSkeleton() {
  return (
    <div className="w-[350px] h-[400px] flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />
        <span className="text-sm text-gray-500">Loading emojis...</span>
      </div>
    </div>
  );
});

/**
 * Lazy-loaded emoji picker component
 * Use this instead of importing emoji-picker-react directly
 */
export const LazyEmojiPicker = memo(function LazyEmojiPicker({
  onEmojiClick,
}: LazyEmojiPickerProps) {
  return (
    <Suspense fallback={<EmojiPickerSkeleton />}>
      <EmojiPickerComponent onEmojiClick={onEmojiClick} />
    </Suspense>
  );
});

interface EmojiPickerTriggerProps {
  /** Current emoji/icon to display */
  icon: string;
  /** Callback when emoji is selected */
  onEmojiSelect: (emoji: string) => void;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Additional class names for the trigger button */
  className?: string;
  /** Size of the trigger button text */
  size?: "sm" | "md" | "lg" | "xl";
  /** Background style */
  backgroundColor?: string;
  /** Title/tooltip for the button */
  title?: string;
}

const sizeClasses = {
  sm: "text-lg w-8 h-8",
  md: "text-2xl w-10 h-10",
  lg: "text-3xl w-12 h-12",
  xl: "text-5xl w-16 h-16",
};

/**
 * Complete emoji picker with popover trigger
 * This is the most common use case - a button that opens the emoji picker
 */
export const EmojiPickerTrigger = memo(function EmojiPickerTrigger({
  icon,
  onEmojiSelect,
  disabled = false,
  className = "",
  size = "md",
  backgroundColor,
  title = "Change icon",
}: EmojiPickerTriggerProps) {
  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
  };

  if (disabled) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center ${className}`}
        style={{ backgroundColor }}
      >
        {icon}
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`${sizeClasses[size]} rounded-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer outline-none ${className}`}
          style={{ backgroundColor }}
          title={title}
        >
          {icon}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 border-none shadow-xl">
        <LazyEmojiPicker onEmojiClick={handleEmojiClick} />
      </PopoverContent>
    </Popover>
  );
});
