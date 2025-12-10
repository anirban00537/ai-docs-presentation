import React from "react";
import { useAppSelector } from "@/store/hooks";
import {
  selectPresentation,
  selectTheme,
  DEFAULT_THEME,
} from "@/store/slices/slidesSlice";
import { Button } from "@/components/ui/button";
import { IconShare, IconPlayerPlay } from "@tabler/icons-react";

export const PresentationTopBar: React.FC = () => {
  const presentation = useAppSelector(selectPresentation);
  const theme = useAppSelector(selectTheme) || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";
  const accent = isDark ? "#60a5fa" : "#2563eb"; // tailwind blue-400 / blue-600
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#cbd5e1" : "#475569";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb";

  if (!presentation) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b"
      style={{
        backgroundColor: isDark ? "rgba(10,10,12,0.9)" : "rgba(255,255,255,0.94)",
        borderColor,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-lg font-semibold truncate max-w-md"
              style={{ color: textPrimary }}
            >
              {presentation.title || "Untitled Presentation"}
            </h1>
            {presentation.description && (
              <span
                className="text-sm truncate max-w-xs"
                style={{ color: textSecondary, opacity: 0.7 }}
              >
                {presentation.description}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {presentation.version > 1 && (
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: isDark ? "rgba(96,165,250,0.16)" : "rgba(37,99,235,0.12)",
                  color: accent,
                }}
              >
                v{presentation.version}
              </span>
            )}
            {presentation.isPublic && (
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: isDark ? "rgba(96,165,250,0.16)" : "rgba(37,99,235,0.12)",
                  color: accent,
                }}
              >
                Public
              </span>
            )}
            {presentation.isTemplate && (
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: isDark ? "rgba(96,165,250,0.16)" : "rgba(37,99,235,0.12)",
                  color: accent,
                }}
              >
                Template
              </span>
            )}
            {/* Action Buttons */}
            <div
              className="flex items-center gap-2 ml-2 pl-2 border-l"
              style={{ borderColor }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-2"
                style={{
                  color: textPrimary,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(37,99,235,0.12)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
                title="Share presentation"
              >
                <IconShare className="size-4" />
                <span className="text-sm">Share</span>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="h-8 px-3 gap-2"
                style={{
                  backgroundColor: accent,
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark
                    ? "rgba(96,165,250,0.9)"
                    : "rgba(37,99,235,0.9)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = accent;
                }}
                title="Present"
              >
                <IconPlayerPlay className="size-4" />
                <span className="text-sm">Present</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
