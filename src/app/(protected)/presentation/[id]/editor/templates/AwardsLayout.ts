import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createBadgeContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const AwardsLayout = {
  id: "awards-layout",
  name: "Awards & Recognition",
  description: "Showcase achievements and certifications",
  icon: "🏆",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Recognized Excellence" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "We are proud to be backed by the industry's most respected organizations.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Badges
    const badges = createBadgeContent();
    badges.badges = [
      {
        icon: "🏆",
        title: createParagraphContent("Innovation of the Year"),
        issuer: createParagraphContent("Gartner Magic Quadrant"),
        date: "2024",
      },
      {
        icon: "⭐",
        title: createParagraphContent("Leader in Enterprise"),
        issuer: createParagraphContent("G2 Crowd"),
        date: "2024",
      },
      {
        icon: "🎖️",
        title: createParagraphContent("Best Security Solution"),
        issuer: createParagraphContent("TechCrunch Disrupt"),
        date: "2023",
      },
    ];
    badges.layout = "grid";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.BADGE, content: badges }],
      },
    ];
  },
};
