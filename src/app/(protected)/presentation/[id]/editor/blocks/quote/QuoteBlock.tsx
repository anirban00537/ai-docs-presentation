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
      className={`w-full h-full rounded-2xl p-10 flex flex-col gap-6 relative transition-all duration-300 ${
        isCentered ? "items-center text-center" : "items-start text-left"
      }`}
      style={{
        backgroundColor: isCentered 
          ? withAlpha(theme.primary, 0.03) 
          : "transparent",
        borderLeft: isCentered 
          ? "none" 
          : `6px solid ${theme.primary}`,
        borderRadius: isCentered ? "1rem" : "0.5rem",
        paddingLeft: isCentered ? "2.5rem" : "2rem",
      }}
    >
      {/* Decorative Icon */}
      <div
        className="text-5xl leading-none opacity-20 font-serif select-none mb-2"
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
          className="text-2xl md:text-3xl font-serif italic opacity-90 leading-relaxed"
        />
      </div>

      <div className={`relative z-10 flex items-center gap-3 mt-2 ${isCentered ? "justify-center" : "justify-start"}`}>
        <div className={`h-px w-8 bg-current opacity-30 ${isCentered ? "block" : "hidden"}`} />
        <ProseMirrorEditor
          key={`${block.id}-author`}
          blockId={`${block.id}-author`}
          value={authorDoc}
          onChange={handleAuthorChange}
          placeholder="Author name"
          className="text-base font-semibold tracking-wide uppercase opacity-70"
        />
        <div className={`h-px w-8 bg-current opacity-30 ${isCentered ? "block" : "hidden"}`} />
      </div>
    </div>
  );
};

