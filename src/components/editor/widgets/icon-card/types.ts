import type { WidgetCommon } from "../types";

export type IconCardWidget = WidgetCommon & {
  type: "iconCard";
  icon: string;
  title: string;
  description: string;
  backgroundColor?: string;
  borderColor?: string;
  iconColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  iconSize?: number;
  titleFontSize?: number;
  descriptionFontSize?: number;
  titleFontFamily?: string;
  descriptionFontFamily?: string;
  textAlign?: "left" | "center" | "right";
  backgroundType?: "solid" | "glass";
};

