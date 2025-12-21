import type { ComparisonTableContent, ProseMirrorDocument } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";
import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
  isMarkdownFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createComparisonTableContent = (): ComparisonTableContent => ({
  type: "comparison-table",
  columns: [
    {
      name: createParagraphContent("Starter"),
      price: createParagraphContent("Free"),
    },
    {
      name: createParagraphContent("Professional"),
      price: createParagraphContent("$29/mo"),
    },
    {
      name: createParagraphContent("Enterprise"),
      price: createParagraphContent("Custom"),
    },
  ],
  rows: [
    {
      feature: createParagraphContent("Team Members"),
      values: [
        createParagraphContent("Up to 3"),
        createParagraphContent("Up to 20"),
        createParagraphContent("Unlimited"),
      ],
    },
    {
      feature: createParagraphContent("Active Projects"),
      values: [
        createParagraphContent("1"),
        createParagraphContent("Unlimited"),
        createParagraphContent("Unlimited"),
      ],
    },
    {
      feature: createParagraphContent("Storage"),
      values: [
        createParagraphContent("5GB"),
        createParagraphContent("100GB"),
        createParagraphContent("Unlimited"),
      ],
    },
    {
      feature: createParagraphContent("Analytics"),
      values: [false, true, true],
    },
    {
      feature: createParagraphContent("Custom Domain"),
      values: [false, true, true],
    },
    {
      feature: createParagraphContent("SSO & Advanced Security"),
      values: [false, false, true],
    },
    {
      feature: createParagraphContent("API Access"),
      values: [false, "Basic", "Full Access"],
    },
    {
      feature: createParagraphContent("Support Priority"),
      values: [
        createParagraphContent("Community"),
        createParagraphContent("Email"),
        createParagraphContent("24/7 Dedicated"),
      ],
    },
  ],
});

export const normalizeComparisonTableContent = (
  content: any
): ComparisonTableContent => {
  const incoming = content as ComparisonTableContent | undefined;
  if (incoming?.columns && incoming?.rows) {
    return {
      type: "comparison-table",
      columns: incoming.columns.map((col) => ({
        name: isMarkdownFormat(col.name)
          ? col.name
          : isLegacyProseMirrorFormat(col.name)
          ? normalizeToMarkdown(col.name)
          : createParagraphContent("Plan"),
        price: col.price
          ? isMarkdownFormat(col.price)
            ? col.price
            : isLegacyProseMirrorFormat(col.price)
            ? normalizeToMarkdown(col.price)
            : createParagraphContent("")
          : undefined,
      })),
      rows: incoming.rows.map((row) => ({
        feature: isMarkdownFormat(row.feature)
          ? row.feature
          : isLegacyProseMirrorFormat(row.feature)
          ? normalizeToMarkdown(row.feature)
          : createParagraphContent("Feature"),
        values: (row.values || []).map((val: any) => {
          // Handle values that might be legacy ProseMirrorDocuments
          if (typeof val === "boolean" || typeof val === "string") {
            return val;
          }
          // If it's a ProseMirrorDocument (legacy or new), normalize it
          if (isMarkdownFormat(val)) {
            return val;
          }
          if (isLegacyProseMirrorFormat(val)) {
            return normalizeToMarkdown(val);
          }
          return val;
        }),
      })),
    };
  }
  return createComparisonTableContent();
};
