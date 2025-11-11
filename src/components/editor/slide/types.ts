export type ElementCommon = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type TextElement = ElementCommon & {
  type: "text";
  text: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align: "left" | "center" | "right";
  lineHeight: number;
};

export type RectangleElement = ElementCommon & {
  type: "rectangle";
  fill: string;
  borderRadius: number;
};

export type CircleElement = ElementCommon & {
  type: "circle";
  fill: string;
};

export type ArrowElement = ElementCommon & {
  type: "arrow";
  stroke: string;
  strokeWidth: number;
};

export type SlideElement =
  | TextElement
  | RectangleElement
  | CircleElement
  | ArrowElement;

export type SlideElementUpdate = Partial<
  Omit<ElementCommon, "id"> & {
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
