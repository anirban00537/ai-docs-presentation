import { nanoid } from "nanoid";
import type { Row } from "@/lib/editor/types";
import { BLOCK_TYPES, createSocialProofContent } from "../blocks/definitions";
import type { Block } from "@/lib/editor/types";

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
      content: {
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 2, textAlign: "center" },
            content: [{ type: "text", text: "Join Our Community" }],
          },
          {
            type: "paragraph",
            attrs: { textAlign: "center" },
            content: [
              {
                type: "text",
                text: "Connect with us on social media",
              },
            ],
          },
        ],
      },
    };

    // Row 2: Social Proof Block
    const socialProof = createSocialProofContent();
    socialProof.platforms = [
      {
        platform: "twitter",
        followers: "10K",
        link: "https://twitter.com/example",
      },
      {
        platform: "linkedin",
        followers: "5K",
        link: "https://linkedin.com/company/example",
      },
      {
        platform: "facebook",
        followers: "8K",
        link: "https://facebook.com/example",
      },
      {
        platform: "instagram",
        followers: "15K",
        link: "https://instagram.com/example",
      },
    ];
    socialProof.showRatings = true;
    socialProof.rating = 4.5;
    socialProof.reviewCount = "1,234 reviews";

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
