"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectPresentation,
  selectTheme,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import {
  IconShare,
  IconPlayerPlay,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconChevronLeft,
} from "@tabler/icons-react";
import { useUndoRedo } from "@/app/(protected)/docs/[id]/hooks/useUndoRedo";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const EditorHeader: React.FC<{
  onPresentClick?: () => void;
}> = ({ onPresentClick }) => {
  const router = useRouter();
  const presentation = useAppSelector(selectPresentation);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const isDark = theme.themeType === "dark";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  const handleBack = () => {
    router.push("/my-docs");
  };

  return (
    <div
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-6xl px-4"
    >
      <div
        className="relative w-full px-5 py-3 rounded-2xl overflow-hidden"
        style={{
          backgroundColor: isDark
            ? "rgba(30, 30, 40, 0.5)"
            : "rgba(255, 255, 255, 0.5)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          boxShadow: isDark
            ? `
              0 1px 0 0 rgba(255, 255, 255, 0.1) inset,
              0 -1px 0 0 rgba(0, 0, 0, 0.2) inset,
              0 8px 40px rgba(0, 0, 0, 0.4),
              0 2px 8px rgba(0, 0, 0, 0.2)
            `
            : `
              0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
              0 -1px 0 0 rgba(0, 0, 0, 0.05) inset,
              0 8px 40px rgba(0, 0, 0, 0.08),
              0 2px 8px rgba(0, 0, 0, 0.04)
            `,
        }}
      >
        {/* Glass shine overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.02) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.3) 100%)",
          }}
        />
        
        <div className="relative flex items-center justify-between">
          {/* Left side - Back button & Title */}
          <div className="flex items-center gap-2">
            {/* Back Button */}
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleBack}
                    className="p-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/10"
                    style={{ color: textSecondary }}
                  >
                    <IconChevronLeft size={20} stroke={1.5} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Back to presentations
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Divider */}
            <div
              className="w-px h-5"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)",
              }}
            />

            {/* Title */}
            <h1
              className="text-sm font-medium truncate max-w-md"
              style={{ color: textPrimary }}
            >
              {presentation?.title || "Untitled Presentation"}
            </h1>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-1">
            {/* Undo/Redo Buttons */}
            <TooltipProvider delayDuration={200}>
              <div className="flex items-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                      onClick={undo}
                      disabled={!canUndo}
                      style={{ color: textSecondary }}
                    >
                      <IconArrowBackUp size={18} stroke={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Undo <span className="opacity-50 ml-1">⌘Z</span>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30"
                      onClick={redo}
                      disabled={!canRedo}
                      style={{ color: textSecondary }}
                    >
                      <IconArrowForwardUp size={18} stroke={1.5} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Redo <span className="opacity-50 ml-1">⌘⇧Z</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            {/* Divider */}
            <div
              className="w-px h-4 mx-2"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)",
              }}
            />

            {/* Share Button */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:bg-black/5 dark:hover:bg-white/5"
              style={{ color: textSecondary }}
            >
              <IconShare size={16} stroke={1.5} />
              <span>Share</span>
            </button>

            {/* Present Button */}
            <button
              onClick={onPresentClick}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{
                backgroundColor: theme.primary,
              }}
            >
              <IconPlayerPlay size={16} stroke={1.5} />
              <span>Present</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

