import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createBadgeContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
            content: [{ type: "text", text: "Awards & Recognition" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Recognized for excellence in innovation",
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
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Best Product 2024",
                },
              ],
            },
          ],
        },
        issuer: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Tech Awards" }],
            },
          ],
        },
        date: "2024",
      },
      {
        icon: "⭐",
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Top Rated Platform",
                },
              ],
            },
          ],
        },
        issuer: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Industry Leaders" }],
            },
          ],
        },
        date: "2024",
      },
      {
        icon: "🎖️",
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Innovation Award",
                },
              ],
            },
          ],
        },
        issuer: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Startup Magazine" }],
            },
          ],
        },
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
