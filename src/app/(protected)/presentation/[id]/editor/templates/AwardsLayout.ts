import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createBadgeContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const AwardsLayout = {
  id: "awards-layout",
  name: "Awards & Recognition",
  description: "Showcase achievements and certifications",
  icon: "IconTrophy",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## Recognized Excellence {.center}\n\nWe are proud to be backed by the industry\'s most respected organizations. {.center}',
    };

    // Row 2: Badges
    const badges = createBadgeContent();
    badges.badges = [
      {
        icon: "IconTrophy",
        title: "Innovation of the Year",
        issuer: "Gartner Magic Quadrant",
        date: "2024",
      },
      {
        icon: "IconStar",
        title: "Leader in Enterprise",
        issuer: "G2 Crowd",
        date: "2024",
      },
      {
        icon: "IconDiamond",
        title: "Best Security Solution",
        issuer: "TechCrunch Disrupt",
        date: "2023",
      },
    ];
    badges.layout = "grid";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.BADGE, content: badges }],
      },
    ];
  },
};
