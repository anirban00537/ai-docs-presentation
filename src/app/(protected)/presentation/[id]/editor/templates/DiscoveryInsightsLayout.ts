import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const DiscoveryInsightsLayout = {
  id: "discovery-insights-layout",
  name: "Discovery Call Insights",
  description: "Summarize key findings from discovery calls",
  icon: "IconSearch",
  getRows: (): Row[] => {
    const intro: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## Strategic Discovery: Key Themes {.center}\n\nWe spoke with 15 key stakeholders. Here is a synthesis of the critical challenges and opportunities identified. {.center}',
    };

    const insights = createFeatureListContent();
    insights.layout = "grid";
    insights.columns = 2; // 2x2 grid is often cleaner for 4 items with text
    insights.features = [
      {
        icon: "IconPuzzle",
        title: "Fragmentation Fatigue",
        description:
          "Teams are overwhelmed by using 4+ different tools for the same process. There is a strong desire for consolidation.",
      },
      {
        icon: "IconBolt",
        title: "Speed vs. Quality",
        description:
          "Current processes force a trade-off. Stakeholders want 'zero-compromise' velocity without sacrificing review standards.",
      },
      {
        icon: "IconLock",
        title: "Security & Compliance",
        description:
          "With recent reg changes, manual compliance checks are becoming a major risk factor and bottleneck.",
      },
      {
        icon: "IconDeviceMobile",
        title: "Mobile Access",
        description:
          "Field agents feel disconnected. A mobile-first experience is required to bring them into the digital loop.",
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
