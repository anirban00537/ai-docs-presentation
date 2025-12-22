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
  description: "Product showcase with large image accent",
  icon: "🚀",
  accent: {
    position: "left",
    size: 45,
    url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800",
  },
  getRows: (): Row[] => {
    // Header section - using markdown
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# Revolutionary Product\n\nThe future of productivity is here. Built for teams that demand excellence.",
    };

    // Feature list
    const features = createFeatureListContent();
    features.features = [
      { icon: "⚡", title: "Lightning Fast", description: "50% faster than competitors" },
      { icon: "🔒", title: "Enterprise Security", description: "SOC2 & ISO certified" },
      { icon: "🔄", title: "Real-time Sync", description: "Instant collaboration" },
      { icon: "📱", title: "Mobile First", description: "Works on any device" },
    ];
    features.layout = "list";

    // CTA Badge
    const badge = createBadgeContent();
    badge.badges = [
      { title: "Start Free Trial", icon: "🎯" },
      { title: "Watch Demo", icon: "▶️" },
    ];
    badge.layout = "list";

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
    ];
  },
};
