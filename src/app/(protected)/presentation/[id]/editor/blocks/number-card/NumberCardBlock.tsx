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
  readOnly?: boolean;
}

export const NumberCardBlock: React.FC<NumberCardBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}) => {
  const content = block.content as NumberCardContent;
  const number = content?.number ?? 1;
  const icon = content?.icon ?? "";

  const editorContent = useMemo(() => {
    return content?.editorContent ?? getDefaultNumberCardEditorContent();
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: any) => {
      if (readOnly) return;
      const newContent: NumberCardContent = {
        type: "number-card",
        icon,
        number,
        size: content?.size ?? "medium",
        editorContent: newEditorContent,
      };
      onUpdate(newContent);
    },
    [icon, number, content?.size, onUpdate, readOnly]
  );

  const textSizeClass = useMemo(() => {
    switch (content?.size) {
      case "small":
        return "text-sm";
      case "large":
        return "text-xl";
      default:
        return "text-base";
    }
  }, [content?.size]);

  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-2xl h-full w-full relative overflow-hidden transition-all"
      style={{
        background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.primary}03 100%)`,
        color: theme.headingColor,
      }}
    >
      {/* Number badge */}
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold transition-all"
          style={{
            backgroundColor: theme.primary,
            color: "#fff",
          }}
        >
          {icon || number}
        </div>

        {/* Decorative corner */}
        <div
          className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-10 pointer-events-none"
          style={{ backgroundColor: theme.primary }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 z-10">
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder ?? "Type '/' for commands"}
          className={`${textSizeClass} leading-relaxed`}
          readOnly={readOnly}
          theme={theme}
        />
      </div>
    </div>
  );
};
