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
  description: "Individual team member with large portrait",
  icon: "⭐",
  accent: {
    position: "left",
    size: 50,
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
  },
  getRows: (): Row[] => {
    // Name and title - using markdown
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# Dr. Sarah Chen\n\n### Chief Technology Officer & Co-Founder",
    };

    // Bio - using markdown
    const bioBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "Stanford PhD in Machine Learning with 15+ years of experience building scalable AI systems. Previously led engineering at Google Brain and founded two successful startups.",
    };

    // Achievements as badges
    const badges = createBadgeContent();
    badges.badges = [
      { title: "Stanford PhD", icon: "🎓" },
      { title: "Ex-Google Brain", icon: "🧠" },
      { title: "Forbes 30 Under 30", icon: "🏆" },
      { title: "50+ Patents", icon: "📜" },
    ];
    badges.layout = "grid";

    // Social links - using markdown
    const socialBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "**Connect:** LinkedIn · Twitter · GitHub",
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
