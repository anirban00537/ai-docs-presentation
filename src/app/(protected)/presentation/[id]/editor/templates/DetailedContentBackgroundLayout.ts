import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { createProseMirrorBlock } from "./template-utils";

export const DetailedContentBackgroundLayout: LayoutTemplate = {
  id: "detailed-content-background",
  name: "Detailed Content - Background Accent",
  description: "Full-page text layout with subtle background accent.",
  icon: "IconPhoto",
  accent: {
    url: "https://images.unsplash.com/photo-1618005891825-37449c57c799?q=80&w=1932&auto=format&fit=crop",
    position: "background",
    size: 12,
  },
  getRows: (): Row[] => {
    return [
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock("### Executive Summary\n\nA comprehensive overview of strategic initiatives and outcomes.")
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Strategic Overview\n\nThis document presents a thorough analysis of our strategic position, examining both current state and future trajectories. The assessment encompasses multiple dimensions including operational efficiency, market positioning, competitive dynamics, and organizational capabilities.\n\nOur analysis reveals several critical success factors. First, maintaining technological leadership requires continuous investment in research and development. Second, customer-centricity must remain at the core of all decision-making processes. Third, agile organizational structures enable rapid response to market changes.\n\nThe competitive landscape continues to evolve at an unprecedented pace. Traditional boundaries between industries are blurring, creating both opportunities and threats. Organizations that successfully navigate this complexity will be those that embrace adaptability, foster innovation, and cultivate strategic partnerships."
          )
        ],
      },
      {
        id: nanoid(),
        blocks: [
          createProseMirrorBlock(
            "#### Implementation Roadmap\n\nExecution of this strategy requires coordinated effort across all organizational levels. The implementation roadmap spans multiple quarters and includes specific milestones, resource requirements, and success metrics.\n\nPhase 1 focuses on foundational capabilities, establishing the infrastructure and processes necessary for sustainable growth. Phase 2 expands market presence through targeted initiatives. Phase 3 consolidates gains and scales successful programs.\n\nRegular review cycles ensure alignment between strategic objectives and operational realities, with adjustments made as circumstances warrant.\n\n**Critical Success Factors:** Leadership commitment, resource adequacy, stakeholder engagement, performance monitoring.**"
          )
        ],
      },
    ];
  },
};
