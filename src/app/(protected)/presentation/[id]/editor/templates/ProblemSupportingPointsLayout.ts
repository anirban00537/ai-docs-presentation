import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const ProblemSupportingPointsLayout = {
  id: "problem-supporting-points-layout",
  name: "Problem + Supporting Points",
  description: "Problem statement with two reinforcing points",
  icon: "📝",
  getRows: (): Row[] => {
    const statement: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The Innovation Paradox" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Organizations are desperate to innovate, but their legacy infrastructure is actively preventing them from moving forward.",
              },
            ],
          },
        ],
      },
    };

    const features = createFeatureListContent();
    features.features = [
      {
        icon: "🐌",
        title: createParagraphContent("Velocity Drag"),
        description: createParagraphContent("Every new feature requires weeks of manual regression testing, killing momentum and delaying time-to-revenue."),
      },
      {
        icon: "💸",
        title: createParagraphContent("Cost of Maintenance"),
        description: createParagraphContent("80% of engineering budget is spent keeping the lights on, leaving only 20% for actual value creation."),
      },
    ];
    features.layout = "grid";
    features.columns = 2;

    return [
      {
        id: nanoid(),
        blocks: [statement],
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
