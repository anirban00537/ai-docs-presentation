import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
    createGlassBillboardContent,
} from "../definitions/glass-billboard-block";
import type { GlassBillboardContent } from "@/types/presentation";

interface GlassBillboardBlockProps {
  block: Block;
  onUpdate: (content: GlassBillboardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const GlassBillboardBlock = memo(function GlassBillboardBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: GlassBillboardBlockProps) {
  const content = block.content as GlassBillboardContent;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createGlassBillboardContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "glass-billboard-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );

  return (
    <div
      className="w-full transition-all duration-300 py-4 px-6"
      style={{
          // No background, just pure text layout
      }}
    >
        <div className="w-full text-center">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type your hero statement..."}
            className="prose-lg md:prose-xl leading-tight font-light"
            readOnly={readOnly}
            theme={theme}
          />
        </div>
    </div>
  );
});
