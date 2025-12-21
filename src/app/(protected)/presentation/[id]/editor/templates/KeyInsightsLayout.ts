import { Row, Block } from "@/types/presentation";
import type { LayoutTemplate } from "../layoutTemplates";
import { BLOCK_TYPES, createGlassInsightContent } from "../blocks/definitions";
import { nanoid } from "@reduxjs/toolkit";

export const KeyInsightsLayout: LayoutTemplate = {
  id: "key-insights",
  name: "Strategic Takeaways",
  description: "Highlighted key points in glass cards",
  icon: "Lightbulb",
  getRows: (): Row[] => [
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.PROSEMIRROR,
          content: '<p style="text-align: center">Core Strategic Pillars</p>',
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.GLASS_INSIGHT,
          content: createGlassInsightContent(
            "🎯",
            "Focus on product-led growth. By reducing friction in the signup process, we aim to capture 30% more varied user segments."
          ),
        } as Block,
        {
          id: nanoid(),
          type: BLOCK_TYPES.GLASS_INSIGHT,
          content: createGlassInsightContent(
            "🤝",
            "Strengthen partnership ecosystem. Collaborating with key industry players will unlock new distribution channels."
          ),
        } as Block,
      ],
    },
    {
      id: nanoid(),
      blocks: [
        {
          id: nanoid(),
          type: BLOCK_TYPES.GLASS_INSIGHT,
          content: createGlassInsightContent(
            "💡",
            "Invest in AI-driven personalization. Tailoring the user experience based on behavior will drive higher retention."
          ),
        } as Block,
        {
          id: nanoid(),
          type: BLOCK_TYPES.GLASS_INSIGHT,
          content: createGlassInsightContent(
            "⚡️",
            "Accelerate technical debt repayment. Dedicating 20% of engineering time to refactoring will improve improved stability."
          ),
        } as Block,
      ],
    },
  ],
};
