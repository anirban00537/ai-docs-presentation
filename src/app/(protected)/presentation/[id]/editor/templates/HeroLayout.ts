import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createCtaContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const HeroLayout = {
  id: "hero-layout",
  name: "Hero Section",
  description: "High-impact opening with bold typography and CTA",
  icon: "🎯",
  getRows: (): Row[] => {
    // Row 1: Main Heading
    const headingBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [
              { type: "text", text: "Build Something Amazing" },
            ],
          },
        ],
      },
    };

    // Row 2: Subheading/Description
    const descriptionBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "The all-in-one platform designed to transform your ideas into reality. Start your journey today.",
              },
            ],
          },
        ],
      },
    };

    // Row 3: CTA Banner
    const ctaContent = createCtaContent();
    ctaContent.heading = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Ready to launch?" }],
        },
      ],
    };
    ctaContent.body = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "Join over 10,000+ creators building the future.",
            },
          ],
        },
      ],
    };
    ctaContent.buttonLabel = "Start Free Trial";

    const ctaBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.CTA,
      content: ctaContent,
    };

    return [
      {
        id: nanoid(),
        blocks: [headingBlock],
      },
      {
        id: nanoid(),
        blocks: [descriptionBlock],
      },
      {
        id: nanoid(),
        blocks: [ctaBlock],
      },
    ];
  },
};

