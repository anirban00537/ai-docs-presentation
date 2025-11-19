export type WidgetCommon = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type TextWidget = WidgetCommon & {
  type: "text";
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
};

export type RectangleWidget = WidgetCommon & {
  type: "rectangle";
  fill: string;
  borderRadius: number;
  stroke?: string;
  strokeWidth?: number;
};

export type CircleWidget = WidgetCommon & {
  type: "circle";
  fill: string;
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
  fill: string;
  stroke?: string;
  strokeWidth?: number;
};

export type FeatureCardWidget = WidgetCommon & {
  type: "featureCard";
  number: string;
  title: string;
  description: string;
  backgroundColor?: string;
  borderColor?: string;
  numberColor?: string;
  titleColor?: string;
  descriptionColor?: string;
};

export type SlideWidget =
  | TextWidget
  | RectangleWidget
  | CircleWidget
  | ArrowWidget
  | PolygonWidget
  | FeatureCardWidget;

export type SlideWidgetUpdate = Partial<
  Omit<WidgetCommon, "id"> & {
    text: string;
    fontSize: number;
    fontWeight: number;
    color: string;
    align: "left" | "center" | "right";
    fill: string;
    borderRadius: number;
    stroke: string;
    strokeWidth: number;
    lineHeight: number;
    shape: PolygonShape;
    number: string;
    title: string;
    description: string;
    backgroundColor: string;
    borderColor: string;
    numberColor: string;
    titleColor: string;
    descriptionColor: string;
  }
>;

export type ResizeHandle =
  | "top-left"
  | "top"
  | "top-right"
  | "right"
  | "bottom-right"
  | "bottom"
  | "bottom-left"
  | "left";
