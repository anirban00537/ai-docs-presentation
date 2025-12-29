import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createCornerCutContent,
} from "../definitions/corner-cut-block";
import type { CornerCutContent } from "@/types/presentation";

interface CornerCutBlockProps {
  block: Block;
  onUpdate: (content: CornerCutContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const CornerCutBlock = memo(function CornerCutBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: CornerCutBlockProps) {
  const content = block.content as CornerCutContent;
  const label = content?.label ?? "TIP";

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createCornerCutContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "corner-cut-block",
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
        type: "corner-cut-block",
        label: e.target.value,
      });
    },
    [content, onUpdate, readOnly]
  );

  return (
    <div
      className="w-full h-full transition-all duration-300 hover:shadow-lg group"
      style={{
          filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.05))"
      }}
    >
      <div
        className="flex flex-col h-full w-full relative overflow-hidden"
        style={{ 
            backgroundColor: theme.cardBackground,
            // Create the clip path for top-right corner cut
            clipPath: "polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)",
            borderRadius: "0 0 12px 12px"
        }}
      >
        {/* The Cutout Accent Triangle */}
        <div 
            className="absolute top-0 right-0 w-[40px] h-[40px] z-20 flex items-center justify-center"
            style={{
                background: `linear-gradient(225deg, ${theme.primary} 50%, transparent 50.5%)`,
                opacity: 0.1
            }}
        />
        
        {/* Label in the cutout area (offset) */}
         <div 
            className="absolute top-0 right-[45px] h-8 flex items-center"
         >
             <span 
                className="text-[10px] font-bold tracking-widest uppercase opacity-40"
                style={{ color: theme.headingColor }}
            >
                {readOnly ? label : (
                    <input 
                        value={label}
                        onChange={handleLabelChange}
                        className="bg-transparent border-none outline-none text-right w-16"
                    />
                )}
             </span>
         </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 p-8 pt-12 z-10 border-l-4"
             style={{ borderColor: `${theme.primary}20` }}
        >
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type technical detail..."}
            className="prose-sm leading-relaxed font-mono"
            readOnly={readOnly}
            theme={theme}
          />
        </div>
      </div>
    </div>
  );
});
