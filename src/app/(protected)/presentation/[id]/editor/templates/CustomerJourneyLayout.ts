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
  description: "Journey visualization with visual banner",
  icon: "🗺️",
  accent: {
    position: "top",
    size: 30,
    url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1600",
  },
  getRows: (): Row[] => {
    // Title - using markdown
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## The Customer Journey\n\nFrom discovery to advocacy in 5 key stages",
    };

    // Journey timeline
    const timeline = createTimelineContent();
    timeline.steps = [
      { icon: "🔍", title: "Discovery", description: "Customer finds us through search or referral" },
      { icon: "📋", title: "Evaluation", description: "Compares options and reviews features" },
      { icon: "💳", title: "Purchase", description: "Converts with smooth onboarding" },
      { icon: "🎯", title: "Engagement", description: "Actively uses and explores features" },
      { icon: "❤️", title: "Advocacy", description: "Becomes a champion and refers others" },
    ];

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.TIMELINE, timeline)],
      },
    ];
  },
};
