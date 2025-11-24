import React from "react";

export type TextPreset = {
  id: string;
  title: string;
};

export type ShapeCategory = "essential" | "outlined" | "lines";

export type ShapePreset = {
  id: string;
  title: string;
  category: ShapeCategory;
  preview: React.ReactNode;
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

export type QuotePreset = {
  id: string;
  quote: string;
  attribution?: string;
  icon?: string;
  style?: "minimal" | "bold" | "bordered";
};
