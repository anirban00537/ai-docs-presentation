import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createLogoGridContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

export const PartnersLayout = {
  id: "partners-layout",
  name: "Partners & Clients",
  description: "Showcase your partners and clients",
  icon: "🤝",
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
            content: [{ type: "text", text: "Trusted by Industry Leaders" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Join thousands of companies using our platform",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Logo Grid
    const logos = createLogoGridContent();
    logos.logos = [
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Company 1" }],
            },
          ],
        },
        link: "https://example.com",
      },
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Company 2" }],
            },
          ],
        },
        link: "https://example.com",
      },
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Company 3" }],
            },
          ],
        },
        link: "https://example.com",
      },
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Company 4" }],
            },
          ],
        },
        link: "https://example.com",
      },
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Company 5" }],
            },
          ],
        },
        link: "https://example.com",
      },
      {
        name: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Company 6" }],
            },
          ],
        },
        link: "https://example.com",
      },
    ];
    logos.columns = 4;
    logos.grayscale = true;

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [{ id: nanoid(), type: BLOCK_TYPES.LOGO_GRID, content: logos }],
      },
    ];
  },
};
