import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const FeatureShowcaseLayout = {
  id: "feature-showcase-layout",
  name: "Feature Showcase",
  description: "Highlight product features with icons",
  icon: "✨",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">The Platform Advantage</h2>\n\n<p style=\"text-align: center\">Everything you need to build, scale, and manage your operations in one place.</p>",
    };

    // Row 2: Feature List
    const features = createFeatureListContent();
    features.features = [
      {
        icon: "🚀",
        title: "Deploy Anywhere",
        description: "One-click deployment to AWS, GCP, Azure, or your own metal. We abstract the complexity.",
      },
      {
        icon: "🔒",
        title: "Bank-Grade Security",
        description: "End-to-end encryption, role-based access control, and comprehensive audit logs built-in.",
      },
      {
        icon: "🎨",
        title: "Pixel-Perfect Design",
        description: "A component library that looks stunning out of the box, fully customizable to your brand.",
      },
    ];
    features.layout = "grid";
    features.columns = 3;

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          { id: nanoid(), type: BLOCK_TYPES.FEATURE_LIST, content: features },
        ],
      },
    ];
  },
};
