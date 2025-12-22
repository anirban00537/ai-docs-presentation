/**
 * Office Location Layout Template
 * Company location/office showcase.
 * 
 * @example
 * Used for: Company overview, Recruitment, About us
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createStatsCounterContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const OfficeLocationLayout: LayoutTemplate = {
  id: "office-location-layout",
  name: "Office Location",
  description: "Showcase your workspace and company culture",
  icon: "🏢",
  accent: {
    position: "left",
    size: 50,
    url: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800", // Modern bright office
  },
  getRows: (): Row[] => {
    // Location Header
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# San Francisco HQ\n\n**SoMa District**\n500 Howard Street, Suite 400\nSan Francisco, CA 94105",
    };

    // Office Stats
    const stats = createStatsCounterContent();
    stats.stats = [
      { value: 45, label: "K Sq Ft", icon: "📐", suffix: "" },
      { value: 400, label: "Desks", icon: "🪑", suffix: "+" },
      { value: 12, label: "Meeting Rooms", icon: "🤝", suffix: "" },
    ];
    stats.layout = "horizontal";
    stats.columns = 3;

    // Culture/Amenities & CTA
    const amenitiesBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "### Built for Collaboration\n\nOur headquarters features open-plan workspaces, focus pods, a dedicated recording studio, and a rooftop garden for team events.\n\n[**Join the team →**](#) · *We are hiring!*",
    };

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.STATS_COUNTER, stats)],
      },
      {
        id: nanoid(),
        blocks: [amenitiesBlock],
      },
    ];
  },
};
