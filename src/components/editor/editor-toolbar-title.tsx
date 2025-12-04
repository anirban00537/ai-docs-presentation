"use client";

import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectPresentationTitle,
  selectPresentationId,
  updatePresentationTitle,
} from "@/store/slices/slidesSlice";
import { useDebouncedCallback } from "use-debounce";
import { useUpdatePresentationTitle } from "@/hooks/use-presentation";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";

export const EditorToolbarTitle: React.FC = () => {
  const router = useRouter();
  const presentationTitle = useAppSelector(selectPresentationTitle);
  const presentationId = useAppSelector(selectPresentationId);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const dispatch = useAppDispatch();
  const updateTitleMutation = useUpdatePresentationTitle();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const isDarkTheme = globalTheme?.tone === "dark";

  // Use local title when editing, otherwise use Redux title
  const displayTitle = isEditingTitle
    ? localTitle
    : presentationTitle || "Untitled Presentation";

  // Debounced update to Redux and API
  const debouncedUpdateTitle = useDebouncedCallback((value: string) => {
    // Update Redux state immediately for UI responsiveness
    dispatch(updatePresentationTitle({ title: value }));

    // Update API only if we have a presentationId and the title is not empty
    if (presentationId && value.trim().length > 0) {
      updateTitleMutation.mutate({
        id: presentationId,
        title: value.trim(),
      });
    }
  }, 500);

  return (
    <div
      className={cn(
        "pointer-events-auto overflow-hidden flex items-center px-4 h-11 transition-all duration-300 rounded-2xl",
        // Simple border and shadow - theme-aware
        isDarkTheme
          ? "border border-neutral-800 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]"
          : "border border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]"
      )}
      style={{
        // Use darker colors from globals.css - theme-aware
        backgroundColor: isDarkTheme ? "oklch(0.1 0.01 250)" : "oklch(1 0 0)",
        // Simple shadow without 3D effects
        boxShadow: isDarkTheme
          ? "0 8px 32px 0 rgba(0, 0, 0, 0.4)"
          : "0 8px 32px 0 rgba(0, 0, 0, 0.12)",
      }}
    >
      <div className="flex items-center gap-5">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "transition-colors h-8 w-8 hover:bg-accent/50 rounded-md",
            isDarkTheme
              ? "text-white/80 hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => router.push("/my-presentations")}
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div
          className={cn(
            "h-5 w-px",
            isDarkTheme ? "bg-white/20" : "bg-border/60"
          )}
        />
        <div className="relative flex items-center min-w-0">
          <input
            ref={titleInputRef}
            type="text"
            value={displayTitle}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalTitle(newValue);
              debouncedUpdateTitle(newValue);
            }}
            onFocus={() => {
              setIsEditingTitle(true);
              setLocalTitle(presentationTitle || "Untitled Presentation");
            }}
            onBlur={() => {
              setIsEditingTitle(false);
              setLocalTitle("");
            }}
            className={cn(
              "text-sm font-semibold cursor-text tracking-tight focus:outline-none bg-transparent border-none p-0 min-w-0 max-w-[300px]",
              isDarkTheme
                ? "text-white/90 placeholder:text-white/50"
                : "text-foreground/85"
            )}
            placeholder="Untitled Presentation"
          />
        </div>
      </div>
    </div>
  );
};

