import type { WidgetCommon } from "../types";

export type NumberCardWidget = WidgetCommon & {
  type: "numberCard";
  number: string;
  title: string;
  description: string;
  backgroundColor?: string;
  borderColor?: string;
  numberColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  numberFontFamily?: string;
  titleFontFamily?: string;
  descriptionFontFamily?: string;
  textAlign?: "left" | "center" | "right";
  backgroundType?: "solid" | "glass";
};

