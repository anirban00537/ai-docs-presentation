import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import {
  BLOCK_TYPES,
  createTeamCardContent,
} from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Our Leadership Team" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "The minds behind the magic.",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Three Team Cards
    const member1 = createTeamCardContent();
    member1.name = { type: "doc", content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Alex Morgan" }] }] };
    member1.role = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "CEO & Founder" }] }] };
    member1.description = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Visionary leader with 10+ years of experience in tech." }] }] };

    const member2 = createTeamCardContent();
    member2.name = { type: "doc", content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Sarah Lee" }] }] };
    member2.role = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "CTO" }] }] };
    member2.description = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Tech wizard ensuring our platform is scalable and secure." }] }] };

    const member3 = createTeamCardContent();
    member3.name = { type: "doc", content: [{ type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "David Kim" }] }] };
    member3.role = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Head of Design" }] }] };
    member3.description = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Crafting beautiful experiences for our users." }] }] };

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
