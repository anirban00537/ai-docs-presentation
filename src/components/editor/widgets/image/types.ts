import type { WidgetCommon } from "../types";

export type ImageWidget = WidgetCommon & {
  type: "image";
  imageUrl: string;
};

