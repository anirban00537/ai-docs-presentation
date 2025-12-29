import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  getDefaultNumberCardEditorContent,
  type NumberCardContent,
} from "../definitions";
import { UniversalIconPicker } from "../../ui/UniversalIconPicker";
import { CommonCard } from "../CommonCard";

interface NumberCardBlockProps {
  block: Block;
  onUpdate: (content: NumberCardContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

export const NumberCardBlock = memo(function NumberCardBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: NumberCardBlockProps) {
  const content = block.content as NumberCardContent;
  const number = content?.number ?? 1;
  const icon = content?.icon ?? "";

  const editorContent = useMemo(() => {
    return content?.editorContent ?? getDefaultNumberCardEditorContent();
  }, [content?.editorContent]);

  const handleNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readOnly) return;
      const val = parseInt(e.target.value, 10);
      const newNumber = isNaN(val) ? 0 : val;
      onUpdate({
        ...content,
        number: newNumber,
      });
    },
    [content, onUpdate, readOnly]
  );

  const handleIconChange = useCallback(
    (newIcon: string) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        icon: newIcon,
      });
    },
    [content, onUpdate, readOnly]
  );

  const handleEditorChange = useCallback(
    (newEditorContent: ProseMirrorDocument) => {
      if (readOnly) return;
      onUpdate({
        ...content,
        editorContent: newEditorContent,
      });
    },
    [content, onUpdate, readOnly]
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
    <CommonCard
      theme={theme}
      className="h-full w-full transition-all duration-300 hover:shadow-md"
    >
      <div
        className="flex flex-col gap-3 p-5 w-full relative overflow-hidden"
        style={{ 
          color: theme.headingColor,
          borderRadius: theme.cardBorderRadius ?? "12px"
        }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover/card:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Header: Icon/Number */}
        <div className="z-10">
          <style>{`
            .no-spinner::-webkit-outer-spin-button,
            .no-spinner::-webkit-inner-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            .no-spinner {
              -moz-appearance: textfield;
            }
          `}</style>
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 group-hover/card:scale-105 group-hover/card:rotate-3 shadow-sm border focus-within:ring-2 focus-within:ring-offset-2"
            style={{
              backgroundColor: `${theme.primary}15`,
              borderColor: `${theme.primary}25`,
              color: theme.primary,
              backdropFilter: "blur(8px)",
              // Use ring color from primary but lighter
              boxShadow: `0 0 0 0 ${theme.primary}00`,
            }}
          >
            <UniversalIconPicker
              value={icon}
              onChange={handleIconChange}
              theme={theme}
              disabled={readOnly}
              size="xl"
              className="bg-transparent border-none shadow-none"
            >
              {number}
            </UniversalIconPicker>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 z-10">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={editorContent}
            onChange={handleEditorChange}
            placeholder={placeholder ?? "Type '/' for commands"}
            className={`${textSizeClass} leading-relaxed tracking-tight`}
            readOnly={readOnly}
            theme={theme}
          />
        </div>
      </div>
    </CommonCard>
  );
});
