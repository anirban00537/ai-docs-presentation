import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  getDefaultNumberCardEditorContent,
  type NumberCardContent,
} from "../definitions";
import { withAlpha } from "../utils";

interface NumberCardBlockProps {
  block: Block;
  onUpdate: (content: NumberCardContent) => void;
  theme: Theme;
  placeholder?: string;
}

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
        size: content?.size ?? "medium",
        editorContent: newEditorContent,
      };
      onUpdate(newContent);
    },
    [icon, number, content?.size, onUpdate]
  );

  const textSizeClass = useMemo(() => {
    switch (content?.size) {
      case "small":
        return "text-sm";
      case "large":
        return "text-xl";
      default:
        return "text-lg";
    }
  }, [content?.size]);

  return (
    <div
      className="group flex flex-col gap-6 p-6 rounded-2xl h-full w-full relative overflow-hidden transition-all hover:translate-y-[-2px] hover:shadow-lg duration-300"
      style={{
        backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.7),
        backdropFilter: "blur(8px)",
        color: theme.headingColor,
        border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
        boxShadow: `0 4px 6px -1px ${withAlpha(theme.primary, 0.05)}`,
      }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm transition-transform group-hover:scale-105 duration-300"
          style={{
            backgroundColor: theme.primary,
            color: theme.cardBackground,
            boxShadow: `0 8px 16px -4px ${withAlpha(theme.primary, 0.4)}`,
            fontFamily: "var(--font-heading)",
          }}
        >
          {icon || number}
        </div>
        
        {/* Decorative corner accent */}
        <div 
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 pointer-events-none transition-opacity group-hover:opacity-20 duration-500"
          style={{ backgroundColor: theme.primary }}
        />
      </div>

      <div className="flex-1 min-w-0 z-10">
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder ?? "Type '/' for commands"}
          className={`${textSizeClass} leading-relaxed`}
        />
      </div>
    </div>
  );
};

