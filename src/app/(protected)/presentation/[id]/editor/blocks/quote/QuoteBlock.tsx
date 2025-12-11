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

const applyAlpha = (hex: string, alpha: number): string => {
  const raw = hex?.replace("#", "");
  if (raw.length !== 6) return hex;
  const r = parseInt(raw.substring(0, 2), 16);
  const g = parseInt(raw.substring(2, 4), 16);
  const b = parseInt(raw.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

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
      className={`w-full h-full rounded-2xl p-8 shadow-lg flex flex-col ${
        isCentered ? "text-center" : "text-left"
      }`}
      style={{
        backgroundColor: applyAlpha(theme.primary, 0.08),
        border: `2px solid ${applyAlpha(theme.primary, 0.2)}`,
        borderLeft: isCentered
          ? `2px solid ${applyAlpha(theme.primary, 0.2)}`
          : `4px solid ${theme.primary}`,
        color: theme.headingColor,
      }}
    >
      {/* Quote Icon */}
      <div
        className={`mb-4 ${isCentered ? "mx-auto" : ""}`}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          backgroundColor: applyAlpha(theme.primary, 0.15),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
          color: theme.primary,
        }}
      >
        "
      </div>

      {/* Quote Text */}
      <div className="mb-6">
        <ProseMirrorEditor
          key={`${block.id}-quote`}
          blockId={`${block.id}-quote`}
          value={quoteDoc}
          onChange={handleQuoteChange}
          placeholder={placeholder ?? "Add an inspiring quote..."}
          className="text-2xl font-medium leading-relaxed"
          style={{
            color: theme.headingColor,
            fontStyle: "italic",
          }}
        />
      </div>

      {/* Author */}
      <div
        className={`border-t pt-4 ${isCentered ? "text-center" : "text-right"}`}
        style={{
          borderColor: applyAlpha(theme.primary, 0.2),
        }}
      >
        <div className="text-sm font-medium opacity-70 mb-1">—</div>
        <ProseMirrorEditor
          key={`${block.id}-author`}
          blockId={`${block.id}-author`}
          value={authorDoc}
          onChange={handleAuthorChange}
          placeholder="Author name"
          className="text-base font-semibold"
          style={{
            color: theme.headingColor,
          }}
        />
      </div>
    </div>
  );
};
