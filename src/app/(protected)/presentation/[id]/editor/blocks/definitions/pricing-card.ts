import { 
  PricingCardContent, 
  ProseMirrorDocument, 
  getDefaultHeadingContent, 
  createParagraphContent 
} from "@/types/presentation";

export const createPricingCardContent = (): PricingCardContent => ({
  type: "pricing-card",
  planName: getDefaultHeadingContent(),
  price: getDefaultHeadingContent(),
  features: [
    { text: createParagraphContent(), included: true },
    { text: createParagraphContent(), included: true },
    { text: createParagraphContent(), included: false },
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
          text: f?.text ?? createParagraphContent(),
          included: f?.included ?? true,
        }))
      : [],
    buttonLabel: content?.buttonLabel ?? "Choose Plan",
  };
};
