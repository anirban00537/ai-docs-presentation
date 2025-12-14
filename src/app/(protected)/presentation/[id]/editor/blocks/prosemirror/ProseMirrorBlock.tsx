import React from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";

interface ProseMirrorBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  placeholder?: string;
  theme?: Theme;
  readOnly?: boolean;
}

export const ProseMirrorBlock: React.FC<ProseMirrorBlockProps> = ({
  block,
  onUpdate,
  placeholder = "Type '/' for commands",
  readOnly,
}) => {
  return (
    <div className="w-full h-full flex flex-col">
      <ProseMirrorEditor
        key={block.id}
        blockId={block.id}
        value={block.content}
        onChange={onUpdate}
        placeholder={placeholder}
        className="flex-1"
        readOnly={readOnly}
      />
    </div>
  );
};
