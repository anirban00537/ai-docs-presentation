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
  description: "High-energy event invitation with atmospheric background",
  icon: "🎪",
  accent: {
    position: "background",
    size: 50, // Higher opacity for dramatic effect
    url: "https://images.unsplash.com/photo-1505373877841-8d43f703fb1e?w=1600", // Dark concert/conference stage
  },
  getRows: (): Row[] => {
    // Big Impact Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      // Using centered HTML styling within the markdown block for specific layout control in this unique template
      content: "# FutureTech Summit 2025\n\n### Where Innovation Meets Humanity",
    };

    // Key Event Details
    const badges = createBadgeContent();
    badges.badges = [
      { title: "Nov 15-18", icon: "📅" },
      { title: "Moscone Center, SF", icon: "📍" },
      { title: "10,000+ Attendees", icon: "👥" },
    ];
    badges.layout = "grid";

    // Speaker Lineup Teaser
    const speakersBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "**Keynote Speakers:**\n\n*   **Satya Nadella** (Microsoft)\n*   **Sam Altman** (OpenAI)\n*   **Mira Murati** (OpenAI)\n\n*+ 50 more industry leaders*",
    };

    // Registration CTA
    const ctaBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "### Early Bird Tickets Ending Soon\n\n[**Secure Your Spot →**](#)",
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
        blocks: [speakersBlock],
      },
      {
        id: nanoid(),
        blocks: [ctaBlock],
      },
    ];
  },
};
