import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createLayeredNumberContent,
} from "../definitions/layered-number-block";
import type { LayeredNumberContent } from "@/types/presentation";
import { CommonCard } from "../CommonCard";

interface LayeredNumberBlockProps {
  block: Block;
  onUpdate: (content: LayeredNumberContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const LayeredNumberBlock = memo(function LayeredNumberBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: LayeredNumberBlockProps) {
  const content = block.content as LayeredNumberContent;
  const number = content?.number ?? 1;

  const editorContent = useMemo(() => {
    return content?.editorContent ?? createLayeredNumberContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        type: "layered-number-block",
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
  );
  
  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const val = parseInt(e.target.value, 10);
      onUpdate({
        ...content,
        type: "layered-number-block",
        number: isNaN(val) ? 0 : val,
      });
    },
    [content, onUpdate, readOnly]
  );

  return (
    <CommonCard
      theme={theme}
      className="w-full transition-all duration-300 hover:shadow-md"
    >
      <div
        className="flex flex-col w-full relative overflow-hidden p-5"
        style={{ 
          borderRadius: theme.cardBorderRadius ?? "12px",
          backgroundColor: theme.cardBackground,
        }}
      >
        {/* Layered Number Background */}
        <div 
            className="absolute -right-4 -bottom-10 md:-bottom-16 text-[180px] md:text-[240px] font-black leading-none pointer-events-none select-none z-0"
            style={{
                color: theme.headingColor,
                opacity: 0.05,
                fontFamily: "var(--font-heading)",
            }}
        >
            {number.toString().padStart(2, '0')}
        </div>
        
        {/* Editable Small Number Reference */}
         <div className="mb-2 z-10 flex items-center justify-between">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] border"
                style={{
                     borderColor: `${theme.primary}40`,
                     color: theme.primary,
                     backgroundColor: `${theme.primary}05`
                }}
              >
                  {readOnly ? (
                     number
                  ) : (
                     <input 
                        type="number"
                        value={number}
                        onChange={handleNumberChange}
                        className="bg-transparent text-center w-full h-full outline-none no-spinner"
                     />
                  )}
              </div>
         </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 z-10">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type step details..."}
            className="prose-sm leading-snug"
            readOnly={readOnly}
            theme={theme}
          />
        </div>
      </div>
    </CommonCard>
  );
});
