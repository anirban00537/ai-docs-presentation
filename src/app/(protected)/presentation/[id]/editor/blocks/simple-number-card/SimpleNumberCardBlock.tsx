import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  type SimpleNumberCardContent,
  createSimpleNumberCardContent,
} from "../definitions/simple-number-card";

interface SimpleNumberCardBlockProps {
  block: Block;
  onUpdate: (content: SimpleNumberCardContent) => void;
  theme: Theme;
  placeholder?: string;
}

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
    <div className="flex flex-row gap-4 items-start w-full h-full p-3">
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

      {/* Number */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0"
        style={{
          backgroundColor: `${theme.primary}15`,
          color: theme.primary,
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

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1.5">
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder ?? "Type description..."}
          className="text-sm leading-relaxed opacity-80"
        />
      </div>
    </div>
  );
};
