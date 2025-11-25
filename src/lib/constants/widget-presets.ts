import type { TextPreset } from "@/components/editor/types";

type TextPresetId = TextPreset["id"];

export const SLIDE_DIMENSIONS = {
  width: 1920,
  height: 1080,
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
    width: 1440,
    height: 276,
    fontSize: 144,
    fontWeight: 600,
    align: "center",
    lineHeight: 1,
  },
  subheading: {
    width: 1230,
    height: 210,
    fontSize: 72,
    fontWeight: 500,
    align: "center",
    lineHeight: 1.05,
  },
  body: {
    width: 1080,
    height: 360,
    fontSize: 36,
    fontWeight: 400,
    align: "left",
    lineHeight: 1.4,
  },
};
