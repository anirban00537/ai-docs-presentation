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
  IconCircleFilled,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useUndoRedo } from "@/app/(protected)/docs/[id]/hooks/useUndoRedo";
import { selectPresentation } from "@/store/slices/slidesSlice";
import { useAppSelector } from "@/store/hooks";
import { useEditorTheme } from "../../engine";

interface EditorHeaderProps {
  onPresentClick: () => void;
}

export const EditorHeader = ({ onPresentClick }: EditorHeaderProps) => {
  const theme = useEditorTheme();
  const router = useRouter();
  const presentation = useAppSelector(selectPresentation);
  const isDark = theme.themeType === "dark";
  const { undo, redo, canUndo, canRedo } = useUndoRedo();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 z-50 w-full"
    >
      <div
        className="relative w-full px-6 h-16 flex items-center justify-between"
        style={{
          backgroundColor: isDark ? "rgba(18, 18, 22, 0.8)" : "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.05)"}`,
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 group"
          >
            <IconChevronLeft
              size={20}
              className="opacity-50 group-hover:opacity-100 transition-opacity"
              style={{ color: theme.bodyColor }}
            />
          </button>

          <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          <div className="flex flex-col">
            <h1
              className="text-sm font-bold tracking-tight line-clamp-1"
              style={{ color: theme.bodyColor }}
            >
              {presentation?.title || "Untitled Presentation"}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <IconCloudCheck size={12} className="text-emerald-500" />
              <span
                className="text-[10px] font-medium opacity-40 uppercase tracking-widest"
                style={{ color: theme.bodyColor }}
              >
                Saved to cloud
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/5 dark:bg-white/5 p-1 rounded-xl mr-2">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 active:scale-90"
              title="Undo (Ctrl+Z)"
            >
              <IconArrowBackUp size={18} style={{ color: theme.bodyColor }} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 rounded-lg transition-all hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-20 active:scale-90"
              title="Redo (Ctrl+Shift+Z)"
            >
              <IconArrowForwardUp size={18} style={{ color: theme.bodyColor }} />
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95 text-xs font-semibold">
            <IconShare size={16} style={{ color: theme.bodyColor }} />
            <span style={{ color: theme.bodyColor }}>Share</span>
          </button>

          <button
            onClick={onPresentClick}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl transition-all hover:shadow-lg active:scale-95 text-xs font-bold leading-none shadow-sm"
            style={{
              backgroundColor: theme.primary,
              color: "#ffffff"
            }}
          >
            <IconPlayerPlayFilled size={14} />
            <span>Present</span>
          </button>

          <div className="h-4 w-[1px] bg-black/10 dark:bg-white/10 mx-1" />

          <button className="p-2.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-95">
            <IconDots size={20} style={{ color: theme.bodyColor }} />
          </button>
        </div>
      </div>
    </div>
  );
};
