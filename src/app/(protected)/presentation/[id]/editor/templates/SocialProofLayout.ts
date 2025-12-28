import { nanoid } from "nanoid";
import type { Row } from "@/types/presentation";
import { BLOCK_TYPES, createSocialProofContent } from "../blocks/definitions";
import type { Block } from "@/types/presentation";

export const SocialProofLayout = {
  id: "social-proof-layout",
  name: "Social Proof",
  description: "Social media followers across Twitter, LinkedIn, YouTube, and Instagram with star rating. Community momentum visualization.",
  icon: "IconDeviceMobile",
  getRows: (): Row[] => {
    // Row 1: Section Title
    const headerBlock: Block = {
      id: nanoid(),
      type: BLOCK_TYPES.PROSEMIRROR,
      content:
        '## A Growing Movement {.center}\n\nJoin over 50,000 developers across the globe who trust us. {.center}',
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
