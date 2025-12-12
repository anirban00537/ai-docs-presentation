import type { ProseMirrorDocument } from "./common";
import { createParagraphContent } from "./common";

export interface FeatureItem {
  icon: string;
  title: ProseMirrorDocument;
  description: ProseMirrorDocument;
}

export interface FeatureListContent {
  type: "feature-list";
  features: FeatureItem[];
  layout: "grid" | "list";
  columns?: 2 | 3 | 4;
}

export const createFeatureListContent = (): FeatureListContent => ({
  type: "feature-list",
  features: [
    {
      icon: "🚀",
      title: createParagraphContent("Fast Performance"),
      description: createParagraphContent(
        "Lightning fast performance with optimized code"
      ),
    },
    {
      icon: "🔒",
      title: createParagraphContent("Secure"),
      description: createParagraphContent(
        "Enterprise-grade security and encryption"
      ),
    },
  ],
  layout: "grid",
  columns: 2,
});

const hasValidDoc = (doc?: ProseMirrorDocument) =>
  doc?.type === "doc" && Array.isArray(doc.content);

export const normalizeFeatureListContent = (
  content: any
): FeatureListContent => {
  const incoming = content as FeatureListContent | undefined;
  if (incoming?.features && Array.isArray(incoming.features)) {
    return {
      type: "feature-list",
      features: incoming.features.map((feature) => ({
        icon: feature.icon ?? "✨",
        title: hasValidDoc(feature.title)
          ? feature.title
          : createParagraphContent("Feature Title"),
        description: hasValidDoc(feature.description)
          ? feature.description
          : createParagraphContent("Feature description"),
      })),
      layout: incoming.layout ?? "grid",
      columns: incoming.columns ?? 2,
    };
  }
  return createFeatureListContent();
};
