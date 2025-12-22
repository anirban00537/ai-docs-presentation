import React, { useCallback, useState } from "react";
import type { Block, Theme } from "@/types/presentation";
import {
  createSocialProofContent,
  type SocialProofContent,
} from "../definitions";
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconStar,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { BlockWrapper } from "../../BlockWrapper";
import { CommonCard } from "../CommonCard";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SocialProofBlockProps {
  block: Block;
  onUpdate: (content: SocialProofContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

const platformIcons = {
  twitter: IconBrandTwitter,
  linkedin: IconBrandLinkedin,
  facebook: IconBrandFacebook,
  instagram: IconBrandInstagram,
  youtube: IconBrandYoutube,
};

export const SocialProofBlock: React.FC<SocialProofBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content =
    (block.content as SocialProofContent) ?? createSocialProofContent();
  const { platforms, showRatings, rating, reviewCount } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempShowRatings, setTempShowRatings] = useState(showRatings);
  const [tempRating, setTempRating] = useState(rating?.toString() || "5");
  const [tempReviewCount, setTempReviewCount] = useState(reviewCount || "");
  const isDark = theme.themeType === "dark";

  const handleOpenEdit = () => {
    setTempShowRatings(showRatings);
    setTempRating(rating?.toString() || "5");
    setTempReviewCount(reviewCount || "");
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      showRatings: tempShowRatings,
      rating: parseFloat(tempRating) || 0,
      reviewCount: tempReviewCount,
    });
    setIsEditOpen(false);
  };

  const addPlatform = () => {
    onUpdate({
      ...content,
      platforms: [
        ...platforms,
        { platform: "twitter", followers: "1K", link: "" },
      ],
    });
  };

  const removePlatform = (index: number) => {
    const newPlatforms = platforms.filter((_, i) => i !== index);
    onUpdate({ ...content, platforms: newPlatforms });
  };

  const updatePlatformType = (index: number, type: any) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], platform: type };
    onUpdate({ ...content, platforms: newPlatforms });
  };

  const updatePlatformLink = (index: number, link: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], link };
    onUpdate({ ...content, platforms: newPlatforms });
  };

  const updatePlatformFollowers = (index: number, followers: string) => {
    const newPlatforms = [...platforms];
    newPlatforms[index] = { ...newPlatforms[index], followers };
    onUpdate({ ...content, platforms: newPlatforms });
  };

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addPlatform} theme={theme}>
      <CommonCard theme={theme} className="w-full p-6 transition-all">
        {/* Platforms */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          {platforms.map((platform, index) => {
            const IconComponent = platformIcons[platform.platform];
            return (
              <a
                key={index}
                href={platform.link || undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: `${theme.primary}08`,
                }}
                onClick={(e) => {
                  if (!platform.link) e.preventDefault();
                }}
              >
                <IconComponent size={28} style={{ color: theme.primary }} />
                <div
                  className="text-xl font-bold"
                  style={{ color: theme.headingColor }}
                >
                  {platform.followers}
                </div>
              </a>
            );
          })}
        </div>

        {/* Ratings */}
        {showRatings && rating && (
          <div
            className="mt-6 pt-6 flex flex-col items-center gap-2"
            style={{ borderTop: `1px solid ${theme.primary}10` }}
          >
            <div className="flex items-center gap-1.5">
              {[...Array(5)].map((_, i) => (
                <IconStar
                  key={i}
                  size={20}
                  className={i < Math.floor(rating) ? "fill-current" : ""}
                  style={{
                    color:
                      i < Math.floor(rating)
                        ? theme.primary
                        : `${theme.primary}30`,
                  }}
                />
              ))}
              <span
                className="ml-2 text-lg font-bold"
                style={{ color: theme.headingColor }}
              >
                {rating}
              </span>
            </div>
            {reviewCount && (
              <div
                className="text-xs opacity-50"
                style={{ color: theme.bodyColor }}
              >
                {reviewCount}
              </div>
            )}
          </div>
        )}
      </CommonCard>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto"
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
              Social Proof Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Manage platforms and ratings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Ratings Config */}
            <div
              className="space-y-3 p-4 rounded-lg"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.03)",
              }}
            >
              <div className="flex items-center justify-between">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>
                  Show Rating
                </Label>
                <Switch
                  checked={tempShowRatings}
                  onCheckedChange={setTempShowRatings}
                />
              </div>
              {tempShowRatings && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label
                      className="text-xs"
                      style={{ color: isDark ? "#aaa" : "#666" }}
                    >
                      Rating (0-5)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={tempRating}
                      onChange={(e) => setTempRating(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label
                      className="text-xs"
                      style={{ color: isDark ? "#aaa" : "#666" }}
                    >
                      Review Text
                    </Label>
                    <Input
                      value={tempReviewCount}
                      onChange={(e) => setTempReviewCount(e.target.value)}
                      placeholder="e.g. 500+ Reviews"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Platforms */}
            <div className="space-y-3">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>
                Platforms
              </Label>
              {platforms.map((platform, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-3 rounded-lg relative"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label
                        className="text-xs"
                        style={{ color: isDark ? "#aaa" : "#666" }}
                      >
                        Platform
                      </Label>
                      <Select
                        value={platform.platform}
                        onValueChange={(v: any) => updatePlatformType(index, v)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="linkedin">LinkedIn</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label
                        className="text-xs"
                        style={{ color: isDark ? "#aaa" : "#666" }}
                      >
                        Followers
                      </Label>
                      <Input
                        value={platform.followers}
                        onChange={(e) =>
                          updatePlatformFollowers(index, e.target.value)
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label
                      className="text-xs"
                      style={{ color: isDark ? "#aaa" : "#666" }}
                    >
                      Link
                    </Label>
                    <Input
                      value={platform.link || ""}
                      onChange={(e) =>
                        updatePlatformLink(index, e.target.value)
                      }
                      className="h-8 text-sm"
                      placeholder="https://..."
                    />
                  </div>
                  <button
                    onClick={() => removePlatform(index)}
                    className="absolute top-2 right-2 p-1 rounded-lg transition-all hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={addPlatform}
                className="w-full p-2 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm transition-all"
                style={{
                  borderColor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.1)",
                  color: isDark ? "#aaa" : "#666",
                }}
              >
                <IconPlus size={14} />
                Add Platform
              </button>
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
};
