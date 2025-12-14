import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  type GlassInsightContent,
  createGlassInsightContent,
} from "../definitions/glass-insight";
import { withAlpha } from "../utils";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface GlassInsightBlockProps {
  block: Block;
  onUpdate: (content: GlassInsightContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const GlassInsightBlock: React.FC<GlassInsightBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = block.content as GlassInsightContent;
  const icon = content?.icon ?? "💡";

  const editorContent = useMemo(() => {
    if (content?.editorContent && content.editorContent.type === "doc") {
      return content.editorContent;
    }
    return createGlassInsightContent().editorContent;
  }, [content?.editorContent]);

  const handleEditorChange = useCallback(
    (newEditorContent: any) => {
      onUpdate({ ...content, editorContent: newEditorContent });
    },
    [content, onUpdate]
  );

  const handleIconChange = useCallback(
    (emojiObject: any) => {
      onUpdate({ ...content, icon: emojiObject.emoji });
    },
    [content, onUpdate]
  );

  return (
    <div
      className="group relative p-8 rounded-3xl h-full w-full overflow-hidden transition-all"
      style={{
        backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.4),
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
      }}
    >
      {/* 3D Icon Container */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute top-0 right-0 p-6 text-6xl transform origin-top-right transition-transform cursor-pointer outline-none focus:outline-none z-20"
            style={{
              opacity: 0.8
            }}
            title="Change icon"
          >
            {icon}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none shadow-none bg-transparent">
          <EmojiPicker onEmojiClick={handleIconChange} />
        </PopoverContent>
      </Popover>

      {/* Content Area */}
      <div className="relative z-10 flex flex-col h-full justify-center">
        <div 
          className="mb-4 w-12 h-1 rounded-full opacity-30"
          style={{ backgroundColor: theme.primary }}
        />
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder ?? "Type your insight..."}
          className="text-xl md:text-2xl font-serif italic leading-relaxed opacity-90"
        />
      </div>

      {/* Decorative Shimmer */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none mix-blend-overlay"
      />
    </div>
  );
};
