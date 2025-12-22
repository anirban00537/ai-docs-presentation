import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createLogoGridContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

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
      content:
        '<h2 style="text-align: center">Trusted by Industry Leaders</h2>\n\n<p style="text-align: center">Powering innovation at 500+ global enterprises.</p>',
    };

    // Row 2: Logo Grid
    const logos = createLogoGridContent();
    logos.logos = [
      {
        name: "Acme Corp",
        link: "https://example.com",
      },
      {
        name: "Globex",
        link: "https://example.com",
      },
      {
        name: "Initech",
        link: "https://example.com",
      },
      {
        name: "Soylent",
        link: "https://example.com",
      },
      {
        name: "Umbrella",
        link: "https://example.com",
      },
      {
        name: "Cyberdyne",
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
