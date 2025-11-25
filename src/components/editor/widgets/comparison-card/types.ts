import type { WidgetCommon } from "../types";
import type { BackgroundType } from "../shared/toolbar-controls/types";

export type ComparisonCardWidget = WidgetCommon & {
  type: "comparisonCard";
  leftLabel?: string;
  rightLabel?: string;
  leftTitle: string;
  rightTitle: string;
  leftItems: string[];
  rightItems: string[];
  leftAccentColor?: string;
  rightAccentColor?: string;
  leftTextColor?: string;
  rightTextColor?: string;
  leftLabelFontFamily?: string;
  rightLabelFontFamily?: string;
  leftTitleFontFamily?: string;
  rightTitleFontFamily?: string;
  leftItemFontFamily?: string;
  rightItemFontFamily?: string;
  leftLabelFontSize?: number;
  rightLabelFontSize?: number;
  leftTitleFontSize?: number;
  rightTitleFontSize?: number;
  leftItemFontSize?: number;
  rightItemFontSize?: number;
  backgroundColor?: string;
  backgroundType?: BackgroundType;
  dividerColor?: string;
  textAlign?: "left" | "center" | "right";
};


