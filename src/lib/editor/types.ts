export interface Block {
  id: string;
  type?: string; // block type identifier, e.g., "prosemirror" | "number-card"
  content: any;
}

export interface Row {
  id: string;
  blocks: Block[];
}

export interface Slide {
  id: string;
  rows: Row[];
}

export interface Theme {
  primary: string;
  headingColor: string;
  bodyColor: string;
  cardBackground: string;
  pageBackground: string;
  fontFamily?: string;
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

