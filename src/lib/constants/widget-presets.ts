import type {
  TextPreset,
  ShapePreset,
} from "@/components/editor/editor-toolbar";
import type { PolygonShape } from "@/components/editor/widgets/types";

type TextPresetId = TextPreset["id"];
type ShapePresetId = ShapePreset["id"];

export const SLIDE_DIMENSIONS = {
  width: 1280,
  height: 720,
};

export const TEXT_PRESET_CONFIG: Record<
  TextPresetId,
  {
    width: number;
    height: number;
    fontSize: number;
    fontWeight: number;
    align: "left" | "center" | "right";
    lineHeight: number;
  }
> = {
  heading: {
    width: 960,
    height: 184,
    fontSize: 96,
    fontWeight: 600,
    align: "center",
    lineHeight: 1,
  },
  subheading: {
    width: 820,
    height: 140,
    fontSize: 48,
    fontWeight: 500,
    align: "center",
    lineHeight: 1.05,
  },
  body: {
    width: 720,
    height: 240,
    fontSize: 24,
    fontWeight: 400,
    align: "left",
    lineHeight: 1.4,
  },
};

export const DEFAULT_SHAPE_FILL = "#1f2937";
export const DEFAULT_OUTLINE_STROKE = "#1f2937";
export const DEFAULT_OUTLINE_STROKE_WIDTH = 8;

export const SHAPE_PRESET_CONFIG: Record<
  ShapePresetId,
  | {
      type: "rectangle";
      width: number;
      height: number;
      fill: string;
      borderRadius: number;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: "circle";
      width: number;
      height: number;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: "polygon";
      width: number;
      height: number;
      shape: PolygonShape;
      fill: string;
      stroke?: string;
      strokeWidth?: number;
    }
  | {
      type: "arrow";
      width: number;
      height: number;
      stroke: string;
      strokeWidth: number;
    }
> = {
  "square-solid": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: DEFAULT_SHAPE_FILL,
    borderRadius: 4,
  },
  "rounded-square-solid": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: DEFAULT_SHAPE_FILL,
    borderRadius: 36,
  },
  "circle-solid": {
    type: "circle",
    width: 220,
    height: 220,
    fill: DEFAULT_SHAPE_FILL,
  },
  "triangle-solid": {
    type: "polygon",
    width: 240,
    height: 230,
    shape: "triangle",
    fill: DEFAULT_SHAPE_FILL,
  },
  "diamond-solid": {
    type: "polygon",
    width: 240,
    height: 240,
    shape: "diamond",
    fill: DEFAULT_SHAPE_FILL,
  },
  "star-solid": {
    type: "polygon",
    width: 260,
    height: 240,
    shape: "star",
    fill: DEFAULT_SHAPE_FILL,
  },
  "square-outline": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: "transparent",
    borderRadius: 4,
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "rounded-square-outline": {
    type: "rectangle",
    width: 220,
    height: 220,
    fill: "transparent",
    borderRadius: 36,
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "circle-outline": {
    type: "circle",
    width: 220,
    height: 220,
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "triangle-outline": {
    type: "polygon",
    width: 240,
    height: 230,
    shape: "triangle",
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "diamond-outline": {
    type: "polygon",
    width: 240,
    height: 240,
    shape: "diamond",
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  "star-outline": {
    type: "polygon",
    width: 260,
    height: 240,
    shape: "star",
    fill: "transparent",
    stroke: DEFAULT_OUTLINE_STROKE,
    strokeWidth: DEFAULT_OUTLINE_STROKE_WIDTH,
  },
  arrow: {
    type: "arrow",
    width: 260,
    height: 80,
    stroke: "#14B8A6",
    strokeWidth: 8,
  },
};
