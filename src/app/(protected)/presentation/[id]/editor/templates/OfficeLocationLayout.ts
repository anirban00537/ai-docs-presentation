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
  description: "Company location with office visual",
  icon: "🏢",
  accent: {
    position: "left",
    size: 45,
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  },
  getRows: (): Row[] => {
    // Location title - using markdown
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## San Francisco HQ\n\n📍 500 Market Street, San Francisco, CA 94105",
    };

    // Office stats
    const stats = createStatsCounterContent();
    stats.stats = [
      { value: 500, label: "Employees", icon: "👥" },
      { value: 50, label: "K sq ft", icon: "🏢" },
      { value: 3, label: "Cafeterias", icon: "☕" },
    ];
    stats.layout = "horizontal";
    stats.columns = 3;

    // Amenities - using markdown
    const amenitiesBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "### Amenities\n\n🏋️ Fitness Center · 🍕 Free Meals · 🧘 Meditation Rooms · 🎮 Game Lounge\n\n**Take a Virtual Tour →**",
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
