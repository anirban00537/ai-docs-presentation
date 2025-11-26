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
    fontFamily: string;
    align: "left" | "center" | "right";
    lineHeight: number;
  }
> = {
  heading: {
    width: 560,
    height: 276,
    fontSize: 144,
    fontWeight: 600,
    fontFamily: "var(--font-abril-fatface), 'Abril Fatface', serif",
    align: "left",
    lineHeight: 1,
  },
  subheading: {
    width: 400,
    height: 210,
    fontSize: 72,
    fontWeight: 500,
    fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
    align: "left",
    lineHeight: 1.05,
  },
  body: {
    width: 360,
    height: 360,
    fontSize: 36,
    fontWeight: 400,
    fontFamily: "var(--font-inter), Inter, sans-serif",
    align: "left",
    lineHeight: 1.4,
  },
};
