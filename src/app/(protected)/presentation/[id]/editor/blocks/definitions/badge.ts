import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface BadgeItem {
  icon?: string;
  title: ProseMirrorDocument;
  description?: ProseMirrorDocument;
  issuer?: ProseMirrorDocument;
  date?: string;
}

export interface BadgeContent {
  type: "badge";
  badges: BadgeItem[];
  layout: "grid" | "list";
}

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

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeBadgeContent = (content: any): BadgeContent => {
  const incoming = content as BadgeContent | undefined;
  if (incoming?.badges && Array.isArray(incoming.badges)) {
    return {
      type: "badge",
      badges: incoming.badges.map((badge) => ({
        icon: badge.icon ?? "🏆",
        title: hasValidDoc(badge.title)
          ? badge.title
          : createParagraphContent("Award Title"),
        description: badge.description
          ? hasValidDoc(badge.description)
            ? badge.description
            : undefined
          : undefined,
        issuer: badge.issuer
          ? hasValidDoc(badge.issuer)
            ? badge.issuer
            : undefined
          : undefined,
        date: badge.date,
      })),
      layout: incoming.layout ?? "grid",
    };
  }
  return createBadgeContent();
};
