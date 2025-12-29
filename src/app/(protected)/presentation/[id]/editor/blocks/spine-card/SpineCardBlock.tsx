import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  type SpineCardContent,
} from "../definitions";
import {
    createSpineCardContent,
} from "../definitions/spine-card";
import { CommonCard } from "../CommonCard";

interface SpineCardBlockProps {
  block: Block;
  onUpdate: (content: SpineCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const SpineCardBlock = memo(function SpineCardBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: SpineCardBlockProps) {
  const content = block.content as SpineCardContent;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createSpineCardContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "spine-card",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );

  return (
    <CommonCard
      theme={theme}
      className="w-full transition-all duration-300 hover:shadow-md"
    >
      <div
        className="flex flex-row w-full relative overflow-hidden"
        style={{ 
          borderRadius: theme.cardBorderRadius ?? "12px",
          backgroundColor: `${theme.primary}05`, // Very subtle tint
        }}
      >
        {/* The Spine (Directional Accent) */}
        <div 
            className="h-full w-1.5 shrink-0"
            style={{ backgroundColor: theme.primary }}
        />

        {/* Content Area */}
        <div className="flex-1 min-w-0 p-4 z-10">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type your note..."}
            className="prose-sm leading-snug"
            readOnly={readOnly}
            theme={theme}
          />
        </div>
      </div>
    </CommonCard>
  );
});
