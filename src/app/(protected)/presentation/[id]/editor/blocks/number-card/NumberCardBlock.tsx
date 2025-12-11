import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  getDefaultNumberCardEditorContent,
  type NumberCardContent,
} from "../definitions";

interface NumberCardBlockProps {
  block: Block;
  onUpdate: (content: NumberCardContent) => void;
  theme: Theme;
  placeholder?: string;
}

const withAlpha = (hex: string, alpha: number): string => {
  const raw = hex?.replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const NumberCardBlock: React.FC<NumberCardBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = block.content as NumberCardContent;
  const number = content?.number ?? 1;
  const icon = content?.icon ?? "";

  const editorContent = useMemo(() => {
    if (content?.editorContent && content.editorContent.type === "doc") {
      return content.editorContent;
    }
    return getDefaultNumberCardEditorContent();
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: any) => {
      const newContent: NumberCardContent = {
        type: "number-card",
        icon,
        number,
        editorContent: newEditorContent,
      };
      onUpdate(newContent);
    },
    [icon, number, onUpdate]
  );

  return (
    <div
      className="flex flex-col gap-4 p-4 rounded-xl shadow-sm h-full w-full"
      style={{
        backgroundColor: withAlpha(theme.primary, 0.3),
        color: theme.headingColor,
        border: `1px solid ${theme.primary}55`,
      }}
    >
      <div className="flex items-start">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor: theme.primary,
            color: theme.cardBackground,
          }}
        >
          {icon || number}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder ?? "Type '/' for commands"}
          className=""
        />
      </div>
    </div>
  );
};
