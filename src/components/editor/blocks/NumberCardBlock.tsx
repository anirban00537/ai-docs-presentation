import React from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block } from "@/store/slices/slidesSlice";
import type { Theme } from "@/store/slices/slidesSlice";

interface NumberCardBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme: Theme;
}

interface NumberCardContent {
  type: "number-card";
  icon?: string;
  number?: number;
  editorContent: any; // ProseMirror document format
}

export const NumberCardBlock: React.FC<NumberCardBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = block.content as NumberCardContent;
  const number = content?.number || 1;
  const icon = content?.icon || "";
  const editorContent = content?.editorContent;

  const handleEditorChange = (newEditorContent: any) => {
    const newContent: NumberCardContent = {
      type: "number-card",
      icon,
      number,
      editorContent: newEditorContent,
    };
    onUpdate(newContent);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Number/Icon Circle - Top Left */}
      <div className="flex items-start">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: theme.primary,
            color: theme.bodyColor,
          }}
        >
          {icon ? (
            <span
              className="text-lg font-bold"
              style={{ color: theme.bodyColor }}
            >
              {icon}
            </span>
          ) : (
            <span
              className="text-lg font-bold"
              style={{ color: theme.bodyColor }}
            >
              {number}
            </span>
          )}
        </div>
      </div>

      {/* ProseMirror Editor */}
      <div className="flex-1 min-w-0">
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder="Type '/' for commands"
          className=""
        />
      </div>
    </div>
  );
};
