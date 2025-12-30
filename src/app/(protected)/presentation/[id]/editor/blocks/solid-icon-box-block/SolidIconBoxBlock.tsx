import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import { createSolidIconBoxContent } from "../definitions/solid-icon-box-block";
import type { SolidIconBoxContent } from "@/types/presentation/schemas/blocks";
import { CommonCard } from "../CommonCard";
import { UniversalIconPicker } from "../../ui/UniversalIconPicker";

interface SolidIconBoxBlockProps {
  block: Block;
  onUpdate: (content: SolidIconBoxContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const SolidIconBoxBlock = memo(function SolidIconBoxBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: SolidIconBoxBlockProps) {
  const content = block.content as SolidIconBoxContent;
  const iconName = content?.icon || "star";

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createSolidIconBoxContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "solid-icon-box-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );
  
  const handleIconChange = useCallback((newIcon: string) => {
    if (readOnly) return;
    onUpdate({
        ...content,
        type: "solid-icon-box-block",
        icon: newIcon,
    });
  }, [content, onUpdate, readOnly]);

  return (
    <CommonCard
      theme={theme}
    >
      <div
        className="flex flex-col h-full w-full relative overflow-hidden p-8"
        style={{
          backgroundColor: theme.cardBackground,
          color: theme.bodyColor,
        }}
      >
        <div className="mb-4">
           <UniversalIconPicker
              value={iconName}
              onChange={handleIconChange}
              theme={theme}
              disabled={readOnly}
              size="lg"
              className="group-hover/card:scale-110 transition-transform duration-300"
           />
        </div>

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
