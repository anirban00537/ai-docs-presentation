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

  if (!presentation) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm border-b"
      style={{
        backgroundColor: theme.cardBackground + "E6",
        borderColor: `${theme.primary}20`,
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1
              className="text-lg font-semibold truncate max-w-md"
              style={{ color: theme.headingColor }}
            >
              {presentation.title || "Untitled Presentation"}
            </h1>
            {presentation.description && (
              <span
                className="text-sm truncate max-w-xs"
                style={{ color: theme.bodyColor, opacity: 0.7 }}
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
                  backgroundColor: theme.primary + "15",
                  color: theme.primary,
                }}
              >
                v{presentation.version}
              </span>
            )}
            {presentation.isPublic && (
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: theme.primary + "15",
                  color: theme.primary,
                }}
              >
                Public
              </span>
            )}
            {presentation.isTemplate && (
              <span
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: theme.primary + "15",
                  color: theme.primary,
                }}
              >
                Template
              </span>
            )}
            {/* Action Buttons */}
            <div
              className="flex items-center gap-2 ml-2 pl-2 border-l"
              style={{ borderColor: `${theme.primary}20` }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 gap-2"
                style={{
                  color: theme.bodyColor,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary + "15";
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
                  backgroundColor: theme.primary,
                  color: "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary + "DD";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary;
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
