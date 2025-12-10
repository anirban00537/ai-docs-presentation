import React from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";

interface ProseMirrorBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  placeholder?: string;
  theme?: Theme;
}

export const ProseMirrorBlock: React.FC<ProseMirrorBlockProps> = ({
  block,
  onUpdate,
  placeholder = "Type '/' for commands",
}) => {
  return (
    <ProseMirrorEditor
      key={block.id}
      blockId={block.id}
      value={block.content}
      onChange={onUpdate}
      placeholder={placeholder}
      className=""
    />
  );
};

