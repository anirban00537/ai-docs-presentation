import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import { createSolidBoxContent } from "../definitions/solid-box-block";
import type { SolidBoxContent } from "@/types/presentation/schemas/blocks";
import { CommonCard } from "../CommonCard";

interface SolidBoxBlockProps {
  block: Block;
  onUpdate: (content: SolidBoxContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const SolidBoxBlock = memo(function SolidBoxBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: SolidBoxBlockProps) {
  const content = block.content as SolidBoxContent;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createSolidBoxContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "solid-box-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );

  return (
    <CommonCard
      theme={theme}
      // Make entire card interactive if needed
    >
      <div
        className="flex flex-col h-full w-full relative overflow-hidden p-8"
        style={{
          backgroundColor: theme.cardBackground,
          color: theme.bodyColor,
        }}
      >
        <div className="flex-1 min-w-0 z-10">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type content..."}
            className="prose-base leading-relaxed"
            readOnly={readOnly}
            theme={theme}
          />
        </div>
      </div>
    </CommonCard>
  );
});
