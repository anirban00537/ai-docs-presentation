/**
 * Customer Journey Layout Template
 * Customer journey visualization with top banner.
 * 
 * @example
 * Used for: UX presentations, Journey mapping, Process flows
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createTimelineContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const CustomerJourneyLayout: LayoutTemplate = {
  id: "customer-journey-layout",
  name: "Customer Journey",
  description: "End-to-end user journey visualization with banner",
  icon: "IconMapPin",
  accent: {
    position: "top",
    size: 25, // Slimmer banner for cleaner look
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600", // Abstract gradient flow
  },
  getRows: (): Row[] => {
    // Title Section
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# The Connected Customer Journey\n\nFrom first touch to brand advocacy: How we nurture relationships at every stage.",
    };

    // Detailed Journey Timeline
    const timeline = createTimelineContent();
    timeline.steps = [
      { icon: "IconSearch", title: "Discovery", description: "Organic Search & Social Media" },
      { icon: "IconRocket", title: "Activation", description: "Seamless Signup & Onboarding" },
      { icon: "IconDiamond", title: "Value", description: "First 'Aha!' Moment in < 5 mins" },
      { icon: "IconRefresh", title: "Habit", description: "Weekly Active Usage Loop" },
      { icon: "IconHeart", title: "Advocacy", description: "Referral & Community Leading" },
    ];
    // Note: 'orientation' is not a property of TimelineContent schema, it renders vertical by default or controlled by block component logic if implemented later.
    // Assuming default vertical list for now based on previous checks.

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.TIMELINE, timeline)],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.PROSEMIRROR,
            content: "*\"The smooth transition from activation to value is our key differentiator.\"* — Product Team",
          } as Block
        ]
      }
    ];
  },
};
