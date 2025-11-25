import type { ReactNode } from "react";

export type BackgroundType = "solid" | "glass" | "transparent";
export type TextAlign = "left" | "center" | "right";

export interface ColorPickerConfig {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  showReset?: boolean;
  resetValue?: string;
  resetLabel?: string;
}

export interface BackgroundTypeConfig {
  value: BackgroundType;
  onChange: (type: BackgroundType) => void;
}

export interface FontFamilyConfig {
  value: string;
  onChange: (fontFamily: string) => void;
}

export interface FontSizeConfig {
  value: number;
  onChange: (size: number) => void;
  options?: Array<{ label: string; value: number }>;
}

export interface AlignmentConfig {
  value: TextAlign;
  onChange: (align: TextAlign) => void;
}

export interface ToolbarControlConfig {
  type: "color-picker" | "background-type" | "font-family" | "font-size" | "alignment" | "custom" | "separator";
  config?: ColorPickerConfig | BackgroundTypeConfig | FontFamilyConfig | FontSizeConfig | AlignmentConfig;
  showWhen?: (activeField: string | null) => boolean;
  customRender?: (activeField: string | null) => ReactNode;
}

import type { Viewport } from "@/hooks/use-canvas-viewport";

export interface WidgetToolbarProps {
  widgetRef: React.RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: React.RefObject<HTMLElement | null>;
  isEditing: boolean;
  activeField: string | null;
  controls: ToolbarControlConfig[];
  customControls?: ReactNode;
  toolbarSelector?: string;
}

