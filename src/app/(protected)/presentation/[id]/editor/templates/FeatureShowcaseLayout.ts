import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

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
      content: "## The Platform Advantage\n\nEverything you need to build, scale, and manage your operations in one place.",
    };

    // Row 2: Feature List
    const features = createFeatureListContent();
    features.features = [
      {
        icon: "🚀",
        title: createParagraphContent("Deploy Anywhere"),
        description: createParagraphContent("One-click deployment to AWS, GCP, Azure, or your own metal. We abstract the complexity."),
      },
      {
        icon: "🔒",
        title: createParagraphContent("Bank-Grade Security"),
        description: createParagraphContent("End-to-end encryption, role-based access control, and comprehensive audit logs built-in."),
      },
      {
        icon: "🎨",
        title: createParagraphContent("Pixel-Perfect Design"),
        description: createParagraphContent("A component library that looks stunning out of the box, fully customizable to your brand."),
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
