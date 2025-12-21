import { BlockType } from "./block-types";
import { BlockContent } from "./block-content";

export interface Block<T = BlockContent> {
  id: string;
  type?: BlockType;
  content: T;
}

export interface Row {
  id: string;
  blocks: Block[];
  columnWidths?: number[];
}

export interface Slide {
  id: string;
  rows: Row[];
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
