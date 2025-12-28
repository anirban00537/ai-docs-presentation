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
 * Recursively serialize ProseMirror JSON to Markdown with {.alignment} attribute syntax
 */
function serializeNodeToMarkdown(node: any): string {
  if (!node || !node.type) return "";

  const parts: string[] = [];

  // Handle alignment for paragraphs and headings using {.alignment} attribute syntax
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

    // Add {.alignment} attribute if alignment is not left
    if (textAlign && textAlign !== "left") {
      if (node.type === "heading") {
        const level = node.attrs?.level || 1;
        const prefix = "#".repeat(level);
        parts.push(`${prefix} ${text} {.${textAlign}}`);
      } else {
        parts.push(`${text} {.${textAlign}}`);
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
 * Restores alignment information from {.alignment} attributes or legacy HTML tags
 * @param markdown - Markdown string with optional {.alignment} attributes or HTML tags
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
    const alignmentMap = new Map<string, string>(); // Maps text content to alignment
    let processedMarkdown = markdown;

    // ===== STEP 1: Parse new {.alignment} attribute syntax =====
    // Match patterns like "## Heading {.center}" or "Some text {.right}"
    const attributeRegex = /^(#{1,6}\s+)?(.+?)\s+\{\.(center|right|justify|left)\}\s*$/gm;
    let attrMatch;
    const attrReplacements: Array<{
      original: string;
      replacement: string;
      contentKey: string;
      alignment: string;
    }> = [];

    attributeRegex.lastIndex = 0;
    while ((attrMatch = attributeRegex.exec(markdown)) !== null) {
      const [fullMatch, headingPrefix, content, alignment] = attrMatch;
      const contentKey = content.trim();
      alignmentMap.set(contentKey, alignment);

      // Create replacement (remove the {.alignment} part)
      const replacement = headingPrefix ? `${headingPrefix}${contentKey}` : contentKey;
      attrReplacements.push({
        original: fullMatch,
        replacement,
        contentKey,
        alignment,
      });
    }

    // Apply attribute replacements
    attrReplacements.forEach(({ original, replacement }) => {
      processedMarkdown = processedMarkdown.replace(original, replacement);
    });

    // ===== STEP 2: Parse legacy HTML tags for backward compatibility =====
    // Match HTML tags like <p style="text-align: center">text</p> or <h1 style="text-align: right">text</h1>
    const htmlTagRegex =
      /<(p|h[1-6])\s+style\s*=\s*["']text-align\s*:\s*(left|center|right|justify)\s*["']\s*>([\s\S]*?)<\/\1>/gi;
    const htmlReplacements: Array<{
      original: string;
      replacement: string;
      alignment: string;
    }> = [];

    let htmlMatch;
    htmlTagRegex.lastIndex = 0;
    while ((htmlMatch = htmlTagRegex.exec(processedMarkdown)) !== null) {
      const [fullMatch, tag, alignment, content] = htmlMatch;
      const isHeading = tag.startsWith("h");
      const level = isHeading ? parseInt(tag[1]) : 0;

      const contentKey = content.trim();
      alignmentMap.set(contentKey, alignment);

      if (isHeading) {
        const headingPrefix = "#".repeat(level);
        htmlReplacements.push({
          original: fullMatch,
          replacement: `${headingPrefix} ${contentKey}`,
          alignment,
        });
      } else {
        htmlReplacements.push({
          original: fullMatch,
          replacement: contentKey,
          alignment,
        });
      }
    }

    // Apply HTML replacements in reverse order to maintain positions
    htmlReplacements.reverse().forEach(({ original, replacement }) => {
      processedMarkdown = processedMarkdown.replace(original, replacement);
    });

    // ===== STEP 3: Parse with markdown parser =====
    const defaultDoc = defaultMarkdownParser.parse(processedMarkdown);
    const defaultJson = defaultDoc.toJSON();

    // ===== STEP 4: Apply alignment attributes =====
    const applyAlignment = (node: any): void => {
      if (!node || !node.content) return;

      for (const child of node.content) {
        if (child.type === "paragraph" || child.type === "heading") {
          const text =
            child.content
              ?.map((c: any) => (c.type === "text" ? c.text : ""))
              .join("")
              .trim() || "";

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

    applyAlignment(defaultJson);

    // Parse with our custom schema to ensure compatibility
    const prosemirrorNode = ProseMirrorNode.fromJSON(targetSchema, defaultJson);
    const json = prosemirrorNode.toJSON();

    return json as LegacyProseMirrorDocument;
  } catch (error) {
    console.warn("Failed to convert Markdown to ProseMirror:", error);
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
