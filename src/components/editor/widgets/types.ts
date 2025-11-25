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

export type { NumberCardWidget } from "./number-card/types";
export type { IconCardWidget } from "./icon-card/types";
export type { ImageCardWidget } from "./image-card/types";

export type { LabelCardWidget } from "./label-card/types";
export type { ListWidget } from "./list-card/types";
export type { QuoteWidget, QuoteStyle } from "./quote/types";
export type { ComparisonCardWidget } from "./comparison-card/types";

export type SlideWidget =
  | TextWidget
  | import("./number-card/types").NumberCardWidget
  | import("./icon-card/types").IconCardWidget
  | import("./image-card/types").ImageCardWidget
  | import("./label-card/types").LabelCardWidget
  | import("./list-card/types").ListWidget
  | import("./quote/types").QuoteWidget
  | import("./comparison-card/types").ComparisonCardWidget;

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
    backgroundType: "solid" | "glass" | "transparent";
    imageUrl: string;
    imageStyle:
      | "hero"
      | "background"
      | "backgroundGlass"
      | "left"
      | "right"
      | "bottom";
    quote: string;
    attribution: string;
    style: import("./quote/types").QuoteStyle;
    quoteColor: string;
    attributionColor: string;
    quoteFontFamily: string;
    attributionFontFamily: string;
    leftTitle: string;
    rightTitle: string;
    leftItems: string[];
    rightItems: string[];
    leftAccentColor: string;
    rightAccentColor: string;
    leftTextColor: string;
    rightTextColor: string;
    leftTitleFontFamily: string;
    rightTitleFontFamily: string;
    leftItemFontFamily: string;
    rightItemFontFamily: string;
    leftTitleFontSize: number;
    rightTitleFontSize: number;
    leftItemFontSize: number;
    rightItemFontSize: number;
    dividerColor: string;
    leftLabel: string;
    rightLabel: string;
    leftLabelFontFamily: string;
    rightLabelFontFamily: string;
    leftLabelFontSize: number;
    rightLabelFontSize: number;
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
