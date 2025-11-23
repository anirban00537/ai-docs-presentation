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
  titleFontFamily?: string;
  descriptionFontFamily?: string;
  textAlign?: "left" | "center" | "right";
  backgroundType?: "solid" | "glass";
};

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

export type { ListWidget } from "./list-card/types";

export type SlideWidget =
  | TextWidget
  | RectangleWidget
  | CircleWidget
  | ArrowWidget
  | PolygonWidget
  | NumberCardWidget
  | IconCardWidget
  | LabelCardWidget
  | import("./list-card/types").ListWidget;

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
    icon: string;
    label: string;
    title: string;
    description: string;
    backgroundColor: string;
    borderColor: string;
    numberColor: string;
    iconColor: string;
    labelColor: string;
    labelTextColor: string;
    titleColor: string;
    descriptionColor: string;
    iconSize: number;
    numberFontFamily: string;
    titleFontFamily: string;
    descriptionFontFamily: string;
    labelFontFamily: string;
    items: string[];
    listType: "bullet" | "numbered";
    itemColor: string;
    bulletColor: string;
    itemFontFamily: string;
    textAlign: "left" | "center" | "right";
    backgroundType: "solid" | "glass";
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

export type SnapLine = {
  type: "vertical" | "horizontal";
  position: number; // x or y coordinate
  start: number; // start of the line segment (e.g. min y for vertical line)
  end: number; // end of the line segment
};
