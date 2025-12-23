/**
 * Team Layout Template
 * Introduce your team members with style.
 * 
 * @example
 * Used for: About pages, Team introductions, Founder profiles
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate } from "@/types/presentation";
import { BLOCK_TYPES, createTeamCardContent } from "../blocks/definitions";
import { createProseMirrorBlock, createSectionHeader, createHeadingDoc, createTypedBlock } from "./template-utils";

export const TeamLayout: LayoutTemplate = {
  id: "team-layout",
  name: "Meet the Team",
  description: "Introduce your team members with style",
  icon: "IconUsersGroup",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock = createProseMirrorBlock(
      createSectionHeader(
        "Meet The Builders",
        "Obsessed with quality, craft, and user experience."
      )
    );

    // Row 2: Three Team Cards
    const member1 = createTeamCardContent();
    member1.name = createHeadingDoc("Dr. Elena Foster", 1);
    member1.role = "Chief Technology Officer";
    member1.description =
      "PhD in Distributed Systems. Formerly Principal Architect at CloudCorp.";

    const member2 = createTeamCardContent();
    member2.name = createHeadingDoc("James Wu", 1);
    member2.role = "Head of Product";
    member2.description =
      "Leading product vision and strategy. Previously at StartupX.";

    const member3 = createTeamCardContent();
    member3.name = createHeadingDoc("Sarah Jenkins", 1);
    member3.role = "VP of Sales";
    member3.description =
      "Driving growth and customer success. 15 years in Enterprise SaaS.";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          createTypedBlock(BLOCK_TYPES.TEAM_CARD, member1),
          createTypedBlock(BLOCK_TYPES.TEAM_CARD, member2),
          createTypedBlock(BLOCK_TYPES.TEAM_CARD, member3),
        ],
      },
    ];
  },
};
