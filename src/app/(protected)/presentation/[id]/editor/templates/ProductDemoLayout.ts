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
  description: "Feature-rich product walkthrough with visual emphasis",
  icon: "💻",
  accent: {
    position: "right",
    size: 55,
    url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200", // Dashboard/Analytics view
  },
  getRows: (): Row[] => {
    // Compelling Headline
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "# Analytics That Drive Action\n\nStop guessing. Start knowing. Our AI-driven dashboard uncovers hidden patterns in your data, giving you the clarity to make bold decisions.",
    };

    // Feature Highlights - detailed benefits
    const features = createFeatureListContent();
    features.features = [
      { icon: "⚡", title: "Real-Time Insights", description: "Visualize streams of data with <50ms latency." },
      { icon: "🧠", title: "Predictive AI", description: "Forecast trends before they happen." },
      { icon: "🔗", title: "Universal Connectors", description: "Integrate with 200+ tools (Salesforce, Hubspot, etc)." },
      { icon: "🛡️", title: "Enterprise Grade", description: "SSO, Audit Logs, and Role-Based Access Control." },
    ];
    features.layout = "list"; // List works best for detailed text

    // Strong Call to Action
    const ctaBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "**Start your 14-day free trial** · No credit card required\n\n[Book a live demo →](#)",
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
