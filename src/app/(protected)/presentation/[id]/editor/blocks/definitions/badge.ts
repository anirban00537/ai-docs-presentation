import type { BadgeContent, ProseMirrorDocument } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";
import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
  isMarkdownFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createBadgeContent = (): BadgeContent => ({
  type: "badge",
  badges: [
    {
      icon: "🏆",
      title: createParagraphContent("Best Product 2024"),
      issuer: createParagraphContent("Tech Awards"),
      date: "2024",
    },
    {
      icon: "⭐",
      title: createParagraphContent("Top Rated"),
      issuer: createParagraphContent("Industry Leaders"),
      date: "2024",
    },
  ],
  layout: "grid",
});

export const normalizeBadgeContent = (content: any): BadgeContent => {
  const incoming = content as BadgeContent | undefined;
  if (incoming?.badges && Array.isArray(incoming.badges)) {
    return {
      type: "badge",
      badges: incoming.badges.map((badge) => ({
        icon: badge.icon ?? "🏆",
        title: isMarkdownFormat(badge.title)
          ? badge.title
          : isLegacyProseMirrorFormat(badge.title)
          ? normalizeToMarkdown(badge.title)
          : createParagraphContent("Award Title"),
        description: badge.description
          ? isMarkdownFormat(badge.description)
            ? badge.description
            : isLegacyProseMirrorFormat(badge.description)
            ? normalizeToMarkdown(badge.description)
            : undefined
          : undefined,
        issuer: badge.issuer
          ? isMarkdownFormat(badge.issuer)
            ? badge.issuer
            : isLegacyProseMirrorFormat(badge.issuer)
            ? normalizeToMarkdown(badge.issuer)
            : undefined
          : undefined,
        date: badge.date,
      })),
      layout: incoming.layout ?? "grid",
    };
  }
  return createBadgeContent();
};
