import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createModernPillCardContent,
} from "../definitions/modern-pill-card";
import type { ModernPillCardContent } from "@/types/presentation";
import { CommonCard } from "../CommonCard";

interface ModernPillCardBlockProps {
  block: Block;
  onUpdate: (content: ModernPillCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const ModernPillCardBlock = memo(function ModernPillCardBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: ModernPillCardBlockProps) {
  const content = block.content as ModernPillCardContent;
  const label = content?.label ?? "NEW";

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createModernPillCardContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "modern-pill-card",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );
  
  const handleLabelChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
        if (readOnly) return;
        onUpdate({
          ...content,
          type: "modern-pill-card",
          label: e.target.value,
        });
      },
      [content, onUpdate, readOnly]
    );

  return (
    <CommonCard
      theme={theme}
      className="w-full h-full transition-all duration-300 hover:shadow-md"
    >
      <div
        className="flex flex-col h-full w-full relative overflow-hidden"
        style={{ 
          borderRadius: theme.cardBorderRadius ?? "12px",
          backgroundColor: theme.cardBackground,
        }}
      >
        <div className="absolute top-6 left-6 z-20">
             <div 
                className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center"
                style={{ 
                    backgroundColor: theme.primary,
                    color: "#canvas", // Assuming white text on primary
                }}
             >
                <span className="text-white mix-blend-plus-lighter">
                    {readOnly ? (
                        label
                    ) : (
                        <input
                            value={label}
                            onChange={handleLabelChange}
                            className="bg-transparent border-none outline-none text-center min-w-[20px] w-auto text-white placeholder-white/50"
                            style={{maxWidth: "80px"}}
                        />
                    )}
                </span>
             </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 p-8 pt-16 z-10">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type your feature details..."}
            className="prose-sm leading-relaxed"
            readOnly={readOnly}
            theme={theme}
          />
        </div>
      </div>
    </CommonCard>
  );
});
