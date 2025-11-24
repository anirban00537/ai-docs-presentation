import React from "react";
import { AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import type { TextWidget } from "./types";

export const TOOLBAR_SELECTOR = '[data-text-toolbar="true"]';

export const TEXT_STYLE_PRESETS = [
  {
    id: "title",
    label: "Title",
    fontSize: 144,
    fontWeight: 600,
    lineHeight: 1,
    align: "center" as const,
  },
  {
    id: "subtitle",
    label: "Subtitle",
    fontSize: 72,
    fontWeight: 500,
    lineHeight: 1.05,
    align: "center" as const,
  },
  {
    id: "body",
    label: "Body",
    fontSize: 36,
    fontWeight: 400,
    lineHeight: 1.4,
    align: "left" as const,
  },
];

export const ALIGN_OPTIONS: Array<{
  value: TextWidget["align"];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
}> = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
];
