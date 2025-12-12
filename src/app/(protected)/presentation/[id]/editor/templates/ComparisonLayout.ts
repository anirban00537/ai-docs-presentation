import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createComparisonTableContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
            content: [{ type: "text", text: "Choose Your Plan" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Find the perfect plan for your needs",
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
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Basic" }],
            },
          ],
        },
        price: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "$9/mo" }],
            },
          ],
        },
        highlighted: false,
      },
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Pro" }],
            },
          ],
        },
        price: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "$29/mo" }],
            },
          ],
        },
        highlighted: true,
      },
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Enterprise" }],
            },
          ],
        },
        price: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Custom" }],
            },
          ],
        },
        highlighted: false,
      },
    ];
    comparison.rows = [
      {
        feature: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Storage" }],
            },
          ],
        },
        values: ["10GB", "100GB", "Unlimited"],
      },
      {
        feature: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Users" }],
            },
          ],
        },
        values: ["1", "5", "Unlimited"],
      },
      {
        feature: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Support" }],
            },
          ],
        },
        values: ["Email", "24/7", "Dedicated"],
      },
      {
        feature: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "API Access" }],
            },
          ],
        },
        values: [false, true, true],
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
