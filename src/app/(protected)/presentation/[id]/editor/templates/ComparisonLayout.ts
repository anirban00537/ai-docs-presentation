import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createComparisonTableContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const ComparisonLayout = {
  id: "comparison-layout",
  name: "Plan Comparison",
  description: "Compare pricing plans side-by-side",
  icon: "⚖️",
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
            content: [{ type: "text", text: "Find Your Perfect Fit" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Simple, transparent pricing for teams of all sizes.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Comparison Table
    const comparison = createComparisonTableContent();
    comparison.columns = [
      {
        name: createParagraphContent("Basic"),
        price: createParagraphContent("$0/mo"),
        highlighted: false,
      },
      {
        name: createParagraphContent("Pro"),
        price: createParagraphContent("$49/mo"),
        highlighted: true,
      },
      {
        name: createParagraphContent("Enterprise"),
        price: createParagraphContent("Custom"),
        highlighted: false,
      },
    ];
    comparison.rows = [
      {
        feature: createParagraphContent("Team Members"),
        values: ["Up to 3", "Up to 20", "Unlimited"],
      },
      {
        feature: createParagraphContent("Cloud Storage"),
        values: ["10GB", "1TB", "Unlimited"],
      },
      {
        feature: createParagraphContent("API Access"),
        values: ["Limit: 1k/day", "Limit: 50k/day", "Unlimited"],
      },
      {
        feature: createParagraphContent("SLA Guarantee"),
        values: [false, "99.9%", "99.99% + Credits"],
      },
      {
        feature: createParagraphContent("Support"),
        values: ["Community", "Email (4hr)", "24/7 Phone"],
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.COMPARISON_TABLE,
            content: comparison,
          },
        ],
      },
    ];
  },
};
