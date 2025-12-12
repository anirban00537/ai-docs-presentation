import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const DiscoveryInsightsLayout = {
  id: "discovery-insights-layout",
  name: "Discovery Call Insights",
  description: "Summarize key findings from discovery calls",
  icon: "🔍",
  getRows: (): Row[] => {
    const intro: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Strategic Discovery: Key Themes" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "We spoke with 15 key stakeholders. Here is a synthesis of the critical challenges and opportunities identified.",
              },
            ],
          },
        ],
      },
    };

    const insights = createFeatureListContent();
    insights.layout = "grid";
    insights.columns = 2; // 2x2 grid is often cleaner for 4 items with text
    insights.features = [
      {
        icon: "🧩",
        title: createParagraphContent("Fragmentation Fatigue"),
        description: createParagraphContent("Teams are overwhelmed by using 4+ different tools for the same process. There is a strong desire for consolidation."),
      },
      {
        icon: "⚡",
        title: createParagraphContent("Speed vs. Quality"),
        description: createParagraphContent("Current processes force a trade-off. Stakeholders want 'zero-compromise' velocity without sacrificing review standards."),
      },
      {
        icon: "🔒",
        title: createParagraphContent("Security & Compliance"),
        description: createParagraphContent("With recent reg changes, manual compliance checks are becoming a major risk factor and bottleneck."),
      },
      {
        icon: "📱",
        title: createParagraphContent("Mobile Access"),
        description: createParagraphContent("Field agents feel disconnected. A mobile-first experience is required to bring them into the digital loop."),
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [intro],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.FEATURE_LIST, content: insights },
        ],
      },
    ];
  },
};
