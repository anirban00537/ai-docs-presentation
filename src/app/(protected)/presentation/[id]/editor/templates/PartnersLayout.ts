import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createLogoGridContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

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
      content: "<h2 style=\"text-align: center\">Trusted by Industry Leaders</h2>\n\n<p style=\"text-align: center\">Powering innovation at 500+ global enterprises.</p>",
    };

    // Row 2: Logo Grid
    const logos = createLogoGridContent();
    logos.logos = [
      {
        name: createParagraphContent("Acme Corp"),
        link: "https://example.com",
      },
      {
        name: createParagraphContent("Globex"),
        link: "https://example.com",
      },
      {
        name: createParagraphContent("Initech"),
        link: "https://example.com",
      },
      {
        name: createParagraphContent("Soylent"),
        link: "https://example.com",
      },
      {
        name: createParagraphContent("Umbrella"),
        link: "https://example.com",
      },
      {
        name: createParagraphContent("Cyberdyne"),
        link: "https://example.com",
      },
    ];
    logos.columns = 3;
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
