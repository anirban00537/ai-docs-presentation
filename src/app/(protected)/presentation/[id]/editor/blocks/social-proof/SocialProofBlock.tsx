import React, { useCallback } from "react";
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

  return (
    <div
      className="w-full rounded-2xl p-8"
      style={{
        backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
        backdropFilter: "blur(12px)",
        border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
        boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
      }}
    >
      <div className="flex flex-wrap items-center justify-center gap-8">
        {platforms.map((platform, index) => {
          const IconComponent = platformIcons[platform.platform];
          return (
            <a
              key={index}
              href={platform.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-110 hover:shadow-lg duration-300"
              style={{
                backgroundColor: withAlpha(theme.primary, 0.05),
                border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
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
              <input
                type="text"
                value={platform.followers}
                onChange={(e) => handleFollowerChange(index, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-center bg-transparent border-none outline-none w-20"
                style={{ color: theme.bodyColor }}
                placeholder="0"
              />
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
  );
};
