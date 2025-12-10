import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block } from "@/store/slices/slidesSlice";
import type { Theme } from "@/store/slices/slidesSlice";
import {
  type NumberCardContent,
  getDefaultNumberCardEditorContent,
} from "./index";

interface NumberCardBlockProps {
  block: Block;
  onUpdate: (content: NumberCardContent) => void;
  theme: Theme;
}

export const NumberCardBlock: React.FC<NumberCardBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = block.content as NumberCardContent;
  const number = content?.number ?? 1;
  const icon = content?.icon ?? "";

  // Ensure editorContent exists, fallback to default if missing
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
    <div className="flex flex-col gap-4 p-4">
      {/* Number/Icon Circle - Top Left */}
      <div className="flex items-start">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
          style={{
            backgroundColor: theme.primary,
            color: theme.bodyColor,
          }}
        >
          {icon || number}
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
