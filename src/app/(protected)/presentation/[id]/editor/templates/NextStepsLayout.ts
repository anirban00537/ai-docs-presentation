import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createTimelineContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const NextStepsLayout = {
  id: "next-steps-layout",
  name: "Next Steps",
  description: "Outline the next three actions to take",
  icon: "➡️",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '<h2 style="text-align: center">The Path Forward</h2>\n\n<p style="text-align: center">We are ready to move fast. Here is our proposed 30-day onboarding plan to get your team live and realizing value.</p>',
    };

    const timeline = createTimelineContent();
    timeline.title = undefined;
    timeline.steps = [
      {
        title: "Week 1: Kickoff & Strategy",
        description:
          "Align stakeholders, define success metrics, and finalise technical requirements. Delivery: Project Charter.",
        icon: "🏁",
      },
      {
        title: "Week 2: Integration & Setup",
        description:
          "Connect data sources, configure RBAC, and set up the sandbox environment. Delivery: Functional Sandbox.",
        icon: "🔌",
      },
      {
        title: "Week 3: Training & UAT",
        description:
          "Train power users and conduct User Acceptance Testing. Gather feedback and refine. Delivery: UAT Sign-off.",
        icon: "👨‍🏫",
      },
      {
        title: "Week 4: Go Live!",
        description:
          "Full production launch, post-launch hypercare support, and celebration. Delivery: Live System.",
        icon: "🚀",
      },
    ];

    return [
      {
        id: nanoid(),
        blocks: [header],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.TIMELINE, content: timeline },
        ],
      },
    ];
  },
};
