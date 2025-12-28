import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createFeatureListContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const FeatureShowcaseLayout = {
  id: "feature-showcase-layout",
  name: "Feature Showcase",
  description: "Three-column icon grid featuring deployment, security, and design capabilities. Ideal for product capability overviews.",
  icon: "IconRocket",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## The Platform Advantage {.center}\n\nEverything you need to build, scale, and manage your operations in one place. {.center}',
    };

    // Row 2: Feature List
    const features = createFeatureListContent();
    features.features = [
      {
        icon: "IconCloudUpload",
        title: "Deploy Anywhere",
        description:
          "One-click deployment to AWS, GCP, Azure, or your own metal. We abstract the complexity.",
      },
      {
        icon: "IconLockCheck",
        title: "Bank-Grade Security",
        description:
          "End-to-end encryption, role-based access control, and comprehensive audit logs built-in.",
      },
      {
        icon: "IconPalette",
        title: "Pixel-Perfect Design",
        description:
          "A component library that looks stunning out of the box, fully customizable to your brand.",
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
