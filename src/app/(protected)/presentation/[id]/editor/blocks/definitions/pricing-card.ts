import { PricingCardContent, ProseMirrorDocument, getDefaultHeadingContent } from "@/types/presentation";

export const createPricingCardContent = (): PricingCardContent => ({
  type: "pricing-card",
  planName: getDefaultHeadingContent(),
  price: getDefaultHeadingContent(),
  features: [
    { text: "", included: true },
    { text: "", included: true },
    { text: "", included: false },
  ],
  buttonLabel: "Choose Plan",
});

export const normalizePricingCardContent = (content: any): PricingCardContent => {
  return {
    type: "pricing-card",
    planName: content?.planName ?? getDefaultHeadingContent(),
    price: content?.price ?? getDefaultHeadingContent(),
    features: Array.isArray(content?.features) 
      ? content.features.map((f: any) => ({
          text: f?.text ?? "",
          included: f?.included ?? true,
        }))
      : [],
    buttonLabel: content?.buttonLabel ?? "Choose Plan",
  };
};
