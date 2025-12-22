import { SocialProofContentSchema, type SocialProofContent } from "@/types/presentation";

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
  const result = SocialProofContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  
  return createSocialProofContent();
};
