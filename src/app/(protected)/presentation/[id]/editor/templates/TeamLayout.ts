import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import {
  BLOCK_TYPES,
  createTeamCardContent,
} from "../blocks/definitions";
import type { Block } from "@/types/presentation";
import { getDefaultHeadingContent } from "@/types/presentation";

const createHeading = (text: string, level = 1) => {
  const hashes = "#".repeat(level);
  return `${hashes} ${text}`;
};

export const TeamLayout = {
  id: "team-layout",
  name: "Meet the Team",
  description: "Introduce your team members with style",
  icon: "👥",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">Meet The Builders</h2>\n\n<p style=\"text-align: center\">Obsessed with quality, craft, and user experience.</p>",
    };

    // Row 2: Three Team Cards
    const member1 = createTeamCardContent();
    member1.name = createHeading("Dr. Elena Foster");
    member1.role = "Chief Technology Officer";
    member1.description = "PhD in Distributed Systems. Formerly Principal Architect at CloudCorp.";

    const member2 = createTeamCardContent();
    member2.name = createHeading("James Wu");
    member2.role = "Head of Product";
    member2.description = "leading product vision and strategy. Previously at StartupX.";

    const member3 = createTeamCardContent();
    member3.name = createHeading("Sarah Jenkins");
    member3.role = "VP of Sales";
    member3.description = "Driving growth and customer success. 15 years in Enterprise SaaS.";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.TEAM_CARD, content: member1 },
          { id: nanoid(), type: BLOCK_TYPES.TEAM_CARD, content: member2 },
          { id: nanoid(), type: BLOCK_TYPES.TEAM_CARD, content: member3 },
        ],
      },
    ];
  },
};
