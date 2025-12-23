import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createNumberCardContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const FeatureLayout = {
  id: "feature-layout",
  name: "Features Showcase",
  description: "Highlight key features with premium cards",
  icon: "✨",
  getRows: (): Row[] => {
    // Row 1: Section Title & Subtitle
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">Why We Lead the Market</h2>\n\n<p style="text-align: center">Built for speed, scale, and security from the ground up.</p>',
    };

    // Row 2: Three Premium Feature Cards
    const feature1 = createNumberCardContent();
    feature1.number = 1;

    feature1.editorContent =
      "### Zero-Config Scale\n\nHandle millions of requests without manual provisioning. It just works.";

    const feature2 = createNumberCardContent();
    feature2.number = 2;

    feature2.editorContent =
      "### Global Edge Network\n\nDeploy in 35 regions simultaneously. Lowest latency, guaranteed.";

    const feature3 = createNumberCardContent();
    feature3.number = 3;

    feature3.editorContent =
      "### Deep Observability\n\nTrace every request with millisecond precision. No more black boxes.";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: feature1 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: feature2 },
          { id: nanoid(), type: BLOCK_TYPES.NUMBER_CARD, content: feature3 },
        ],
      },
    ];
  },
};
