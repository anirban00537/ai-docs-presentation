"use client";

import React, { useState, useEffect } from "react";
import {
  IconCloudCheck,
  IconDots,
  IconChevronLeft,
  IconShare,
  IconPlayerPlayFilled,
  IconArrowBackUp,
  IconArrowForwardUp,
  IconMenu2,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useUndoRedo } from "@/app/(protected)/docs/[id]/hooks/useUndoRedo";
import { selectPresentation } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { useEditorTheme } from "../../engine";
import { cn } from "@/lib/utils";

interface EditorHeaderProps {
  onPresentClick: () => void;
  onMenuClick?: () => void;
}

export const EditorHeader = ({ onPresentClick, onMenuClick }: EditorHeaderProps) => {
  const theme = useEditorTheme();
  const router = useRouter();
  const presentation = useAppSelector(selectPresentation);
  const isDark = theme.themeType === "dark";
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  return (
    <div className="fixed top-0 left-0 z-[60] w-full">
      <div
        className="relative w-full px-4 md:px-6 h-16 flex items-center justify-between"
        style={{
          backgroundColor: isDark ? "rgba(18, 18, 22, 0.85)" : "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"}`,
        }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
          >
            <IconMenu2 size={20} style={{ color: theme.bodyColor }} />
          </button>

          <button
            onClick={() => router.push("/dashboard")}
            className="hidden sm:flex p-2 md:p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 group"
          >
            <IconChevronLeft
              size={20}
              className="opacity-50 group-hover:opacity-100 transition-opacity"
              style={{ color: theme.bodyColor }}
            />
          </button>

          <div className="hidden sm:block h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          <div className="flex flex-col min-w-0">
            <h1
              className="text-xs md:text-sm font-bold tracking-tight line-clamp-1 truncate max-w-[120px] md:max-w-[300px]"
              style={{ color: theme.bodyColor }}
            >
              {presentation?.title || "Untitled Presentation"}
            </h1>
            <div className="flex items-center gap-1 md:gap-1.5 mt-0.5">
              <IconCloudCheck size={10} className="text-emerald-500 shrink-0" />
              <span
                className="text-[10px] font-medium opacity-40 uppercase tracking-widest truncate hidden xs:inline"
                style={{ color: theme.bodyColor }}
              >
                Saved
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Undo/Redo - Hidden on very small screens */}
          <div className="hidden md:flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl mr-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 active:scale-90"
              title="Undo (Ctrl+Z)"
            >
              <IconArrowBackUp size={18} style={{ color: theme.bodyColor }} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 active:scale-90"
              title="Redo (Ctrl+Shift+Z)"
            >
              <IconArrowForwardUp size={18} style={{ color: theme.bodyColor }} />
            </button>
          </div>

          <button className="hidden sm:flex items-center gap-2 px-3 md:px-4 py-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-xs font-semibold">
            <IconShare size={16} style={{ color: theme.bodyColor }} />
            <span className="hidden md:inline" style={{ color: theme.bodyColor }}>Share</span>
          </button>

          <button
            onClick={onPresentClick}
            className="flex items-center justify-center gap-2 p-2.5 md:px-5 md:py-2.5 rounded-xl transition-all hover:shadow-lg active:scale-95 text-xs font-bold leading-none shadow-sm"
            style={{
              backgroundColor: theme.primary,
              color: "#ffffff"
            }}
          >
            <IconPlayerPlayFilled size={14} className="shrink-0" />
            <span className="hidden md:inline">Present</span>
          </button>

          <div className="hidden sm:block h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          <button className="p-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95">
            <IconDots size={20} style={{ color: theme.bodyColor }} />
          </button>
        </div>
      </div>
    </div>
  );
};
