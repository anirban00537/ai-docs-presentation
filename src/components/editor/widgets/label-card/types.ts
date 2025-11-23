import type { WidgetCommon } from "../types";

export type LabelCardWidget = WidgetCommon & {
  type: "labelCard";
  label: string;
  title: string;
  description: string;
  backgroundColor?: string;
  borderColor?: string;
  labelColor?: string;
  labelTextColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  labelFontFamily?: string;
  titleFontFamily?: string;
  descriptionFontFamily?: string;
  textAlign?: "left" | "center" | "right";
  backgroundType?: "solid" | "glass";
};
