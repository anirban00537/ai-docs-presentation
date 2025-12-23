/**
 * Team Spotlight Layout Template
 * Individual team member highlight with large portrait.
 * 
 * @example
 * Used for: Leadership pages, Speaker intros, Team highlights
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createBadgeContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const TeamSpotlightLayout: LayoutTemplate = {
  id: "team-spotlight-layout",
  name: "Team Spotlight",
  description: "Leadership profile with credentials and bio",
  icon: "IconStar",
  accent: {
    position: "left",
    size: 45, // Slightly smaller to give text room
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=800", // Professional woman
  },
  getRows: (): Row[] => {
    // Name and Title Header
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# Dr. Sarah Chen\n### Chief Technology Officer",
    };

    // Professional Bio
    const bioBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "Sarah leads our global engineering division, overseeing AI research and infrastructure. With a Ph.D. in Computer Science from Stanford and previous leadership roles at **SpaceX** and **DeepMind**, she brings unparalleled technical vision to our team.",
    };

    // Key Achievements/Skills Badges
    const badges = createBadgeContent();
    badges.badges = [
      { title: "Ph.D. CS", icon: "IconSchool" },
      { title: "AI Expert", icon: "IconRobot" },
      { title: "Patents: 12", icon: "IconScroll" },
      { title: "Speaker", icon: "IconMicrophone" },
    ];
    badges.layout = "grid";

    // Social/Contact Info
    const socialBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "**Connect**\n\n[LinkedIn](https://linkedin.com) · [Twitter](https://twitter.com) · [ResearchGate](https://researchgate.net)",
    };

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [bioBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.BADGE, badges)],
      },
      {
        id: nanoid(),
        blocks: [socialBlock],
      },
    ];
  },
};
