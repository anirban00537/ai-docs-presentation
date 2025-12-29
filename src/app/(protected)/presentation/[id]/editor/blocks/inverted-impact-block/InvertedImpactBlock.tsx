import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createInvertedImpactContent,
} from "../definitions/inverted-impact-block";
import type { InvertedImpactContent } from "@/types/presentation";

interface InvertedImpactBlockProps {
  block: Block;
  onUpdate: (content: InvertedImpactContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const InvertedImpactBlock = memo(function InvertedImpactBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: InvertedImpactBlockProps) {
  const content = block.content as InvertedImpactContent;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createInvertedImpactContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "inverted-impact-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );

  return (
    <div
      className="w-full h-full transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group"
      style={{
          borderRadius: theme.cardBorderRadius ?? "12px",
          backgroundColor: theme.primary,
          color: "#ffffff",
          boxShadow: theme.cardBoxShadow
      }}
    >
      <div className="flex flex-col h-full w-full relative overflow-hidden p-8">
        
        {/* Subtle Texture Overlay */}
        <div 
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
                backgroundImage: `radial-gradient(circle at top right, white 0%, transparent 40%)`
            }}
        />

        {/* Content Area */}
        <div className="flex-1 min-w-0 z-10 invert-prose-colors">
            <style jsx global>{`
                .invert-prose-colors .ProseMirror {
                    color: white !important;
                }
                .invert-prose-colors .ProseMirror h1,
                .invert-prose-colors .ProseMirror h2,
                .invert-prose-colors .ProseMirror h3,
                .invert-prose-colors .ProseMirror strong,
                .invert-prose-colors .ProseMirror b {
                    color: white !important;
                }
                .invert-prose-colors .ProseMirror p {
                    color: rgba(255, 255, 255, 0.9) !important;
                }
            `}</style>
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type impactful text..."}
            className="prose-lg leading-relaxed text-white selection:bg-white/20"
            readOnly={readOnly}
            theme={{...theme, bodyColor: "#ffffff", headingColor: "#ffffff"}} // Force white text theme
          />
        </div>
      </div>
    </div>
  );
});
