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
 * Recursively serialize ProseMirror JSON to Markdown with HTML tags for alignment
 */
function serializeNodeToMarkdown(node: any): string {
  if (!node || !node.type) return "";

  const parts: string[] = [];

  // Handle alignment for paragraphs and headings using HTML tags
  if (node.type === "paragraph" || node.type === "heading") {
    const textAlign = node.attrs?.textAlign;
    const text =
      node.content
        ?.map((child: any) => {
          if (child.type === "text") return child.text || "";
          if (child.type === "hard_break") return "\n";
          return "";
        })
        .join("") || "";

    // Wrap in HTML tag if alignment is not left
    if (textAlign && textAlign !== "left") {
      if (node.type === "heading") {
        const level = node.attrs?.level || 1;
        parts.push(
          `<h${level} style="text-align: ${textAlign}">${text}</h${level}>`
        );
      } else {
        parts.push(`<p style="text-align: ${textAlign}">${text}</p>`);
      }
    } else {
      // Default alignment - use standard markdown
      if (node.type === "heading") {
        const level = node.attrs?.level || 1;
        const prefix = "#".repeat(level);
        parts.push(`${prefix} ${text}`);
      } else {
        parts.push(text);
      }
    }
  } else if (node.type === "bullet_list" || node.type === "ordered_list") {
    // Handle lists
    node.content?.forEach((item: any, index: number) => {
      if (item.type === "list_item") {
        const itemText =
          item.content
            ?.map((child: any) => {
              if (child.type === "paragraph") {
                return serializeNodeToMarkdown(child);
              }
              return "";
            })
            .join("") || "";

        if (node.type === "ordered_list") {
          parts.push(`${index + 1}. ${itemText}`);
        } else {
          parts.push(`- ${itemText}`);
        }
      }
    });
  } else if (node.type === "blockquote") {
    // Handle blockquotes
    const quoteText =
      node.content
        ?.map((child: any) => serializeNodeToMarkdown(child))
        .join("\n") || "";
    parts.push(
      quoteText
        .split("\n")
        .map((line: string) => `> ${line}`)
        .join("\n")
    );
  } else if (node.type === "code_block") {
    // Handle code blocks
    const code =
      node.content?.map((child: any) => child.text || "").join("") || "";
    parts.push("```\n" + code + "\n```");
  } else if (node.content) {
    // Recursively process other nodes
    node.content.forEach((child: any) => {
      parts.push(serializeNodeToMarkdown(child));
    });
  }

  return parts.join("\n");
}

/**
 * Convert ProseMirror JSON document to Markdown string
 * Preserves alignment information using HTML tags
 * @param doc - ProseMirror JSON document or Markdown string (for passthrough)
 * @param targetSchema - ProseMirror schema to use (defaults to editor schema)
 * @returns Markdown string with alignment preserved as HTML
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
    // Use custom serialization to preserve alignment with HTML tags
    const markdown = serializeNodeToMarkdown(doc);
    return markdown.trim();
  } catch (error) {
    console.warn("Failed to convert ProseMirror to Markdown:", error);
    // Fallback to default serializer
    try {
      const prosemirrorNode = ProseMirrorNode.fromJSON(targetSchema, doc);
      return defaultMarkdownSerializer.serialize(prosemirrorNode);
    } catch {
      return "";
    }
  }
}

/**
 * Convert Markdown string to ProseMirror JSON document
 * Restores alignment information from HTML tags
 * @param markdown - Markdown string with optional HTML tags for alignment
 * @param targetSchema - ProseMirror schema to use (defaults to editor schema)
 * @returns ProseMirror JSON document with alignment preserved
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
    // First, parse HTML tags to extract alignment
    // Match HTML tags like <p style="text-align: center">text</p> or <h1 style="text-align: right">text</h1>
    // Handle both single and double quotes, and various spacing
    const htmlTagRegex =
      /<(p|h[1-6])\s+style\s*=\s*["']text-align\s*:\s*(left|center|right|justify)\s*["']\s*>([\s\S]*?)<\/\1>/gi;
    const alignmentMap = new Map<string, string>(); // Maps text content to alignment
    const replacements: Array<{
      original: string;
      replacement: string;
      alignment: string;
    }> = [];

    let processedMarkdown = markdown;
    let match;

    // Extract HTML tags and replace with plain markdown, storing alignment
    // Reset regex lastIndex to start from beginning
    htmlTagRegex.lastIndex = 0;
    while ((match = htmlTagRegex.exec(markdown)) !== null) {
      const [fullMatch, tag, alignment, content] = match;
      const isHeading = tag.startsWith("h");
      const level = isHeading ? parseInt(tag[1]) : 0;

      // Create a unique key for this content
      const contentKey = content.trim();
      alignmentMap.set(contentKey, alignment);

      // Store replacement info
      if (isHeading) {
        const headingPrefix = "#".repeat(level);
        replacements.push({
          original: fullMatch,
          replacement: `${headingPrefix} ${contentKey}`,
          alignment,
        });
      } else {
        replacements.push({
          original: fullMatch,
          replacement: contentKey,
          alignment,
        });
      }
    }

    // Apply replacements in reverse order to maintain positions
    replacements.reverse().forEach(({ original, replacement }) => {
      processedMarkdown = processedMarkdown.replace(original, replacement);
    });

    // Use default markdown parser on processed markdown
    const defaultDoc = defaultMarkdownParser.parse(processedMarkdown);

    // Convert the default schema document to our custom schema
    const defaultJson = defaultDoc.toJSON();

    // Apply alignment attributes based on our map
    const applyAlignment = (node: any): void => {
      if (!node || !node.content) return;

      for (const child of node.content) {
        if (child.type === "paragraph" || child.type === "heading") {
          // Get text content to match with alignment map
          const text =
            child.content
              ?.map((c: any) => (c.type === "text" ? c.text : ""))
              .join("")
              .trim() || "";

          // Check if this text has alignment stored
          const alignment = alignmentMap.get(text);
          if (alignment && alignment !== "left") {
            if (!child.attrs) child.attrs = {};
            child.attrs.textAlign = alignment;
          }
        } else if (child.content) {
          applyAlignment(child);
        }
      }
    };

    // Apply alignment to the document
    applyAlignment(defaultJson);

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
