"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeEditor } from "./theme-editor";
import type { GlobalTheme } from "@/store/slices/slidesSlice";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/hooks/use-themes";
import { useAppSelector } from "@/store/hooks";
import { selectGlobalTheme } from "@/store/slices/slidesSlice";
import { cn } from "@/lib/utils";

interface ThemeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeId?: string; // If provided, edit mode; otherwise, create mode
  theme?: GlobalTheme; // Optional initial theme data
}

export function ThemeModal({
  open,
  onOpenChange,
  themeId,
  theme,
}: ThemeModalProps) {
  // Fetch theme data if editing
  const { isLoading: isLoadingTheme } = useTheme(themeId || null);
  const globalTheme = useAppSelector(selectGlobalTheme);
  const isDarkTheme = globalTheme?.tone === "dark";

  const handleSuccess = () => {
    // Close modal after successful save/update
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          isDarkTheme
            ? "bg-black border-white/10"
            : "bg-background border-border"
        )}
      >
        <DialogHeader>
          <DialogTitle
            className={cn(
              isDarkTheme ? "text-white/90" : "text-foreground"
            )}
          >
            {themeId ? "Edit Theme" : "Create New Theme"}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoadingTheme && themeId ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
                <p
                  className={cn(
                    "text-xs font-medium",
                    isDarkTheme
                      ? "text-white/60"
                      : "text-muted-foreground/60"
                  )}
                >
                  Loading theme...
                </p>
              </div>
            </div>
          ) : (
            <ThemeEditor
              theme={theme}
              themeId={themeId}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

