import type { WidgetCommon } from "../types";

export type RectangleWidget = WidgetCommon & {
  type: "rectangle";
  fill?: string;
  borderRadius: number;
  stroke?: string;
  strokeWidth?: number;
};

export type CircleWidget = WidgetCommon & {
  type: "circle";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};

export type ArrowWidget = WidgetCommon & {
  type: "arrow";
  stroke: string;
  strokeWidth: number;
};

export type PolygonShape = "triangle" | "diamond" | "star";

export type PolygonWidget = WidgetCommon & {
  type: "polygon";
  shape: PolygonShape;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
};
