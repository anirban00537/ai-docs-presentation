import React, { useCallback, useMemo, useState, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import { createCtaContent, type CtaContent } from "../definitions";
import { IconArrowRight } from "@tabler/icons-react";

interface CtaBlockProps {
  block: Block;
  onUpdate: (content: CtaContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const CtaBlock = memo(function CtaBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: CtaBlockProps) {
  const content = block.content as CtaContent;
  const [isEditingLabel, setIsEditingLabel] = useState(false);

  const headingDoc = useMemo(() => {
    return content?.heading ?? createCtaContent().heading;
  }, [content]);

  const bodyDoc = useMemo(() => {
    return content?.body ?? createCtaContent().body;
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
    <CommonCard 
      theme={theme} 
      className="w-full h-full transition-all duration-300 hover:shadow-md"
    >
      <div
        className="group relative h-full w-full p-10 flex flex-col gap-8 transition-all overflow-hidden"
        style={{
          color: theme.headingColor,
          borderRadius: theme.cardBorderRadius ?? "12px"
        }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Content Area */}
        <div className="relative z-10 flex flex-col gap-4">
          <ProseMirrorEditor
            key={`${block.id}-heading`}
            blockId={`${block.id}-heading`}
            value={headingDoc}
            onChange={handleHeadingChange}
            placeholder={placeholder ?? "Ready to get started?"}
            className="text-3xl font-bold tracking-tight leading-tight"
            theme={theme}
            readOnly={readOnly}
          />

          <ProseMirrorEditor
            key={`${block.id}-body`}
            blockId={`${block.id}-body`}
            value={bodyDoc}
            onChange={handleBodyChange}
            placeholder="Add a compelling description here..."
            className="text-base opacity-60 leading-relaxed max-w-2xl tracking-normal"
            theme={theme}
            readOnly={readOnly}
          />
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex flex-wrap gap-4 items-center mt-auto">
          {isEditingLabel ? (
            <input
              className="rounded-2xl px-6 py-3 text-sm font-bold min-w-[160px] focus:outline-none transition-all shadow-sm border"
              value={content?.buttonLabel ?? ""}
              onChange={(e) => handleFieldChange("buttonLabel", e.target.value)}
              onBlur={() => setIsEditingLabel(false)}
              autoFocus
              placeholder="Button label"
              style={{
                backgroundColor: `${theme.primary}05`,
                borderColor: theme.primary,
                color: theme.primary,
              }}
            />
          ) : (
            <button
              className="px-8 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-95 flex items-center gap-3 hover:opacity-90 shadow-lg shadow-primary/10"
              style={{
                backgroundColor: theme.primary,
                color: "#ffffff",
              }}
              onClick={() => setIsEditingLabel(true)}
              title="Click to edit label"
            >
              <span className="tracking-tight">{content?.buttonLabel || "Get started"}</span>
              <IconArrowRight size={18} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </CommonCard>
  );
});
