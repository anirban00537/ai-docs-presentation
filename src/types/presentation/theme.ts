export type CardDesignPattern =
  | "none"
  | "gaussian"
  | "fractal"
  | "fluid"
  | "prism"
  | "beams"
  | "aurora"
  | "nebula"
  | "ether"
  | "lumina"
  | "horizon"
  | "pulse"
  | "vortex"
  | "echo"
  | "apex"
  | "arch";

export interface Theme {
  primary: string;
  secondaryColors?: string[];
  headingColor: string;
  bodyColor: string;
  cardBackground: string;
  pageBackground: string;
  fontFamily?: string;
  themeType?: "light" | "dark";

  // Card customization
  cardDesignPattern?: CardDesignPattern;
  cardDesignPatternOpacity?: number;
  borderColor?: string;
  cardBorderRadius?: string;
  cardBoxShadow?: string;
  cardBorderWidth?: string;
  cardBorderStyle?: string;
  cardBackdropBlur?: string;
  cardOpacity?: number;

  // Texture & Overlays
  cardNoiseOpacity?: number;
  cardVignetteOpacity?: number;
}
