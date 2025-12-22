/**
 * Event Announcement Layout Template
 * Event/conference slide with atmospheric background.
 * 
 * @example
 * Used for: Event announcements, Webinar invites, Conference promos
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createBadgeContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const EventAnnouncementLayout: LayoutTemplate = {
  id: "event-announcement-layout",
  name: "Event Announcement",
  description: "Event promo with atmospheric background",
  icon: "🎪",
  accent: {
    position: "background",
    size: 40, // opacity percentage
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1600",
  },
  getRows: (): Row[] => {
    // Event title - using markdown
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# TechConf 2024\n\n### The Future of Innovation",
    };

    // Event details as badges
    const badges = createBadgeContent();
    badges.badges = [
      { title: "December 12-15", icon: "📅" },
      { title: "San Francisco", icon: "📍" },
      { title: "5,000+ Attendees", icon: "👥" },
    ];
    badges.layout = "grid";

    // CTA - using markdown
    const ctaBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "**Register Now - Early Bird Pricing →**",
    };

    // Speakers preview - using markdown
    const speakersBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "*Featuring speakers from Google, OpenAI, Microsoft, and more*",
    };

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.BADGE, badges)],
      },
      {
        id: nanoid(),
        blocks: [ctaBlock],
      },
      {
        id: nanoid(),
        blocks: [speakersBlock],
      },
    ];
  },
};
