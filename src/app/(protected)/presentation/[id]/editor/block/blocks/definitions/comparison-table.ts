import { ComparisonTableContentSchema, type ComparisonTableContent } from "@/types/presentation";

import {
  normalizeToMarkdown,
  isLegacyProseMirrorFormat,
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
  if (!content || typeof content !== "object") return createComparisonTableContent();

  const columns = Array.isArray(content.columns)
    ? content.columns.map((col: any) => ({
        ...col,
        name: isLegacyProseMirrorFormat(col.name)
          ? normalizeToMarkdown(col.name)
          : typeof col.name === "string"
          ? col.name
          : "Plan",
        price: isLegacyProseMirrorFormat(col.price)
          ? normalizeToMarkdown(col.price)
          : col.price,
      }))
    : [];

  const rows = Array.isArray(content.rows)
    ? content.rows.map((row: any) => ({
        ...row,
        feature: isLegacyProseMirrorFormat(row.feature)
          ? normalizeToMarkdown(row.feature)
          : typeof row.feature === "string"
          ? row.feature
          : "Feature",
        values: (row.values || []).map((val: any) => {
          if (isLegacyProseMirrorFormat(val)) {
            return normalizeToMarkdown(val);
          }
          return val;
        }),
      }))
    : [];

  const result = ComparisonTableContentSchema.safeParse({
    ...content,
    columns,
    rows,
  });

  if (result.success) {
    return result.data;
  }

  return createComparisonTableContent();
};
