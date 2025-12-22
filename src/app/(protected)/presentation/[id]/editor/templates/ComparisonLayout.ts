import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createComparisonTableContent,
} from "../block/blocks/definitions";
import type { Block } from "@/types/presentation";

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
      content:
        '<h2 style="text-align: center">Find Your Perfect Fit</h2>\n\n<p style="text-align: center">Simple, transparent pricing for teams of all sizes.</p>',
    };

    // Row 2: Comparison Table
    const comparison = createComparisonTableContent();
    comparison.columns = [
      {
        name: "Basic",
        price: "$0/mo",
      },
      {
        name: "Pro",
        price: "$49/mo",
      },
      {
        name: "Enterprise",
        price: "Custom",
      },
    ];
    comparison.rows = [
      {
        feature: "Team Members",
        values: ["Up to 3", "Up to 20", "Unlimited"],
      },
      {
        feature: "Cloud Storage",
        values: ["10GB", "1TB", "Unlimited"],
      },
      {
        feature: "API Access",
        values: ["Limit: 1k/day", "Limit: 50k/day", "Unlimited"],
      },
      {
        feature: "SLA Guarantee",
        values: [false, "99.9%", "99.99% + Credits"],
      },
      {
        feature: "Support",
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
