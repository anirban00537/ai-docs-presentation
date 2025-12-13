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
    if (content?.editorContent && content.editorContent.type === "doc") {
      return content.editorContent;
    }
    return createSimpleNumberCardContent().editorContent;
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
    <div className="flex flex-row gap-4 items-start w-full h-full p-2">
      <style>{`
        /* Hide spin buttons for Chrome, Safari, Edge, Opera */
        .no-spinner::-webkit-outer-spin-button,
        .no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Hide spin buttons for Firefox */
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
      <input
        type="number"
        value={String(number).padStart(2, "0")}
        onChange={handleNumberChange}
        className="no-spinner text-4xl leading-none font-light select-none tabular-nums opacity-60 flex-shrink-0 bg-transparent border-none outline-none p-0 m-0 w-auto"
        style={{
          color: theme.headingColor,
          fontFamily: "var(--font-heading)",
          width: "1.5em", // Enough for 2 digits
        }}
      />
      <div className="flex-1 min-w-0 pt-0.5">
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder ?? "Type description..."}
          className="text-base leading-relaxed opacity-90"
        />
      </div>
    </div>
  );
};
