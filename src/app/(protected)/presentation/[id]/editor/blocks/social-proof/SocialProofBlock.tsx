import React, { useCallback, useState } from "react";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createSocialProofContent,
  type SocialProofContent,
} from "../definitions";
import { withAlpha } from "../utils";
import {
  IconBrandTwitter,
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandYoutube,
  IconStar,
} from "@tabler/icons-react";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, ExternalLink } from "lucide-react";

interface SocialProofBlockProps {
  block: Block;
  onUpdate: (content: SocialProofContent) => void;
  theme: Theme;
  placeholder?: string;
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

  // Local state
  const [tempShowRatings, setTempShowRatings] = useState(showRatings);
  const [tempRating, setTempRating] = useState(rating?.toString() || "5");
  const [tempReviewCount, setTempReviewCount] = useState(reviewCount || "");

  const handleFollowerChange = useCallback(
    (index: number, value: string) => {
      const newPlatforms = [...platforms];
      newPlatforms[index] = {
        ...newPlatforms[index],
        followers: value,
      };
      onUpdate({
        ...content,
        platforms: newPlatforms,
      });
    },
    [platforms, content, onUpdate]
  );

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
      platforms: [...platforms, { platform: "twitter", followers: "1K", link: "" }],
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
      <div
        className="w-full rounded-2xl p-6 transition-all"
        style={{
          border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
          backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.5),
        }}
      >
        <div className="flex flex-wrap items-center justify-center gap-6 block-content">
          {platforms.map((platform, index) => {
            const IconComponent = platformIcons[platform.platform];
            return (
              <a
                key={index}
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all relative"
                style={{
                  backgroundColor: withAlpha(theme.primary, 0.05),
                  border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
                }}
                onClick={(e) => {
                    if (!platform.link) e.preventDefault();
                }}
              >
                <IconComponent
                  className="size-8 transition-colors"
                  style={{ color: theme.primary }}
                />
                <div
                  className="text-2xl font-bold"
                  style={{ color: theme.headingColor }}
                >
                  {platform.followers}
                </div>
                 {/* Visual indicator that this is editable in modal if hovered? No need, Edit button is enough. */}
              </a>
            );
          })}
        </div>

        {showRatings && rating && (
          <div
            className="mt-8 pt-8 border-t flex flex-col items-center gap-3"
            style={{ borderColor: withAlpha(theme.primary, 0.1) }}
          >
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <IconStar
                  key={i}
                  className={`size-6 ${
                    i < Math.floor(rating) ? "fill-current" : ""
                  }`}
                  style={{
                    color:
                      i < Math.floor(rating)
                        ? theme.primary
                        : withAlpha(theme.primary, 0.2),
                  }}
                />
              ))}
              <span
                className="ml-2 text-xl font-bold"
                style={{ color: theme.headingColor }}
              >
                {rating}
              </span>
            </div>
            {reviewCount && (
              <div
                className="text-sm opacity-70"
                style={{ color: theme.bodyColor }}
              >
                {reviewCount}
              </div>
            )}
          </div>
        )}
      </div>

       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Social Proof</DialogTitle>
             <DialogDescription>
                Manage social links and ratings.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             {/* Ratings Config */}
             <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                <div className="flex items-center justify-between">
                     <Label className="font-bold">Overall Rating</Label>
                     <Switch
                        checked={tempShowRatings}
                        onCheckedChange={setTempShowRatings}
                    />
                </div>
                {tempShowRatings && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Rating (0-5)</Label>
                            <Input 
                                type="number" step="0.1" min="0" max="5"
                                value={tempRating}
                                onChange={(e) => setTempRating(e.target.value)}
                            />
                        </div>
                         <div className="space-y-2">
                            <Label>Review Count Text</Label>
                            <Input 
                                value={tempReviewCount}
                                onChange={(e) => setTempReviewCount(e.target.value)}
                                placeholder="e.g. 500+ Reviews"
                            />
                        </div>
                    </div>
                )}
             </div>

             <div className="space-y-4">
                <Label>Platforms</Label>
                {platforms.map((platform, index) => (
                    <div key={index} className="flex flex-col gap-3 p-3 border rounded-lg bg-muted/20 relative">
                         <div className="grid grid-cols-2 gap-3">
                             <div className="space-y-1">
                                <Label className="text-xs">Platform</Label>
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
                                <Label className="text-xs">Followers Text</Label>
                                <Input 
                                    value={platform.followers}
                                    onChange={(e) => updatePlatformFollowers(index, e.target.value)}
                                    className="h-8 text-sm"
                                />
                             </div>
                         </div>
                         <div className="space-y-1">
                             <Label className="text-xs">Link URL</Label>
                             <div className="flex gap-2">
                                 <Input 
                                    value={platform.link || ""}
                                    onChange={(e) => updatePlatformLink(index, e.target.value)}
                                    className="h-8 text-sm"
                                    placeholder="https://..."
                                />
                             </div>
                         </div>
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removePlatform(index)}
                             className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addPlatform} className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Platform
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
