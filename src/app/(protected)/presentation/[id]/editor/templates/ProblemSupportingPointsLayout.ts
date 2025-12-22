import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const ProblemSupportingPointsLayout = {
  id: "problem-supporting-points-layout",
  name: "Problem + Supporting Points",
  description: "Problem statement with two reinforcing points",
  icon: "📝",
  getRows: (): Row[] => {
    const statement: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">The Innovation Paradox</h2>\n\n<p style="text-align: center">Organizations are desperate to innovate, but their legacy infrastructure is actively preventing them from moving forward.</p>',
    };

    const features = createFeatureListContent();
    features.features = [
      {
        icon: "🐌",
        title: "Velocity Drag",
        description:
          "Every new feature requires weeks of manual regression testing, killing momentum and delaying time-to-revenue.",
      },
      {
        icon: "💸",
        title: "Cost of Maintenance",
        description:
          "80% of engineering budget is spent keeping the lights on, leaving only 20% for actual value creation.",
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
