import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createQuoteContent, type QuoteContent } from "../definitions";
import { withAlpha } from "../utils";

interface QuoteBlockProps {
  block: Block;
  onUpdate: (content: QuoteContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = block.content as QuoteContent;
  const style = content?.style ?? "centered";

  const quoteDoc = useMemo(() => {
    if (content?.quote?.type === "doc") return content.quote;
    return createQuoteContent().quote;
  }, [content]);

  const authorDoc = useMemo(() => {
    if (content?.author?.type === "doc") return content.author;
    return createQuoteContent().author;
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
    <div
      className={`w-full h-full rounded-xl p-6 flex flex-col gap-4 relative transition-all duration-300 ${
        isCentered ? "items-center text-center" : "items-start text-left"
      }`}
      style={{
        backgroundColor: isCentered 
          ? withAlpha(theme.primary, 0.03) 
          : "transparent",
        borderLeft: isCentered 
          ? "none" 
          : `3px solid ${theme.primary}`,
        borderRadius: isCentered ? "0.75rem" : "0",
        paddingLeft: isCentered ? "1.5rem" : "1.5rem",
      }}
    >
      {/* Decorative Icon */}
      <div
        className="text-4xl leading-none opacity-20 font-serif select-none mb-1"
        style={{ color: theme.primary }}
      >
        "
      </div>

      <div className="relative z-10 w-full">
        <ProseMirrorEditor
          key={`${block.id}-quote`}
          blockId={`${block.id}-quote`}
          value={quoteDoc}
          onChange={handleQuoteChange}
          placeholder={placeholder ?? "Add an inspiring quote..."}
          className="text-xl md:text-2xl font-serif italic opacity-90 leading-relaxed"
        />
      </div>

      <div className={`relative z-10 flex items-center gap-3 mt-1 ${isCentered ? "justify-center" : "justify-start"}`}>
        <div className={`h-px w-6 bg-current opacity-30 ${isCentered ? "block" : "hidden"}`} />
        <ProseMirrorEditor
          key={`${block.id}-author`}
          blockId={`${block.id}-author`}
          value={authorDoc}
          onChange={handleAuthorChange}
          placeholder="Author name"
          className="text-sm font-medium tracking-wide uppercase opacity-70"
        />
        <div className={`h-px w-6 bg-current opacity-30 ${isCentered ? "block" : "hidden"}`} />
      </div>
    </div>
  );
};

