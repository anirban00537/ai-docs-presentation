import React, { useCallback, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createBadgeContent, type BadgeContent } from "../definitions";
import { withAlpha } from "../utils";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { createParagraphContent } from "../definitions/common";

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempLayout, setTempLayout] = useState<"grid" | "list">(layout);

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

  const handleOpenEdit = () => {
    setTempLayout(layout);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      layout: tempLayout,
    });
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

  const updateBadgeField = (index: number, field: string, value: any) => {
      const newBadges = [...badges];
      newBadges[index] = { ...newBadges[index], [field]: value };
      onUpdate({ ...content, badges: newBadges });
  };

  const gridClass =
    layout === "grid" ? "grid grid-cols-2 gap-6" : "flex flex-col gap-6";

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addBadge} theme={theme}>
      <div className={`${gridClass} w-full`}>
        {badges.map((badge, index) => (
          <div
            key={index}
            className="group flex gap-4 p-6 rounded-2xl transition-all hover:translate-y-[-2px] hover:shadow-lg duration-300 relative"
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
             {/* Delete overlay? Keep simple. Modal is better. */}
          </div>
        ))}
      </div>

       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Badges</DialogTitle>
             <DialogDescription>
                Customize badges and awards.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="space-y-2">
                <Label>Layout</Label>
                <Select
                    value={tempLayout}
                    onValueChange={(v: any) => setTempLayout(v)}
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

            <div className="space-y-4">
                <Label>Badge Items</Label>
                {badges.map((badge, index) => (
                    <div key={index} className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/20 relative">
                         <div className="flex gap-4">
                              <div className="space-y-1 w-20">
                                <Label className="text-xs">Icon</Label>
                                <Input 
                                    value={badge.icon || ""}
                                    onChange={(e) => updateBadgeField(index, "icon", e.target.value)}
                                    className="h-8 text-sm text-center"
                                />
                             </div>
                             <div className="space-y-1 flex-1">
                                <Label className="text-xs">Date</Label>
                                <Input 
                                    value={badge.date || ""}
                                    onChange={(e) => updateBadgeField(index, "date", e.target.value)}
                                    className="h-8 text-sm"
                                />
                             </div>
                         </div>
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeBadge(index)}
                             className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addBadge} className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Badge
                </Button>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
};
