import { PricingCardContentSchema, type PricingCardContent, getDefaultHeadingContent } from "@/types/presentation";

export const createPricingCardContent = (): PricingCardContent => ({
  type: "pricing-card",
  planName: getDefaultHeadingContent(),
  price: getDefaultHeadingContent(),
  features: [
    { text: "Feature 1", included: true },
    { text: "Feature 2", included: true },
    { text: "Feature 3", included: false },
  ],
  buttonLabel: "Choose Plan",
});

export const normalizePricingCardContent = (content: any): PricingCardContent => {
  const result = PricingCardContentSchema.safeParse(content);
  if (result.success) {
    return result.data;
  }
  
  // Basic recovery for partial data
  return {
    type: "pricing-card",
    planName: content?.planName ?? getDefaultHeadingContent(),
    price: content?.price ?? getDefaultHeadingContent(),
    features: Array.isArray(content?.features) 
      ? content.features.map((f: any) => ({
          text: f?.text ?? (typeof f === 'string' ? f : ""),
          included: typeof f?.included === 'boolean' ? f.included : true,
        }))
      : [],
    buttonLabel: content?.buttonLabel ?? "Choose Plan",
  };
};
