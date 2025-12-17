import React, { useCallback, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createBadgeContent, type BadgeContent } from "../definitions";
import { BlockWrapper } from "../BlockWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { createParagraphContent } from "../definitions/common";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface BadgeBlockProps {
  block: Block;
  onUpdate: (content: BadgeContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const BadgeBlock: React.FC<BadgeBlockProps> = ({
  block,
  onUpdate,
  theme,
  readOnly = false,
}) => {
  const content = (block.content as BadgeContent) ?? createBadgeContent();
  const { badges, layout } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempLayout, setTempLayout] = useState<"grid" | "list">(layout);
  const isDark = theme.themeType === "dark";

  const handleIconChange = useCallback(
    (index: number, emoji: string) => {
      const newBadges = [...badges];
      newBadges[index] = { ...newBadges[index], icon: emoji };
      onUpdate({ ...content, badges: newBadges });
    },
    [badges, content, onUpdate]
  );

  const handleTitleChange = useCallback(
    (index: number, newContent: any) => {
      const newBadges = [...badges];
      newBadges[index] = { ...newBadges[index], title: newContent };
      onUpdate({ ...content, badges: newBadges });
    },
    [badges, content, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (index: number, newContent: any) => {
      const newBadges = [...badges];
      newBadges[index] = { ...newBadges[index], description: newContent };
      onUpdate({ ...content, badges: newBadges });
    },
    [badges, content, onUpdate]
  );

  const handleIssuerChange = useCallback(
    (index: number, newContent: any) => {
      const newBadges = [...badges];
      newBadges[index] = { ...newBadges[index], issuer: newContent };
      onUpdate({ ...content, badges: newBadges });
    },
    [badges, content, onUpdate]
  );

  const handleOpenEdit = () => {
    setTempLayout(layout);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({ ...content, layout: tempLayout });
    setIsEditOpen(false);
  };

  const addBadge = () => {
    onUpdate({
      ...content,
      badges: [
        ...badges,
        {
          title: createParagraphContent("New Achievement"),
          icon: "🎖️",
          date: new Date().getFullYear().toString(),
        },
      ],
    });
  };

  const removeBadge = (index: number) => {
    const newBadges = badges.filter((_, i) => i !== index);
    onUpdate({ ...content, badges: newBadges });
  };

  const gridClass =
    layout === "grid" ? "grid grid-cols-2 gap-4" : "flex flex-col gap-3";

  return (
    <BlockWrapper onEdit={!readOnly ? handleOpenEdit : undefined} onAdd={!readOnly ? addBadge : undefined} theme={theme} readOnly={readOnly}>
      <div className={`${gridClass} w-full`}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className="group/badge flex gap-4 p-4 rounded-2xl transition-all relative"
            style={{
              backgroundColor: `${theme.primary}08`,
            }}
          >
            {/* Delete button */}
            {!readOnly && (
              <button
                onClick={() => removeBadge(index)}
                className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover/badge:opacity-100 transition-all hover:bg-red-500/10"
                style={{ color: "#ef4444" }}
              >
                <IconTrash size={14} />
              </button>
            )}

            {/* Icon */}
            {!readOnly ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-105 cursor-pointer"
                    style={{ backgroundColor: `${theme.primary}15` }}
                    title="Change icon"
                  >
                    {badge.icon || "🏆"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl">
                  <EmojiPicker onEmojiClick={(emoji) => handleIconChange(index, emoji.emoji)} />
                </PopoverContent>
              </Popover>
            ) : (
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${theme.primary}15` }}
              >
                {badge.icon || "🏆"}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 py-0.5">
              <div className="mb-1">
                <ProseMirrorEditor
                  key={`${block.id}-title-${index}`}
                  blockId={`${block.id}-title-${index}`}
                  value={badge.title}
                  onChange={(newContent) => handleTitleChange(index, newContent)}
                  placeholder="Award Title"
                  className="text-base font-semibold leading-tight"
                  theme={theme}
                  readOnly={readOnly}
                />
              </div>
              {badge.description && (
                <div className="mb-2">
                  <ProseMirrorEditor
                    key={`${block.id}-desc-${index}`}
                    blockId={`${block.id}-desc-${index}`}
                    value={badge.description}
                    onChange={(newContent) => handleDescriptionChange(index, newContent)}
                    placeholder="Description"
                    className="text-sm opacity-60 leading-relaxed"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                {badge.issuer && (
                  <ProseMirrorEditor
                    key={`${block.id}-issuer-${index}`}
                    blockId={`${block.id}-issuer-${index}`}
                    value={badge.issuer}
                    onChange={(newContent) => handleIssuerChange(index, newContent)}
                    placeholder="Issuer"
                    className="text-xs font-medium opacity-40 uppercase tracking-wide"
                  />
                )}
                {badge.date && (
                  <span
                    className="text-xs opacity-30"
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

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          style={{
            backgroundColor: isDark ? "rgba(20,20,24,0.98)" : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
              Edit Badges
            </DialogTitle>
            <DialogDescription style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
              Customize layout and style.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>Layout</Label>
              <Select value={tempLayout} onValueChange={(v: any) => setTempLayout(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: theme.primary }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
};
