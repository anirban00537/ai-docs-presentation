import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import { createSidelineCardContent } from "../definitions/sideline-card-block";
import type { SidelineCardContent } from "@/types/presentation/schemas/blocks";
import { CommonCard } from "../CommonCard";

interface SidelineCardBlockProps {
  block: Block;
  onUpdate: (content: SidelineCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const SidelineCardBlock = memo(function SidelineCardBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: SidelineCardBlockProps) {
  const content = block.content as SidelineCardContent;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createSidelineCardContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "sideline-card-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );

  return (
    <CommonCard theme={theme}>
      <div
        className="flex h-full w-full relative overflow-hidden"
        style={{
          backgroundColor: theme.cardBackground,
          color: theme.bodyColor,
        }}
      >
        {/* Side Accent Line */}
        <div 
          className="w-2 flex-shrink-0"
          style={{
            backgroundColor: theme.primary,
            opacity: 0.8,
          }}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-8">
            <div className="flex-1 min-w-0 z-10">
            <ProseMirrorEditor
                key={block.id}
                blockId={block.id}
                value={editorContent}
                onChange={handleEditorChange}
                placeholder={placeholder ?? "Type key insight..."}
                className="prose-base leading-relaxed"
                readOnly={readOnly}
                theme={theme}
            />
            </div>
        </div>
      </div>
    </CommonCard>
  );
});
