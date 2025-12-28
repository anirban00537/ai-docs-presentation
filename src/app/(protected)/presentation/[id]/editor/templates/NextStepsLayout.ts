import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createTimelineContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const NextStepsLayout = {
  id: "next-steps-layout",
  name: "Next Steps",
  description: "30-day onboarding roadmap with four weekly milestones from kickoff to go-live. Clear action items with deliverables.",
  icon: "IconArrowRight",
  getRows: (): Row[] => {
    const header: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## The Path Forward {.center}\n\nWe are ready to move fast. Here is our proposed 30-day onboarding plan to get your team live and realizing value. {.center}',
    };

    const timeline = createTimelineContent();
    timeline.title = undefined;
    timeline.steps = [
      {
        title: "Week 1: Kickoff & Strategy",
        description:
          "Align stakeholders, define success metrics, and finalise technical requirements. Delivery: Project Charter.",
        icon: "IconFlagCheck",
      },
      {
        title: "Week 2: Integration & Setup",
        description:
          "Connect data sources, configure RBAC, and set up the sandbox environment. Delivery: Functional Sandbox.",
        icon: "IconPlugConnected",
      },
      {
        title: "Week 3: Training & UAT",
        description:
          "Train power users and conduct User Acceptance Testing. Gather feedback and refine. Delivery: UAT Sign-off.",
        icon: "IconPresentation",
      },
      {
        title: "Week 4: Go Live!",
        description:
          "Full production launch, post-launch hypercare support, and celebration. Delivery: Live System.",
        icon: "IconRocket",
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
