import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
  type SimpleNumberCardContent,
  createSimpleNumberCardContent,
} from "../definitions";

interface SimpleNumberCardBlockProps {
  block: Block;
  onUpdate: (content: SimpleNumberCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const SimpleNumberCardBlock: React.FC<SimpleNumberCardBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = block.content as SimpleNumberCardContent;
  const number = content?.number ?? 1;

  const editorContent = useMemo(() => {
    return (
      content?.editorContent ?? createSimpleNumberCardContent().editorContent
    );
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: any) => {
      const newContent: SimpleNumberCardContent = {
        type: "simple-number-card",
        number,
        editorContent: newEditorContent,
      };
      onUpdate(newContent);
    },
    [number, onUpdate]
  );

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      const newNumber = isNaN(val) ? 0 : val;

      const newContent: SimpleNumberCardContent = {
        type: "simple-number-card",
        number: newNumber,
        editorContent,
      };
      onUpdate(newContent);
    },
    [editorContent, onUpdate]
  );

  return (
    <CommonCard 
      theme={theme} 
      className="w-full h-full transition-all duration-300 hover:shadow-md"
    >
      <div 
        className="flex flex-row gap-6 p-6 items-start w-full h-full relative overflow-hidden"
        style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-12 -right-12 w-24 h-24 rounded-full opacity-[0.03] blur-xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        <style>{`
          .no-spinner::-webkit-outer-spin-button,
          .no-spinner::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .no-spinner {
            -moz-appearance: textfield;
          }
        `}</style>

        {/* Number Badge */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 z-10 border shadow-sm"
          style={{
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}20`,
            color: theme.primary,
            backdropFilter: "blur(4px)"
          }}
        >
          <input
            type="number"
            value={String(number).padStart(2, "0")}
            onChange={handleNumberChange}
            className="no-spinner bg-transparent border-none outline-none text-center w-full font-bold"
            style={{
              color: theme.primary,
            }}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0 pt-1.5 z-10">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type description..."}
            className="text-sm leading-relaxed opacity-70 tracking-tight"
            theme={theme}
          />
        </div>
      </div>
    </CommonCard>
  );
};
