import { BadgeContentSchema, type BadgeContent } from "@/types/presentation";

import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createBadgeContent = (): BadgeContent => ({
  type: "badge",
  badges: [
    {
      icon: "IconTrophy",
      title: "Best Product 2024",
      issuer: "Tech Awards",
      date: "2024",
    },
    {
      icon: "IconStar",
      title: "Top Rated",
      issuer: "Industry Leaders",
      date: "2024",
    },
  ],
  layout: "grid",
});

export const normalizeBadgeContent = (content: any): BadgeContent => {
  if (!content || typeof content !== "object") return createBadgeContent();

  const badges = Array.isArray(content.badges)
    ? content.badges.map((badge: any) => ({
        ...badge,
        title: isLegacyProseMirrorFormat(badge.title)
          ? normalizeToMarkdown(badge.title)
          : typeof badge.title === "string"
          ? badge.title
          : "Award Title",
        description: isLegacyProseMirrorFormat(badge.description)
          ? normalizeToMarkdown(badge.description)
          : badge.description,
        issuer: isLegacyProseMirrorFormat(badge.issuer)
          ? normalizeToMarkdown(badge.issuer)
          : badge.issuer,
      }))
    : [];

  const result = BadgeContentSchema.safeParse({
    ...content,
    badges,
  });

  if (result.success) {
    return result.data;
  }

  return createBadgeContent();
};
