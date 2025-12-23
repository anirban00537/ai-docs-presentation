import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import { createQuoteContent, type QuoteContent } from "../definitions";

interface QuoteBlockProps {
  block: Block;
  onUpdate: (content: QuoteContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}) => {
  const content = block.content as QuoteContent;
  const style = content?.style ?? "centered";

  const quoteDoc = useMemo(() => {
    return content?.quote ?? createQuoteContent().quote;
  }, [content]);

  const authorDoc = useMemo(() => {
    return content?.author ?? createQuoteContent().author;
  }, [content]);

  const handleQuoteChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createQuoteContent()),
        quote: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleAuthorChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createQuoteContent()),
        author: newDoc,
      });
    },
    [content, onUpdate]
  );

  const isCentered = style === "centered";

  return (
    <CommonCard
      theme={theme}
      className={`w-full h-full transition-all duration-300 hover:shadow-md ${
        isCentered ? "items-center text-center" : "items-start text-left"
      }`}
    >
      <div 
        className={`flex flex-col gap-8 p-10 relative w-full h-full overflow-hidden ${isCentered ? "items-center" : "items-start"}`}
        style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Decorative Quote Mark (Badge style) */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-5xl leading-none transition-all duration-300 border shadow-sm"
          style={{ 
            backgroundColor: `${theme.primary}10`,
            borderColor: `${theme.primary}20`,
            color: theme.primary,
            backdropFilter: "blur(8px)"
          }}
        >
          <span className="opacity-30">&quot;</span>
        </div>

        {/* Quote Content */}
        <div className="relative z-10 w-full">
          <ProseMirrorEditor
            key={`${block.id}-quote`}
            blockId={`${block.id}-quote`}
            value={quoteDoc}
            onChange={handleQuoteChange}
            placeholder={placeholder ?? "Add an inspiring quote..."}
            className="text-2xl font-medium italic opacity-90 leading-relaxed tracking-tight"
            theme={theme}
            readOnly={readOnly}
          />
        </div>

        {/* Author */}
        <div
          className={`relative z-10 flex items-center gap-4 mt-2 ${
            isCentered ? "justify-center" : "justify-start"
          }`}
        >
          {isCentered && (
            <div
              className="h-px w-8"
              style={{ backgroundColor: theme.primary, opacity: 0.2 }}
            />
          )}
          <ProseMirrorEditor
            key={`${block.id}-author`}
            blockId={`${block.id}-author`}
            value={authorDoc}
            onChange={handleAuthorChange}
            placeholder="Author name"
            className="text-xs font-bold tracking-[0.2em] uppercase opacity-50"
            theme={theme}
            readOnly={readOnly}
          />
          {isCentered && (
            <div
              className="h-px w-8"
              style={{ backgroundColor: theme.primary, opacity: 0.2 }}
            />
          )}
        </div>
      </div>
    </CommonCard>
  );
};
