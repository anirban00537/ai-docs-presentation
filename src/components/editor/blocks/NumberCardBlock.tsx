import React, { useCallback, useMemo, useState } from "react";
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
  onDuplicate?: () => void;
  canDuplicate?: boolean;
}

export const NumberCardBlock: React.FC<NumberCardBlockProps> = ({
  block,
  onUpdate,
  theme,
  onDuplicate,
  canDuplicate = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
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

  const handleDuplicateClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      if (onDuplicate) {
        onDuplicate();
      }
    },
    [onDuplicate]
  );

  return (
    <div
      className="relative flex flex-col gap-4 p-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Plus Button - Left Side on Hover */}
      {isHovered && canDuplicate && onDuplicate && (
        <button
          onClick={handleDuplicateClick}
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all z-30 cursor-pointer"
          style={{
            backgroundColor: theme.primary,
          }}
          title="Add duplicate card to the right"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="6" y1="2" x2="6" y2="10" />
            <line x1="2" y1="6" x2="10" y2="6" />
          </svg>
        </button>
      )}

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
