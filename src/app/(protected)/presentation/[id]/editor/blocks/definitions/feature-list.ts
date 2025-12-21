import type { FeatureListContent, ProseMirrorDocument } from "@/types/presentation";
import { createParagraphContent } from "@/types/presentation";
import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
  isMarkdownFormat 
} from "@/lib/markdown/prosemirror-converter";

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
});

export const normalizeFeatureListContent = (
  content: any
): FeatureListContent => {
  const incoming = content as FeatureListContent | undefined;
  if (incoming?.features && Array.isArray(incoming.features)) {
    return {
      type: "feature-list",
      features: incoming.features.map((feature) => ({
        icon: feature.icon ?? "✨",
        title: isMarkdownFormat(feature.title)
          ? feature.title
          : isLegacyProseMirrorFormat(feature.title)
          ? normalizeToMarkdown(feature.title)
          : createParagraphContent("Feature Title"),
        description: isMarkdownFormat(feature.description)
          ? feature.description
          : isLegacyProseMirrorFormat(feature.description)
          ? normalizeToMarkdown(feature.description)
          : createParagraphContent("Feature description"),
      })),
      layout: incoming.layout ?? "grid",
    };
  }
  return createFeatureListContent();
};
