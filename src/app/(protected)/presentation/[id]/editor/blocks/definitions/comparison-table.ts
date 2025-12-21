import type { ComparisonTableContent, ProseMirrorDocument } from "@/types/presentation";

import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
  isMarkdownFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createComparisonTableContent = (): ComparisonTableContent => ({
  type: "comparison-table",
  columns: [
    {
      name: "Starter",
      price: "Free",
    },
    {
      name: "Professional",
      price: "$29/mo",
    },
    {
      name: "Enterprise",
      price: "Custom",
    },
  ],
  rows: [
    {
      feature: "Team Members",
      values: [
        "Up to 3",
        "Up to 20",
        "Unlimited",
      ],
    },
    {
      feature: "Active Projects",
      values: [
        "1",
        "Unlimited",
        "Unlimited",
      ],
    },
    {
      feature: "Storage",
      values: [
        "5GB",
        "100GB",
        "Unlimited",
      ],
    },
    {
      feature: "Analytics",
      values: [false, true, true],
    },
    {
      feature: "Custom Domain",
      values: [false, true, true],
    },
    {
      feature: "SSO & Advanced Security",
      values: [false, false, true],
    },
    {
      feature: "API Access",
      values: [false, "Basic", "Full Access"],
    },
    {
      feature: "Support Priority",
      values: [
        "Community",
        "Email",
        "24/7 Dedicated",
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
          : "Plan",
        price: col.price
          ? isMarkdownFormat(col.price)
            ? col.price
            : isLegacyProseMirrorFormat(col.price)
            ? normalizeToMarkdown(col.price)
            : ""
          : undefined,
      })),
      rows: incoming.rows.map((row) => ({
        feature: isMarkdownFormat(row.feature)
          ? row.feature
          : isLegacyProseMirrorFormat(row.feature)
          ? normalizeToMarkdown(row.feature)
          : "Feature",
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
