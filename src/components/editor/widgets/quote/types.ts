import type { WidgetCommon } from "../types";

export type QuoteStyle = "minimal" | "bold" | "bordered";

export type QuoteWidget = WidgetCommon & {
  type: "quote";
  quote: string;
  attribution?: string;
  icon?: string;
  style?: QuoteStyle;
  backgroundColor?: string;
  borderColor?: string;
  quoteColor?: string;
  attributionColor?: string;
  iconColor?: string;
  quoteFontFamily?: string;
  attributionFontFamily?: string;
  quoteFontSize?: number;
  attributionFontSize?: number;
  textAlign?: "left" | "center" | "right";
  backgroundType?: "solid" | "glass";
  iconSize?: number;
};

