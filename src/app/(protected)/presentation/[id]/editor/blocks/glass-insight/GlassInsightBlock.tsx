import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  type GlassInsightContent,
  createGlassInsightContent,
} from "../definitions/glass-insight";
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
  const isDark = theme.themeType === "dark";

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
      className="group relative p-8 rounded-2xl h-full w-full overflow-hidden transition-all"
      style={{
        background: `linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}05 100%)`,
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Floating Icon */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute top-6 right-6 text-5xl transition-all hover:scale-110 cursor-pointer outline-none z-20"
            style={{ opacity: 0.7 }}
            title="Change icon"
          >
            {icon}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none shadow-xl">
          <EmojiPicker onEmojiClick={handleIconChange} />
        </PopoverContent>
      </Popover>

      {/* Content Area */}
      <div className="relative z-10 flex flex-col h-full justify-center">
        <div 
          className="mb-4 w-10 h-0.5 rounded-full"
          style={{ backgroundColor: theme.primary, opacity: 0.4 }}
        />
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={editorContent}
          onChange={handleEditorChange}
          placeholder={placeholder ?? "Type your insight..."}
          className="text-xl font-medium leading-relaxed opacity-80"
        />
      </div>

      {/* Decorative gradient */}
      <div
        className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ backgroundColor: theme.primary }}
      />
    </div>
  );
};
