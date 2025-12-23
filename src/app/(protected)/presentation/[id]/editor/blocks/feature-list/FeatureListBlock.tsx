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
    <CommonCard
      theme={theme}
      className="group/feature relative transition-all duration-300 hover:shadow-md h-full"
    >
      <div 
        className="flex flex-col gap-6 p-8 relative h-full w-full overflow-hidden"
        style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Icon / Badge */}
        <div className="z-10">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 border shadow-sm"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}20`,
              backdropFilter: "blur(8px)"
            }}
          >
            <EmojiPickerTrigger
              icon={feature.icon || "✨"}
              onEmojiSelect={(emoji) => onIconChange(index, emoji)}
              disabled={readOnly}
              size="xl"
              className="bg-transparent"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex flex-col flex-1 min-w-0">
          <div className="mb-2">
            <ProseMirrorEditor
              key={`${blockId}-title-${index}`}
              blockId={`${blockId}-title-${index}`}
              value={feature.title}
              onChange={(newContent) => onTitleChange(index, newContent)}
              placeholder="Feature Title"
              className="text-lg font-bold tracking-tight leading-tight"
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
              className="text-sm opacity-60 leading-relaxed tracking-normal"
              theme={theme}
              readOnly={readOnly}
            />
          </div>
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
      return `grid gap-6 ${colClass}`;
    }
    return "flex flex-col gap-4";
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
