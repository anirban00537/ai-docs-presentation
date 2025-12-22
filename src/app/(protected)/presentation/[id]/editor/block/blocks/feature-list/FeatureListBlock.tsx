import React, { useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
  createFeatureListContent,
  type FeatureListContent,
} from "../definitions";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FeatureListBlockProps {
  block: Block;
  onUpdate: (content: FeatureListContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const FeatureListBlock: React.FC<FeatureListBlockProps> = ({
  block,
  onUpdate,
  theme,
  readOnly = false,
}) => {
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
    (index: number, newContent: any) => {
      if (readOnly) return;
      const newFeatures = [...features];
      newFeatures[index] = { ...newFeatures[index], title: newContent };
      onUpdate({ ...content, features: newFeatures });
    },
    [features, content, onUpdate, readOnly]
  );

  const handleDescriptionChange = useCallback(
    (index: number, newContent: any) => {
      if (readOnly) return;
      const newFeatures = [...features];
      newFeatures[index] = { ...newFeatures[index], description: newContent };
      onUpdate({ ...content, features: newFeatures });
    },
    [features, content, onUpdate, readOnly]
  );

  const gridClass =
    layout === "grid"
      ? `grid gap-4 ${
          columns === 2
            ? "grid-cols-2"
            : columns === 3
            ? "grid-cols-3"
            : "grid-cols-4"
        }`
      : "flex flex-col gap-3";

  return (
    <div className={`${gridClass} w-full`}>
      {features.map((feature, index) => (
        <CommonCard key={index} theme={theme} className="flex gap-4 p-5">
          {/* Icon */}
          <div className="flex-shrink-0">
            {!readOnly ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all hover:scale-105 cursor-pointer outline-none relative z-20"
                    style={{
                      backgroundColor: `${theme.primary}15`,
                    }}
                    title="Change icon"
                  >
                    {feature.icon || "✨"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-xl">
                  <EmojiPicker onEmojiClick={(emoji) => handleIconChange(index, emoji.emoji)} />
                </PopoverContent>
              </Popover>
            ) : (
              <div
                className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: `${theme.primary}15`,
                }}
              >
                {feature.icon || "✨"}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="mb-1.5">
              <ProseMirrorEditor
                key={`${block.id}-title-${index}`}
                blockId={`${block.id}-title-${index}`}
                value={feature.title}
                onChange={(newContent) => handleTitleChange(index, newContent)}
                placeholder="Feature Title"
                className="text-base font-semibold leading-tight"
                theme={theme}
                readOnly={readOnly}
              />
            </div>
            <div>
              <ProseMirrorEditor
                key={`${block.id}-desc-${index}`}
                blockId={`${block.id}-desc-${index}`}
                value={feature.description}
                onChange={(newContent) => handleDescriptionChange(index, newContent)}
                placeholder="Feature description"
                className="text-sm opacity-60 leading-relaxed"
                theme={theme}
                readOnly={readOnly}
              />
            </div>
          </div>
        </CommonCard>
      ))}
    </div>
  );
};
