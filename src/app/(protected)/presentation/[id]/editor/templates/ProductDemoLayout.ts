/**
 * Product Demo Layout Template
 * Product screenshot showcase with feature highlights.
 * 
 * @example
 * Used for: Product demos, Feature walkthroughs, App showcases
 */

import { nanoid } from "nanoid";
import type { Row, LayoutTemplate, Block } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import { createTypedBlock } from "./template-utils";

export const ProductDemoLayout: LayoutTemplate = {
  id: "product-demo-layout",
  name: "Product Demo",
  description: "Screenshot showcase with feature highlights",
  icon: "💻",
  accent: {
    position: "right",
    size: 55,
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200",
  },
  getRows: (): Row[] => {
    // Title - using markdown
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "## See It In Action\n\nExperience the power of intuitive design combined with enterprise-grade features.",
    };

    // Features list
    const features = createFeatureListContent();
    features.features = [
      { icon: "✓", title: "Drag & Drop Interface", description: "Build complex workflows visually" },
      { icon: "✓", title: "Real-time Collaboration", description: "Work together seamlessly" },
      { icon: "✓", title: "Smart Automation", description: "AI-powered suggestions" },
      { icon: "✓", title: "Custom Integrations", description: "Connect 200+ apps" },
    ];
    features.layout = "list";

    // CTA - using markdown
    const ctaBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "**Start Free Trial →**",
    };

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
        blocks: [ctaBlock],
      },
    ];
  },
};
