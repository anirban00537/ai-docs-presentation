export type TextPreset = {
  id: string;
  title: string;
};

export type FeatureCardPreset = {
  id: string;
  title: string;
  description: string;
};

export type IconCardPreset = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

export type ImageCardPreset = {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  imageStyle?: "hero" | "background" | "backgroundGlass" | "left" | "right" | "bottom";
};

export type LabelCardPreset = {
  id: string;
  label: string;
  title: string;
  description: string;
};

export type ListCardPreset = {
  id: string;
  title?: string;
  items: string[];
  listType?: "bullet" | "numbered";
};

export type ComparisonCardPreset = {
  id: string;
  leftLabel?: string;
  rightLabel?: string;
  leftTitle?: string;
  rightTitle?: string;
  leftItems?: string[];
  rightItems?: string[];
  leftAccentColor?: string;
  rightAccentColor?: string;
};

export type QuotePreset = {
  id: string;
  quote: string;
  attribution?: string;
  icon?: string;
  style?: "minimal" | "bold" | "bordered";
};
