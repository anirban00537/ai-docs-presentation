import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createCtaContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

const createHeading = (text: string, level = 1) => ({ type: "doc" as const, content: [{ type: "heading", attrs: { level }, content: [{ type: "text", text }] }] });

export const TitleTaglineLayout = {
  id: "title-tagline-layout",
  name: "Title with Tagline",
  description: "Simple title page with centered tagline",
  icon: "🏷️",
  getRows: (): Row[] => {
    const copy: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [{ type: "text", text: "Product Vision 2025" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Redefining how the world connects, collaborates, and creates value.",
                marks: [{ type: "italic" }],
              },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Prepared for the Board of Directors",
              },
            ],
          },
        ],
      },
    };

    const cta = createCtaContent();
    cta.heading = createHeading("Ready to Dive In?", 2);
    cta.body = createParagraphContent("Review the full strategic roadmap and financial projections.");
    cta.buttonLabel = "View Presentation";

    return [
      {
        id: nanoid(),
        blocks: [copy],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.CTA, content: cta }],
      },
    ];
  },
};
