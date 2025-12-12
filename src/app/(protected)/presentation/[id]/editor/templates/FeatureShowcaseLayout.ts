import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const FeatureShowcaseLayout = {
  id: "feature-showcase-layout",
  name: "Feature Showcase",
  description: "Highlight product features with icons",
  icon: "✨",
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
            content: [{ type: "text", text: "Why Choose Us" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Everything you need to succeed in one platform",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Feature List
    const features = createFeatureListContent();
    features.features = [
      {
        icon: "🚀",
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Lightning Fast" }],
            },
          ],
        },
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Optimized for speed and efficiency with cutting-edge technology",
                },
              ],
            },
          ],
        },
      },
      {
        icon: "🔒",
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Secure by Design" }],
            },
          ],
        },
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Enterprise-grade security and encryption to protect your data",
                },
              ],
            },
          ],
        },
      },
      {
        icon: "🎨",
        title: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Beautiful UI" }],
            },
          ],
        },
        description: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Crafted with attention to every detail for the best experience",
                },
              ],
            },
          ],
        },
      },
    ];
    features.layout = "grid";
    features.columns = 3;

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.FEATURE_LIST, content: features },
        ],
      },
    ];
  },
};
