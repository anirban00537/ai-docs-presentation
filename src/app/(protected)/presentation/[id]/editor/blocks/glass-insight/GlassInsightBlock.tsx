import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  type GlassInsightContent,
  createGlassInsightContent,
} from "../definitions";
import { EmojiPickerTrigger } from "../../ui/LazyEmojiPicker";
import { CommonCard } from "../CommonCard";

interface GlassInsightBlockProps {
  block: Block;
  onUpdate: (content: GlassInsightContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const GlassInsightBlock = memo(function GlassInsightBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: GlassInsightBlockProps) {
  const content = block.content as GlassInsightContent;
  const icon = content?.icon ?? "💡";

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createGlassInsightContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      onUpdate({ ...content, editorContent: newEditorContent });
    },
    [content, onUpdate]
  );

  const handleIconChange = useCallback(
    (emoji: string) => {
      onUpdate({ ...content, icon: emoji });
    },
    [content, onUpdate]
  );

  return (
    <CommonCard
      theme={theme}
      className="relative p-8 w-full h-full overflow-hidden"
    >
      <div className="relative h-full w-full transition-all">
        {/* Floating Icon */}
        <div className="absolute top-0 right-0 z-20" style={{ opacity: 0.7 }}>
          <EmojiPickerTrigger
            icon={icon}
            onEmojiSelect={handleIconChange}
            disabled={readOnly}
            size="xl"
            className="bg-transparent"
          />
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex flex-col h-full justify-center">
          <div
            className="mb-4 w-10 h-0.5 rounded-full"
            style={{ backgroundColor: theme.primary, opacity: 0.4 }}
          />
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type your insight..."}
            className="text-xl font-medium leading-relaxed opacity-80"
            theme={theme}
            readOnly={readOnly}
          />
        </div>

        {/* Decorative gradient */}
        <div
          className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full opacity-30 blur-3xl pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />
      </div>
    </CommonCard>
  );
});
