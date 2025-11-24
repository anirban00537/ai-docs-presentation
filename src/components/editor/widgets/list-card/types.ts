import type { WidgetCommon } from "../types";

export type ListWidget = WidgetCommon & {
  type: "list";
  items: string[];
  listType?: "bullet" | "numbered";
  title?: string;
  backgroundColor?: string;
  borderColor?: string;
  titleColor?: string;
  itemColor?: string;
  bulletColor?: string;
  titleFontFamily?: string;
  titleFontSize?: number;
  itemFontFamily?: string;
  itemFontSize?: number;
  textAlign?: "left" | "center" | "right";
  backgroundType?: "solid" | "glass";
};
