import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  type GlassInsightContent,
  createGlassInsightContent,
} from "../definitions";
import { UniversalIconPicker } from "../../ui/UniversalIconPicker";
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
  const icon = content?.icon ?? "IconLightning";

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
      className="relative w-full h-full overflow-hidden transition-all duration-300 hover:shadow-md"
    >
      <div 
        className="relative h-full w-full p-10 flex flex-col gap-8 overflow-hidden"
        style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Floating Icon / Badge */}
        <div className="z-20">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl transition-all duration-300 border shadow-sm"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}20`,
              backdropFilter: "blur(8px)"
            }}
          >
            <UniversalIconPicker
              value={icon || "IconLightning"}
              onChange={handleIconChange}
              theme={theme}
              disabled={readOnly}
              size="xl"
              className="bg-transparent border-none shadow-none"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 flex flex-col flex-1 min-w-0">
          <div
            className="mb-6 w-12 h-1 rounded-full"
            style={{ backgroundColor: theme.primary, opacity: 0.2 }}
          />
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type your insight..."}
            className="text-2xl font-medium leading-relaxed tracking-tight opacity-90"
            theme={theme}
            readOnly={readOnly}
          />
        </div>
      </div>
    </CommonCard>
  );
});
