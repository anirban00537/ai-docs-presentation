import { ProseMirrorDocument, getDefaultHeadingContent, createParagraphContent } from "./common";

export interface PricingFeature {
  text: ProseMirrorDocument;
  included: boolean;
}

export interface PricingCardContent {
  planName: ProseMirrorDocument;
  price: ProseMirrorDocument;
  features: PricingFeature[];
  isRecommended: boolean;
  buttonLabel: string;
}

export const createPricingCardContent = (): PricingCardContent => ({
  planName: getDefaultHeadingContent(),
  price: getDefaultHeadingContent(),
  features: [
    { text: createParagraphContent(), included: true },
    { text: createParagraphContent(), included: true },
    { text: createParagraphContent(), included: false },
  ],
  isRecommended: false,
  buttonLabel: "Choose Plan",
});

export const normalizePricingCardContent = (content: any): PricingCardContent => {
  return {
    planName: content?.planName ?? getDefaultHeadingContent(),
    price: content?.price ?? getDefaultHeadingContent(),
    features: Array.isArray(content?.features) 
      ? content.features.map((f: any) => ({
          text: f?.text ?? createParagraphContent(),
          included: f?.included ?? true,
        }))
      : [],
    isRecommended: content?.isRecommended ?? false,
    buttonLabel: content?.buttonLabel ?? "Choose Plan",
  };
};
