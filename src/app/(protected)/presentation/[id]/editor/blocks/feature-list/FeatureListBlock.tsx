import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createFeatureListContent,
  type FeatureListContent,
} from "../definitions";
import { withAlpha } from "../utils";

interface FeatureListBlockProps {
  block: Block;
  onUpdate: (content: FeatureListContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const FeatureListBlock: React.FC<FeatureListBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content =
    (block.content as FeatureListContent) ?? createFeatureListContent();
  const { features, layout, columns = 2 } = content;

  const handleTitleChange = useCallback(
    (index: number, newContent: any) => {
      const newFeatures = [...features];
      newFeatures[index] = {
        ...newFeatures[index],
        title: newContent,
      };
      onUpdate({
        ...content,
        features: newFeatures,
      });
    },
    [features, content, onUpdate]
  );

  const handleDescriptionChange = useCallback(
    (index: number, newContent: any) => {
      const newFeatures = [...features];
      newFeatures[index] = {
        ...newFeatures[index],
        description: newContent,
      };
      onUpdate({
        ...content,
        features: newFeatures,
      });
    },
    [features, content, onUpdate]
  );

  const gridClass =
    layout === "grid"
      ? `grid gap-6 ${
          columns === 2
            ? "grid-cols-2"
            : columns === 3
            ? "grid-cols-3"
            : "grid-cols-4"
        }`
      : "flex flex-col gap-6";

  return (
    <div className={`${gridClass} w-full`}>
      {features.map((feature, index) => (
        <div
          key={index}
          className="group flex gap-4 p-5 rounded-xl transition-all relative"
          style={{
            backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.5),
            border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
          }}
        >
          <div
            className="shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 duration-300"
            style={{
              backgroundColor: withAlpha(theme.primary, 0.1),
              color: theme.primary,
            }}
          >
            {feature.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="mb-2">
              <ProseMirrorEditor
                key={`${block.id}-title-${index}`}
                blockId={`${block.id}-title-${index}`}
                value={feature.title}
                onChange={(newContent) => handleTitleChange(index, newContent)}
                placeholder="Feature Title"
                className="text-lg font-semibold"
              />
            </div>
            <div>
              <ProseMirrorEditor
                key={`${block.id}-desc-${index}`}
                blockId={`${block.id}-desc-${index}`}
                value={feature.description}
                onChange={(newContent) =>
                  handleDescriptionChange(index, newContent)
                }
                placeholder="Feature description"
                className="text-sm opacity-80"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
