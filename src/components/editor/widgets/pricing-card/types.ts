import type { WidgetCommon } from "../types";

export type PricingCardWidget = WidgetCommon & {
  type: "pricingCard";
  planName: string;
  price: string;
  period: string;
  badge?: string;
  features: string[];
  buttonText: string;
  backgroundColor?: string;
  borderColor?: string;
  planNameColor?: string;
  priceColor?: string;
  periodColor?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  featureColor?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  planNameFontFamily?: string;
  planNameFontSize?: number;
  priceFontFamily?: string;
  priceFontSize?: number;
  periodFontFamily?: string;
  periodFontSize?: number;
  badgeFontFamily?: string;
  badgeFontSize?: number;
  featureFontFamily?: string;
  featureFontSize?: number;
  buttonFontFamily?: string;
  buttonFontSize?: number;
  textAlign?: "left" | "center" | "right";
  backgroundType?: "solid" | "glass" | "transparent";
};

