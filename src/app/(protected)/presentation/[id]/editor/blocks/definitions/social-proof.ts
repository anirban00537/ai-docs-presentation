import { SocialProofContent, ProseMirrorDocument } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";

export const createSocialProofContent = (): SocialProofContent => ({
  type: "social-proof",
  platforms: [
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
  ],
  showRatings: true,
  rating: 4.5,
  reviewCount: "1,234 reviews",
});

export const normalizeSocialProofContent = (
  content: any
): SocialProofContent => {
  const incoming = content as SocialProofContent | undefined;
  if (incoming?.platforms && Array.isArray(incoming.platforms)) {
    return {
      type: "social-proof",
      platforms: incoming.platforms.map((platform) => ({
        platform: platform.platform ?? "twitter",
        followers: platform.followers ?? "0",
        link: platform.link,
      })),
      showRatings: incoming.showRatings ?? false,
      rating: incoming.rating,
      reviewCount: incoming.reviewCount,
    };
  }
  return createSocialProofContent();
};
