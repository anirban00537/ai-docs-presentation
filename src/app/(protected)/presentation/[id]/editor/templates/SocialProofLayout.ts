import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createSocialProofContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";
import { createParagraphContent } from "../blocks/definitions/common";

export const SocialProofLayout = {
  id: "social-proof-layout",
  name: "Social Proof",
  description: "Display social media stats and ratings",
  icon: "📱",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content: "<h2 style=\"text-align: center\">A Growing Movement</h2>\n\n<p style=\"text-align: center\">Join over 50,000 developers across the globe who trust us.</p>",
    };

    // Row 2: Social Proof Block
    const socialProof = createSocialProofContent();
    socialProof.platforms = [
      {
        platform: "twitter",
        followers: "25.2K",
        link: "https://twitter.com/example",
      },
      {
        platform: "linkedin",
        followers: "18.4K",
        link: "https://linkedin.com/company/example",
      },
      {
        platform: "youtube",
        followers: "7.1K",
        link: "https://youtube.com/example",
      },
      {
        platform: "instagram",
        followers: "12K",
        link: "https://instagram.com/example",
      },
    ];
    socialProof.showRatings = true;
    socialProof.rating = 4.9;
    socialProof.reviewCount = "2,300+ reviews";

    return [
      {
        id: nanoid(),
        blocks: [headerBlock],
      },
      {
        id: nanoid(),
        blocks: [
          {
            id: nanoid(),
            type: BLOCK_TYPES.SOCIAL_PROOF,
            content: socialProof,
          },
        ],
      },
    ];
  },
};
