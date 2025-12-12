import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createCtaContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

const createHeading = (text: string, level = 1) => ({ type: "doc" as const, content: [{ type: "heading", attrs: { level }, content: [{ type: "text", text }] }] });

export const TaglineTitlePageLayout = {
  id: "tagline-title-page-layout",
  name: "Tagline Title Page",
  description: "Opening page with a prominent title and short tagline",
  icon: "🪧",
  getRows: (): Row[] => {
    const block: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 3, textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Confidential - Strategy 2025",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [{ type: "text", text: "Project Horizon" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Redefining how the world connects, collaborates, and creates value together.",
              },
            ],
          },
        ],
      },
    };

    const cta = createCtaContent();
    cta.heading = createHeading("Ready to Launch?", 2);
    cta.body = createParagraphContent("Access the comprehensive go-to-market strategy deck.");
    cta.buttonLabel = "View Strategy";

    return [
      {
        id: nanoid(),
        blocks: [block],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.CTA, content: cta }],
      },
    ];
  },
};
