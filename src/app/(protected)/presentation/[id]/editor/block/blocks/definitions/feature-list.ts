import { FeatureListContentSchema, type FeatureListContent } from "@/types/presentation";

import { 
  normalizeToMarkdown, 
  isLegacyProseMirrorFormat, 
} from "@/lib/markdown/prosemirror-converter";

export const createFeatureListContent = (): FeatureListContent => ({
  type: "feature-list",
  features: [
    {
      icon: "🚀",
      title: "Fast Performance",
      description: "Lightning fast performance with optimized code",
    },
    {
      icon: "🔒",
      title: "Secure",
      description: "Enterprise-grade security and encryption",
    },
  ],
  layout: "grid",
});

export const normalizeFeatureListContent = (
  content: any
): FeatureListContent => {
  if (!content || typeof content !== "object") return createFeatureListContent();

  const features = Array.isArray(content.features)
    ? content.features.map((feature: any) => ({
        ...feature,
        title: isLegacyProseMirrorFormat(feature.title)
          ? normalizeToMarkdown(feature.title)
          : typeof feature.title === "string"
          ? feature.title
          : "Feature Title",
        description: isLegacyProseMirrorFormat(feature.description)
          ? normalizeToMarkdown(feature.description)
          : typeof feature.description === "string"
          ? feature.description
          : "Feature description",
        icon: typeof feature.icon === "string" ? feature.icon : "✨",
      }))
    : [];

  const result = FeatureListContentSchema.safeParse({
    ...content,
    features,
  });

  if (result.success) {
    return result.data;
  }

  return createFeatureListContent();
};
