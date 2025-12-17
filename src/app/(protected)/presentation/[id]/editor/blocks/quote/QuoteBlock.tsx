import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createQuoteContent, type QuoteContent } from "../definitions";

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
    <div
      className={`w-full h-full rounded-2xl p-6 flex flex-col gap-4 relative transition-all ${
        isCentered ? "items-center text-center" : "items-start text-left"
      }`}
      style={{
        background: isCentered
          ? `linear-gradient(135deg, ${theme.primary}08 0%, ${theme.primary}03 100%)`
          : "transparent",
        borderLeft: isCentered ? "none" : `3px solid ${theme.primary}`,
        paddingLeft: isCentered ? "1.5rem" : "1.5rem",
      }}
    >
      {/* Decorative Quote Mark */}
      <div
        className="text-5xl leading-none font-serif select-none opacity-15"
        style={{ color: theme.primary }}
      >
        &quot;
      </div>

      {/* Quote Content */}
      <div className="relative z-10 w-full">
        <ProseMirrorEditor
          key={`${block.id}-quote`}
          blockId={`${block.id}-quote`}
          value={quoteDoc}
          onChange={handleQuoteChange}
          placeholder={placeholder ?? "Add an inspiring quote..."}
          className="text-xl font-medium italic opacity-80 leading-relaxed"
          theme={theme}
        />
      </div>

      {/* Author */}
      <div
        className={`relative z-10 flex items-center gap-3 mt-1 ${
          isCentered ? "justify-center" : "justify-start"
        }`}
      >
        {isCentered && (
          <div
            className="h-px w-5"
            style={{ backgroundColor: theme.primary, opacity: 0.3 }}
          />
        )}
        <ProseMirrorEditor
          key={`${block.id}-author`}
          blockId={`${block.id}-author`}
          value={authorDoc}
          onChange={handleAuthorChange}
          placeholder="Author name"
          className="text-xs font-medium tracking-wide uppercase opacity-50"
          theme={theme}
        />
        {isCentered && (
          <div
            className="h-px w-5"
            style={{ backgroundColor: theme.primary, opacity: 0.3 }}
          />
        )}
      </div>
    </div>
  );
};
