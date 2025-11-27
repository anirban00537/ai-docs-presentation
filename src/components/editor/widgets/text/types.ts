import type { WidgetCommon } from "../types";

export type TextWidget = WidgetCommon & {
  type: "text";
  text: string;
  fontSize: number;
  fontWeight: number;
  fontFamily?: string;
  color?: string;
  align: "left" | "center" | "right";
  lineHeight: number;
};

