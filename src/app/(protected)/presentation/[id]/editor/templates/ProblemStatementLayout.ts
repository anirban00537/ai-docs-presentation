import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const ProblemStatementLayout = {
  id: "problem-statement-layout",
  name: "Problem Statement",
  description: "Clear articulation of the problem being solved",
  icon: "🧩",
  getRows: (): Row[] => {
    const statement: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "The Connectivity Crisis" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "CONTEXT: As organizations scale, they adopt hundreds of SaaS applications. Each team operates in its own silo, using its own data standards.",
              },
            ],
          },
           {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "CONFLICT: This fragmentation creates a 'connectivity crisis'. Information doesn't flow between teams. Critical insights are trapped in dashboards no one looks at.",
              },
            ],
          },
           {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "CONSEQUENCE: The result is slow decision-making, missed opportunities, and an organization that cannot adapt to market changes fast enough.",
              },
            ],
          },
        ],
      },
    };

    return [
      {
        id: nanoid(),
        blocks: [statement],
      },
    ];
  },
};
