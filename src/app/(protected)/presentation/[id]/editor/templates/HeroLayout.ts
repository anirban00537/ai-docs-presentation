import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createCtaContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const HeroLayout = {
  id: "hero-layout",
  name: "Hero Section",
  description: "Perfect for opening slides with headline and CTA",
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
            attrs: { level: 1 },
            content: [
              { type: "text", text: "Welcome to Our Platform" },
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
            content: [
              {
                type: "text",
                text: "Transform your workflow with our innovative solution. Built for teams who demand excellence.",
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
          content: [{ type: "text", text: "Ready to get started?" }],
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
              text: "Join thousands of satisfied customers today.",
            },
          ],
        },
      ],
    };
    ctaContent.buttonLabel = "Get Started";

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

