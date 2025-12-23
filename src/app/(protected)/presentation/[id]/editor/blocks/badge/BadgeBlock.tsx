import React, { useCallback, useState, memo, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import { createBadgeContent, type BadgeContent } from "../definitions";
import { BlockWrapper } from "../../block/BlockWrapper";
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
import { IconTrash } from "@tabler/icons-react";
import { UniversalIconPicker } from "../../ui/UniversalIconPicker";
import { DynamicIcon } from "../../ui/DynamicIcon";
import { CommonCard } from "../CommonCard";

interface BadgeBlockProps {
  block: Block;
  onUpdate: (content: BadgeContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const BadgeBlock = memo(function BadgeBlock({
  block,
  onUpdate,
  theme,
  readOnly = false,
}: BadgeBlockProps) {
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
    (index: number, newContent: ProseMirrorDocument) => {
      const newBadges = [...badges];
      newBadges[index] = { ...newBadges[index], title: newContent };
      onUpdate({ ...content, badges: newBadges });
    },
    [badges, content, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (index: number, newContent: ProseMirrorDocument) => {
      const newBadges = [...badges];
      newBadges[index] = { ...newBadges[index], description: newContent };
      onUpdate({ ...content, badges: newBadges });
    },
    [badges, content, onUpdate]
  );

  const handleIssuerChange = useCallback(
    (index: number, newContent: ProseMirrorDocument) => {
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
          title: "New Achievement",
          icon: "IconTrophy",
          date: new Date().getFullYear().toString(),
        },
      ],
    });
  };

  const removeBadge = useCallback((index: number) => {
    const newBadges = badges.filter((_, i) => i !== index);
    onUpdate({ ...content, badges: newBadges });
  }, [badges, content, onUpdate]);

  const gridClass = useMemo(() => 
    layout === "grid" ? "grid grid-cols-2 gap-6" : "flex flex-col gap-4",
    [layout]
  );

  return (
    <BlockWrapper
      onEdit={!readOnly ? handleOpenEdit : undefined}
      onAdd={!readOnly ? addBadge : undefined}
      theme={theme}
      readOnly={readOnly}
    >
      <div className={`${gridClass} w-full`}>
        {badges.map((badge, index) => (
          <CommonCard
            key={index}
            theme={theme}
            className="group/badge relative transition-all duration-300 hover:shadow-md h-full"
          >
            <div 
              className="flex flex-col gap-6 p-8 relative h-full w-full overflow-hidden"
              style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
            >
              {/* Minimal Gradient Background Blob */}
              <div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
                style={{ backgroundColor: theme.primary }}
              />

              {/* Delete button */}
              {!readOnly && (
                <button
                  onClick={() => removeBadge(index)}
                  className="absolute top-4 right-4 z-20 p-2 rounded-xl opacity-0 group-hover/badge:opacity-100 transition-all hover:bg-red-500/10"
                  style={{ color: "#ef4444" }}
                >
                  <IconTrash size={16} />
                </button>
              )}

              {/* Icon / Badge */}
              <div className="z-10">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 border shadow-sm"
                  style={{ 
                    backgroundColor: `${theme.primary}10`,
                    borderColor: `${theme.primary}20`,
                    backdropFilter: "blur(8px)"
                  }}
                >
                  <UniversalIconPicker
                    value={badge.icon || "IconTrophy"}
                    onChange={(icon) => handleIconChange(index, icon)}
                    theme={theme}
                    disabled={readOnly}
                    size="xl"
                    className="bg-transparent border-none shadow-none"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 z-10">
                <div className="mb-2">
                  <ProseMirrorEditor
                    key={`${block.id}-title-${index}`}
                    blockId={`${block.id}-title-${index}`}
                    value={badge.title}
                    onChange={(newContent) =>
                      handleTitleChange(index, newContent)
                    }
                    placeholder="Award Title"
                    className="text-lg font-bold tracking-tight leading-tight"
                    theme={theme}
                    readOnly={readOnly}
                  />
                </div>
                {badge.description && (
                  <div className="mb-4">
                    <ProseMirrorEditor
                      key={`${block.id}-desc-${index}`}
                      blockId={`${block.id}-desc-${index}`}
                      value={badge.description}
                      onChange={(newContent) =>
                        handleDescriptionChange(index, newContent)
                      }
                      placeholder="Description"
                      className="text-sm opacity-60 leading-relaxed tracking-normal"
                      theme={theme}
                      readOnly={readOnly}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2 mt-auto pt-4" style={{ borderTop: `1px solid ${theme.primary}10` }}>
                  {badge.issuer && (
                    <ProseMirrorEditor
                      key={`${block.id}-issuer-${index}`}
                      blockId={`${block.id}-issuer-${index}`}
                      value={badge.issuer}
                      onChange={(newContent) =>
                        handleIssuerChange(index, newContent)
                      }
                      placeholder="Issuer"
                      className="text-[10px] font-bold opacity-50 uppercase tracking-[0.2em]"
                      theme={theme}
                      readOnly={readOnly}
                    />
                  )}
                  {badge.date && (
                    <span
                      className="text-[10px] opacity-30 font-bold"
                      style={{ color: theme.bodyColor }}
                    >
                      • {badge.date}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CommonCard>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          style={{
            backgroundColor: isDark
              ? "rgba(20,20,24,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
              Edit Badges
            </DialogTitle>
            <DialogDescription
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Customize layout and style.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>Layout</Label>
              <Select
                value={tempLayout}
                onValueChange={(v: "grid" | "list") => setTempLayout(v)}
              >
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
            <Button
              onClick={handleSave}
              style={{ backgroundColor: theme.primary }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
});
