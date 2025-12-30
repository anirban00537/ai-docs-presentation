import React, { useCallback, useMemo, memo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import { createSolidIconBoxContent } from "../definitions/solid-icon-box-block";
import type { SolidIconBoxContent } from "@/types/presentation/schemas/blocks";
import { CommonCard } from "../CommonCard";
import { DynamicIcon } from "../../ui/DynamicIcon";
import { IconPickerModal } from "../../ui/IconPickerModal";

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
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

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
    setIsIconPickerOpen(false);
  }, [content, onUpdate, readOnly]);

  return (
    <>
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
             <button
                onClick={() => !readOnly && setIsIconPickerOpen(true)}
                className={`p-3 rounded-xl transition-all ${!readOnly ? 'hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer' : 'cursor-default'}`}
                style={{
                    backgroundColor: `${theme.primary}15`,
                    color: theme.primary,
                }}
             >
                <DynamicIcon name={iconName} className="w-8 h-8" />
             </button>
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

      <IconPickerModal
        open={isIconPickerOpen}
        onOpenChange={setIsIconPickerOpen}
        onSelect={handleIconChange}
        currentIcon={iconName}
      />
    </>
  );
});
