import React, { useCallback, useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createCtaContent, type CtaContent } from "../definitions";
import { withAlpha } from "../utils";

interface CtaBlockProps {
  block: Block;
  onUpdate: (content: CtaContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const CtaBlock: React.FC<CtaBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = block.content as CtaContent;
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const headingDoc = useMemo(() => {
    if (content?.heading?.type === "doc") return content.heading;
    return createCtaContent().heading;
  }, [content]);

  const bodyDoc = useMemo(() => {
    if (content?.body?.type === "doc") return content.body;
    return createCtaContent().body;
  }, [content]);

  const handleHeadingChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createCtaContent()),
        heading: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleBodyChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createCtaContent()),
        body: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleFieldChange = useCallback(
    (field: keyof CtaContent, value: string) => {
      onUpdate({
        ...(content ?? createCtaContent()),
        [field]: value,
      });
    },
    [content, onUpdate]
  );

  return (
    <div
      className="group w-full h-full rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 duration-300"
      style={{
        backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.6),
        backdropFilter: "blur(12px)",
        color: theme.headingColor,
        border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
        boxShadow: `0 4px 20px ${withAlpha(theme.primary, 0.05)}`,
      }}
    >
      {/* Subtle Gradient Background Effect */}
      <div 
        className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
        style={{ backgroundColor: theme.primary }}
      />

      <div className="relative z-10 flex flex-col gap-4">
        <ProseMirrorEditor
          key={`${block.id}-heading`}
          blockId={`${block.id}-heading`}
          value={headingDoc}
          onChange={handleHeadingChange}
          placeholder={placeholder ?? "Ready to get started?"}
          className="text-3xl font-bold tracking-tight"
        />

        <ProseMirrorEditor
          key={`${block.id}-body`}
          blockId={`${block.id}-body`}
          value={bodyDoc}
          onChange={handleBodyChange}
          placeholder="Add a compelling description here..."
          className="text-lg opacity-80 leading-relaxed max-w-2xl"
        />
      </div>

      <div className="relative z-10 mt-2 flex flex-wrap gap-4 items-center">
        {isEditingLabel ? (
          <input
            className="rounded-full px-6 py-3 text-base font-medium min-w-[180px] focus:outline-none shadow-sm transition-all focus:ring-2"
            value={content?.buttonLabel ?? ""}
            onChange={(e) => handleFieldChange("buttonLabel", e.target.value)}
            onBlur={() => setIsEditingLabel(false)}
            autoFocus
            placeholder="Button label"
            style={{
              backgroundColor: theme.cardBackground,
              boxShadow: `0 0 0 2px ${withAlpha(theme.primary, 0.3)}`,
              color: theme.primary,
            }}
          />
        ) : (
          <button
            className="px-8 py-3 rounded-full text-base font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2 group/btn"
            style={{
              backgroundColor: theme.primary,
              color: theme.cardBackground,
              boxShadow: `0 4px 12px ${withAlpha(theme.primary, 0.3)}`,
            }}
            onClick={() => setIsEditingLabel(true)}
            title="Click to edit label"
          >
            {content?.buttonLabel || "Get started"}
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="none" 
              className="opacity-80 group-hover/btn:translate-x-0.5 transition-transform"
            >
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

