import type { WidgetCommon } from "../types";

export type ImageCardWidget = WidgetCommon & {
  type: "imageCard";
  imageUrl?: string;
  imageStyle?: "hero" | "background" | "backgroundGlass" | "left" | "right" | "bottom";
  title?: string;
  description?: string;
  titleColor?: string;
  descriptionColor?: string;
  backgroundColor?: string;
  backgroundType?: "solid" | "glass" | "transparent";
  textAlign?: "left" | "center" | "right";
  titleFontFamily?: string;
  descriptionFontFamily?: string;
  titleFontSize?: number;
  descriptionFontSize?: number;
};
