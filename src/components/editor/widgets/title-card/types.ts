import type { WidgetCommon } from "../types";
import type { BackgroundType } from "../shared/toolbar-controls/types";

export type TitleCardWidget = WidgetCommon & {
  type: "titleCard";
  eyebrow?: string;
  title: string;
  subtitle?: string;
  backgroundColor?: string;
  backgroundType?: BackgroundType;
  textAlign?: "left" | "center" | "right";
  eyebrowColor?: string;
  titleColor?: string;
  subtitleColor?: string;
  eyebrowFontFamily?: string;
  titleFontFamily?: string;
  subtitleFontFamily?: string;
  eyebrowFontSize?: number;
  titleFontSize?: number;
  subtitleFontSize?: number;
};
