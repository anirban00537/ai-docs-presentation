import React, { useCallback, memo, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createFeatureListContent,
  type FeatureListContent,
} from "../definitions";
import { EmojiPickerTrigger } from "../../ui/LazyEmojiPicker";
import { CommonCard } from "../CommonCard";

interface FeatureListBlockProps {
  block: Block;
  onUpdate: (content: FeatureListContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * Memoized feature item component
 */
const FeatureItem = memo(function FeatureItem({
  feature,
  index,
  blockId,
  theme,
  onIconChange,
  onTitleChange,
  onDescriptionChange,
  readOnly,
}: {
  feature: { icon: string; title: ProseMirrorDocument; description: ProseMirrorDocument };
  index: number;
  blockId: string;
  theme: Theme;
  onIconChange: (index: number, emoji: string) => void;
  onTitleChange: (index: number, newContent: ProseMirrorDocument) => void;
  onDescriptionChange: (index: number, newContent: ProseMirrorDocument) => void;
  readOnly: boolean;
}) {
  return (
    <CommonCard theme={theme} className="flex gap-4 p-5">
      {/* Icon */}
      <div className="flex-shrink-0">
        <EmojiPickerTrigger
          icon={feature.icon || "✨"}
          onEmojiSelect={(emoji) => onIconChange(index, emoji)}
          disabled={readOnly}
          size="lg"
          backgroundColor={`${theme.primary}15`}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="mb-1.5">
          <ProseMirrorEditor
            key={`${blockId}-title-${index}`}
            blockId={`${blockId}-title-${index}`}
            value={feature.title}
            onChange={(newContent) => onTitleChange(index, newContent)}
            placeholder="Feature Title"
            className="text-base font-semibold leading-tight"
            theme={theme}
            readOnly={readOnly}
          />
        </div>
        <div>
          <ProseMirrorEditor
            key={`${blockId}-desc-${index}`}
            blockId={`${blockId}-desc-${index}`}
            value={feature.description}
            onChange={(newContent) => onDescriptionChange(index, newContent)}
            placeholder="Feature description"
            className="text-sm opacity-60 leading-relaxed"
            theme={theme}
            readOnly={readOnly}
          />
        </div>
      </div>
    </CommonCard>
  );
});

export const FeatureListBlock = memo(function FeatureListBlock({
  block,
  onUpdate,
  theme,
  readOnly = false,
}: FeatureListBlockProps) {
  const content =
    (block.content as FeatureListContent) ?? createFeatureListContent();
  const { features, layout, columns = 2 } = content;

  const handleIconChange = useCallback(
    (index: number, emoji: string) => {
      if (readOnly) return;
      const newFeatures = [...features];
      newFeatures[index] = { ...newFeatures[index], icon: emoji };
      onUpdate({ ...content, features: newFeatures });
    },
    [features, content, onUpdate, readOnly]
  );

  const handleTitleChange = useCallback(
    (index: number, newContent: ProseMirrorDocument) => {
      if (readOnly) return;
      const newFeatures = [...features];
      newFeatures[index] = { ...newFeatures[index], title: newContent };
      onUpdate({ ...content, features: newFeatures });
    },
    [features, content, onUpdate, readOnly]
  );

  const handleDescriptionChange = useCallback(
    (index: number, newContent: ProseMirrorDocument) => {
      if (readOnly) return;
      const newFeatures = [...features];
      newFeatures[index] = { ...newFeatures[index], description: newContent };
      onUpdate({ ...content, features: newFeatures });
    },
    [features, content, onUpdate, readOnly]
  );

  const gridClass = useMemo(() => {
    if (layout === "grid") {
      const colClass = columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4";
      return `grid gap-4 ${colClass}`;
    }
    return "flex flex-col gap-3";
  }, [layout, columns]);

  return (
    <div className={`${gridClass} w-full`}>
      {features.map((feature, index) => (
        <FeatureItem
          key={index}
          feature={feature}
          index={index}
          blockId={block.id}
          theme={theme}
          onIconChange={handleIconChange}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
});
