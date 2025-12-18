export interface Block {
  id: string;
  type?: string; // block type identifier, e.g., "prosemirror" | "number-card"
  content: any;
}

export interface Row {
  id: string;
  blocks: Block[];
  columnWidths?: number[]; // Array of widths in percentages or pixels (e.g., [33.33, 33.33, 33.34])
}

export interface Slide {
  id: string;
  rows: Row[];
}

export interface Theme {
  primary: string;
  secondaryColors?: string[]; // Array of secondary colors
  headingColor: string;
  bodyColor: string;
  cardBackground: string;
  pageBackground: string;
  fontFamily?: string;
  themeType?: "light" | "dark";

  // Card customization
  cardDesignPattern?: string; // "none", "dots", "grid", "mesh", "glass", "waves"
  cardBorderColor?: string;
  cardStyle?: "standard" | "flat" | "outline" | "sharp" | "blocky" | "glass" | "rounded" | "soft-cloud" | "capsule";
}

export interface PresentationInfo {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  isPublic: boolean;
  isTemplate: boolean;
  tags: string[];
  version: number;
  parentId: string | null;
  forkedFrom: string | null;
  sharedWith: string[];
  ownerId: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  lastViewedAt: string | null;
}
