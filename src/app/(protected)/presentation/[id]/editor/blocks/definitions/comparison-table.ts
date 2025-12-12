import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface ComparisonColumn {
  name: ProseMirrorDocument;
  price?: ProseMirrorDocument;
  highlighted?: boolean;
}

export interface ComparisonRow {
  feature: ProseMirrorDocument;
  values: (boolean | string | ProseMirrorDocument)[];
}

export interface ComparisonTableContent {
  type: "comparison-table";
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
}

export const createComparisonTableContent = (): ComparisonTableContent => ({
  type: "comparison-table",
  columns: [
    {
      name: createParagraphContent("Basic"),
      price: createParagraphContent("$9"),
      highlighted: false,
    },
    {
      name: createParagraphContent("Pro"),
      price: createParagraphContent("$29"),
      highlighted: true,
    },
  ],
  rows: [
    {
      feature: createParagraphContent("Storage"),
      values: ["10GB", "100GB"],
    },
    {
      feature: createParagraphContent("Support"),
      values: ["Email", "24/7"],
    },
  ],
});

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeComparisonTableContent = (
  content: any
): ComparisonTableContent => {
  const incoming = content as ComparisonTableContent | undefined;
  if (incoming?.columns && incoming?.rows) {
    return {
      type: "comparison-table",
      columns: incoming.columns.map((col) => ({
        name: hasValidDoc(col.name) ? col.name : createParagraphContent("Plan"),
        price: col.price
          ? hasValidDoc(col.price)
            ? col.price
            : createParagraphContent("")
          : undefined,
        highlighted: col.highlighted ?? false,
      })),
      rows: incoming.rows.map((row) => ({
        feature: hasValidDoc(row.feature)
          ? row.feature
          : createParagraphContent("Feature"),
        values: row.values || [],
      })),
    };
  }
  return createComparisonTableContent();
};
