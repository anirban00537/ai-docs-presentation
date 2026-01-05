/**
 * Template Utilities
 * Shared helper functions for creating template content with proper typing.
 */

import { nanoid } from "nanoid";
import type { Block, Row } from "@/types/presentation";
import { BLOCK_TYPES } from "../blocks/definitions";

/**
 * Creates a ProseMirror markdown heading string
 * @param text - The heading text
 * @param level - Heading level (1-6)
 */
export function createHeadingDoc(text: string, level: 1 | 2 | 3 | 4 | 5 | 6 = 3): string {
  const hashes = "#".repeat(level);
  return `${hashes} ${text}`;
}

/**
 * Creates a centered heading using <align> tag syntax
 * @param text - The heading text
 * @param level - Heading level (1-6)
 */
export function createCenteredHeading(text: string, level: 1 | 2 | 3 = 2): string {
  const hashes = "#".repeat(level);
  return `<align="center">${hashes} ${text}</align>`;
}

/**
 * Creates a centered paragraph using <align> tag syntax
 * @param text - The paragraph text
 */
export function createCenteredParagraph(text: string): string {
  return `<align="center">${text}</align>`;
}

/**
 * Creates a section header with centered title and subtitle
 * @param title - The main title
 * @param subtitle - Optional subtitle
 * @param level - Heading level for the title
 */
export function createSectionHeader(
  title: string,
  subtitle?: string,
  level: 1 | 2 | 3 = 2
): string {
  let content = createCenteredHeading(title, level);
  if (subtitle) {
    content += `\n\n${createCenteredParagraph(subtitle)}`;
  }
  return content;
}

/**
 * Creates a ProseMirror block with proper typing
 * @param content - The content string
 */
export function createProseMirrorBlock(content: string): Block {
  return {
    id: nanoid(),
    type: BLOCK_TYPES.PROSEMIRROR,
    content,
  };
}

/**
 * Creates a typed block with nanoid
 * @param type - The block type
 * @param content - The block content
 */
export function createTypedBlock<T>(type: string, content: T): Block {
  return {
    id: nanoid(),
    type,
    content,
  } as Block;
}

/**
 * Creates a row with blocks
 * @param blocks - Array of blocks
 * @param columnWidths - Optional column width ratios
 */
export function createRow(blocks: Block[], columnWidths?: number[]): Row {
  return {
    id: nanoid(),
    blocks,
    columnWidths,
  };
}

/**
 * Template category type for organizing templates
 */
export type TemplateCategory =
  | "introduction"
  | "content";

/**
 * Template metadata for search and filtering
 */
export interface TemplateMetadata {
  /** Unique template ID */
  id: string;
  /** Display name */
  name: string;
  /** Brief description */
  description: string;
  /** Icon (emoji or icon name) */
  icon: string;
  /** Template category */
  category: TemplateCategory;
  /** Search keywords */
  keywords: string[];
  /** Whether the template is featured */
  featured?: boolean;
  /** Recommended use cases */
  useCases?: string[];
}

/**
 * Extended layout template with metadata
 */
export interface ExtendedLayoutTemplate {
  /** Template metadata */
  metadata: TemplateMetadata;
  /** Function to generate template rows */
  getRows: () => Row[];
}
