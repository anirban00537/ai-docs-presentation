/**
 * Hero Product Showcase Layout Template
 * Product showcase with large image accent on the left.
 * 
 * @example
 * Used for: Product launches, Feature highlights, App showcases
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent, createBadgeContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const HeroProductLayout: LayoutTemplate = {
  id: "hero-product-layout",
  name: "Hero Product Showcase",
  description: "High-impact product launch with visual focus",
  icon: "IconRocket",
  accent: {
    position: "left",
    size: 50,
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800", // Headphone product shot
  },
  getRows: (): Row[] => {
    // Header section with compelling copy settings context
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# SonicFlow Pro X\n\n### Experience Sound in Its Purest Form\n\nEngineered for audiophiles who demand perfection. The SonicFlow Pro X redefines wireless audio with industry-leading noise cancellation and a 60-hour battery life that keeps the music playing as long as you do.",
    };

    // Feature list with detailed specs
    const features = createFeatureListContent();
    features.features = [
      { icon: "IconVolumeOff", title: "Active Noise Cancellation", description: "Blocks 99.7% of ambient noise" },
      { icon: "IconBattery", title: "60-Hour Battery", description: "Fast charging: 5 mins = 5 hours" },
      { icon: "IconHeadphones", title: "Lossless Audio", description: "High-fidelity aptX™ HD support" },
      { icon: "IconMicrophone", title: "Studio Mic Array", description: "Crystal clear calls anywhere" },
    ];
    features.layout = "grid"; // Grid looks more premium for features
    features.columns = 2;

    // Trust Badges/Awards
    const badge = createBadgeContent();
    badge.badges = [
      { title: "Best of CES 2024", icon: "IconTrophy" },
      { title: "Editor's Choice", icon: "IconStar" },
      { title: "Top Rated Design", icon: "IconPalette" },
    ];
    badge.layout = "grid";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.FEATURE_LIST, features)],
      },
      {
        id: nanoid(),
        blocks: [createTypedBlock(BLOCK_TYPES.BADGE, badge)],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.PROSEMIRROR,
            content: "**Pre-order now for $299** · Shipping starts Jan 15",
          } as Block
        ]
      }
    ];
  },
};
