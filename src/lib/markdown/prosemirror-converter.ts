import { Node as ProseMirrorNode, Schema } from "prosemirror-model";
import {
  defaultMarkdownSerializer,
  defaultMarkdownParser,
} from "prosemirror-markdown";
import { schema } from "@/components/prosemirror/schema";

// Legacy ProseMirrorDocument type (for backward compatibility)
export interface LegacyProseMirrorDocument {
  type: "doc";
  content: any[];
}

/**
 * Convert ProseMirror JSON document to Markdown string
 * @param doc - ProseMirror JSON document or Markdown string (for passthrough)
 * @param targetSchema - ProseMirror schema to use (defaults to editor schema)
 * @returns Markdown string
 */
export function prosemirrorToMarkdown(
  doc: LegacyProseMirrorDocument | string,
  targetSchema: Schema = schema
): string {
  // If already a string, assume it's already Markdown
  if (typeof doc === "string") {
    return doc;
  }

  // If not a valid ProseMirror document, return empty string
  if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) {
    return "";
  }

  try {
    // Parse JSON to ProseMirror Node
    const prosemirrorNode = ProseMirrorNode.fromJSON(targetSchema, doc);

    // Use default markdown serializer
    // Note: This works with custom schemas as long as node types match
    const markdown = defaultMarkdownSerializer.serialize(prosemirrorNode);

    return markdown;
  } catch (error) {
    console.warn("Failed to convert ProseMirror to Markdown:", error);
    return "";
  }
}

/**
 * Convert Markdown string to ProseMirror JSON document
 * @param markdown - Markdown string
 * @param targetSchema - ProseMirror schema to use (defaults to editor schema)
 * @returns ProseMirror JSON document
 */
export function markdownToProseMirror(
  markdown: string,
  targetSchema: Schema = schema
): LegacyProseMirrorDocument {
  // Handle empty or invalid Markdown
  if (!markdown || typeof markdown !== "string") {
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [],
        },
      ],
    };
  }

  try {
    // Use default markdown parser
    // Note: This creates a document using the default schema, then we convert to our schema
    const defaultDoc = defaultMarkdownParser.parse(markdown);

    // Convert the default schema document to our custom schema
    // We do this by converting to JSON and then parsing with our schema
    const defaultJson = defaultDoc.toJSON();

    // Parse with our custom schema to ensure compatibility
    const prosemirrorNode = ProseMirrorNode.fromJSON(targetSchema, defaultJson);

    // Convert back to JSON using our schema
    const json = prosemirrorNode.toJSON();

    return json as LegacyProseMirrorDocument;
  } catch (error) {
    console.warn("Failed to convert Markdown to ProseMirror:", error);
    // Return empty paragraph as fallback
    return {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: markdown
            ? [
                {
                  type: "text",
                  text: markdown,
                },
              ]
            : [],
        },
      ],
    };
  }
}

/**
 * Check if content is legacy ProseMirror JSON format
 * @param content - Content to check
 * @returns true if content is legacy JSON format
 */
export function isLegacyProseMirrorFormat(
  content: any
): content is LegacyProseMirrorDocument {
  return (
    content &&
    typeof content === "object" &&
    content.type === "doc" &&
    Array.isArray(content.content)
  );
}

/**
 * Check if content is Markdown string format
 * @param content - Content to check
 * @returns true if content is Markdown string
 */
export function isMarkdownFormat(content: any): content is string {
  return typeof content === "string";
}

/**
 * Normalize content to Markdown format
 * Converts legacy JSON to Markdown, or returns Markdown as-is
 * @param content - Content in either format
 * @returns Markdown string
 */
export function normalizeToMarkdown(content: any): string {
  if (isMarkdownFormat(content)) {
    return content;
  }

  if (isLegacyProseMirrorFormat(content)) {
    return prosemirrorToMarkdown(content);
  }

  // Fallback: return empty string
  return "";
}
