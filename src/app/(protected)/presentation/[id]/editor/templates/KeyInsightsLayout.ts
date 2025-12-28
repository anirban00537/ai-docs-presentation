/**
 * Key Insights Layout Template
 * Highlighted key points in glass cards.
 * 
 * @example
 * Used for: Strategic takeaways, Key findings, Summary points
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createGlassInsightContent } from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createTypedBlock } from "./template-utils";

export const KeyInsightsLayout: LayoutTemplate = {
  id: "key-insights",
  name: "Strategic Takeaways",
  description: "Strategic takeaways displayed in elegant glass-style insight cards. Perfect for summarizing key findings or action items.",
  icon: "IconBolt",
  getRows: (): Row[] => {
    // Row 1: Header
    const headerBlock = createProseMirrorBlock(
      createSectionHeader("Core Strategic Pillars")
    );

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(
            BLOCK_TYPES.GLASS_INSIGHT,
            createGlassInsightContent(
              "IconTarget",
              "Focus on product-led growth. By reducing friction in the signup process, we aim to capture 30% more varied user segments."
            )
          ),
          createTypedBlock(
            BLOCK_TYPES.GLASS_INSIGHT,
            createGlassInsightContent(
              "IconUsers",
              "Strengthen partnership ecosystem. Collaborating with key industry players will unlock new distribution channels."
            )
          ),
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(
            BLOCK_TYPES.GLASS_INSIGHT,
            createGlassInsightContent(
              "IconBrain",
              "Invest in AI-driven personalization. Tailoring the user experience based on behavior will drive higher retention."
            )
          ),
          createTypedBlock(
            BLOCK_TYPES.GLASS_INSIGHT,
            createGlassInsightContent(
              "IconActivity",
              "Accelerate technical debt repayment. Dedicating 20% of engineering time to refactoring will improve stability."
            )
          ),
        ],
      },
    ];
  },
};
