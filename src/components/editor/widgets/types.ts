export type WidgetCommon = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

import type { TextWidget } from "./text/types";
export type { TextWidget };

export type {
  RectangleWidget,
  CircleWidget,
  ArrowWidget,
  PolygonWidget,
  PolygonShape,
} from "./shape/types";

export type { NumberCardWidget } from "./number-card/types";
export type { IconCardWidget } from "./icon-card/types";

export type { LabelCardWidget } from "./label-card/types";
export type { ListWidget } from "./list-card/types";
export type { QuoteWidget, QuoteStyle } from "./quote/types";

export type SlideWidget =
  | TextWidget
  | import("./shape/types").RectangleWidget
  | import("./shape/types").CircleWidget
  | import("./shape/types").ArrowWidget
  | import("./shape/types").PolygonWidget
  | import("./number-card/types").NumberCardWidget
  | import("./icon-card/types").IconCardWidget
  | import("./label-card/types").LabelCardWidget
  | import("./list-card/types").ListWidget
  | import("./quote/types").QuoteWidget;

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
    shape: import("./shape/types").PolygonShape;
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
    quote: string;
    attribution: string;
    style: import("./quote/types").QuoteStyle;
    quoteColor: string;
    attributionColor: string;
    quoteFontFamily: string;
    attributionFontFamily: string;
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
