import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createBadgeContent, type BadgeContent } from "../definitions";
import { withAlpha } from "../utils";

interface BadgeBlockProps {
  block: Block;
  onUpdate: (content: BadgeContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const BadgeBlock: React.FC<BadgeBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as BadgeContent) ?? createBadgeContent();
  const { badges, layout } = content;

  const handleTitleChange = useCallback(
    (index: number, newContent: any) => {
      const newBadges = [...badges];
      newBadges[index] = {
        ...newBadges[index],
        title: newContent,
      };
      onUpdate({
        ...content,
        badges: newBadges,
      });
    },
    [badges, content, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (index: number, newContent: any) => {
      const newBadges = [...badges];
      newBadges[index] = {
        ...newBadges[index],
        description: newContent,
      };
      onUpdate({
        ...content,
        badges: newBadges,
      });
    },
    [badges, content, onUpdate]
  );

  const handleIssuerChange = useCallback(
    (index: number, newContent: any) => {
      const newBadges = [...badges];
      newBadges[index] = {
        ...newBadges[index],
        issuer: newContent,
      };
      onUpdate({
        ...content,
        badges: newBadges,
      });
    },
    [badges, content, onUpdate]
  );

  const gridClass =
    layout === "grid" ? "grid grid-cols-2 gap-6" : "flex flex-col gap-6";

  return (
    <div className={`${gridClass} w-full`}>
      {badges.map((badge, index) => (
        <div
          key={index}
          className="group flex gap-4 p-6 rounded-2xl transition-all hover:translate-y-[-2px] hover:shadow-lg duration-300"
          style={{
            backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
            backdropFilter: "blur(12px)",
            border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
            boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
          }}
        >
          {badge.icon && (
            <div
              className="shrink-0 w-16 h-16 rounded-xl flex items-center justify-center text-4xl transition-transform group-hover:scale-110 duration-300"
              style={{
                backgroundColor: withAlpha(theme.primary, 0.1),
              }}
            >
              {badge.icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <ProseMirrorEditor
                key={`${block.id}-title-${index}`}
                blockId={`${block.id}-title-${index}`}
                value={badge.title}
                onChange={(newContent) => handleTitleChange(index, newContent)}
                placeholder="Award Title"
                className="text-lg font-bold"
              />
            </div>
            {badge.description && (
              <div className="mb-2">
                <ProseMirrorEditor
                  key={`${block.id}-desc-${index}`}
                  blockId={`${block.id}-desc-${index}`}
                  value={badge.description}
                  onChange={(newContent) =>
                    handleDescriptionChange(index, newContent)
                  }
                  placeholder="Description"
                  className="text-sm opacity-80"
                />
              </div>
            )}
            <div className="flex items-center gap-2 mt-2">
              {badge.issuer && (
                <div>
                  <ProseMirrorEditor
                    key={`${block.id}-issuer-${index}`}
                    blockId={`${block.id}-issuer-${index}`}
                    value={badge.issuer}
                    onChange={(newContent) =>
                      handleIssuerChange(index, newContent)
                    }
                    placeholder="Issuer"
                    className="text-xs font-medium opacity-60"
                  />
                </div>
              )}
              {badge.date && (
                <span
                  className="text-xs opacity-50"
                  style={{ color: theme.bodyColor }}
                >
                  • {badge.date}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
