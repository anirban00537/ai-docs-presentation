/**
 * Schema types matching the frontend template structure
 * These types are used for template schemas stored as files
 */

export interface Block {
  id: string;
  type?: string; // block type identifier, e.g., "prosemirror" | "number-card"
  content: any;
}

export interface Row {
  id: string;
  blocks: Block[];
  columnWidths?: number[]; // Array of widths in fractional units (e.g., [1, 1, 1] for equal columns)
}

export interface TemplateSchema {
  id: string;
  name: string;
  description: string;
  icon: string;
  rows: Row[];
  tags?: string[]; // Optional tags for categorization
}

export interface SchemaMetadata {
  id: string;
  name: string;
  description: string;
  tags?: string[];
}
