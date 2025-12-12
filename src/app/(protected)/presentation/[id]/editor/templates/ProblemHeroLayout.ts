import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createCtaContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const ProblemHeroLayout = {
  id: "problem-hero-layout",
  name: "Problem Hero",
  description: "Hero section centered on the core problem and CTA",
  icon: "🚩",
  getRows: (): Row[] => {
    const heroCopy: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1, textAlign: "center" },
            content: [
              { type: "text", text: "The $50B Efficiency Gap" },
            ],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Companies are losing billions annually due to fragmented data and manual reconciliation. The cost of doing nothing is rising every day.",
              },
            ],
          },
        ],
      },
    };

    const ctaContent = createCtaContent();
    ctaContent.heading = createParagraphContent("Stop the Bleeding");
    ctaContent.body = createParagraphContent("See how our platform can recover up to 20% of lost revenue in the first quarter.");
    ctaContent.buttonLabel = "Calculate Your ROI";

    return [
      {
        id: nanoid(),
        blocks: [heroCopy],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.CTA, content: ctaContent }],
      },
    ];
  },
};
