import React, { useCallback, useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createCtaContent, type CtaContent } from "../definitions";
import { IconArrowRight } from "@tabler/icons-react";

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
      className="group w-full h-full rounded-2xl p-8 flex flex-col gap-5 relative overflow-hidden transition-all"
      style={{
        background: `linear-gradient(135deg, ${theme.primary}12 0%, ${theme.primary}05 100%)`,
        color: theme.headingColor,
      }}
    >
      {/* Content */}
      <div className="relative z-10 flex flex-col gap-3">
        <ProseMirrorEditor
          key={`${block.id}-heading`}
          blockId={`${block.id}-heading`}
          value={headingDoc}
          onChange={handleHeadingChange}
          placeholder={placeholder ?? "Ready to get started?"}
          className="text-2xl font-semibold tracking-tight leading-tight"
        />

        <ProseMirrorEditor
          key={`${block.id}-body`}
          blockId={`${block.id}-body`}
          value={bodyDoc}
          onChange={handleBodyChange}
          placeholder="Add a compelling description here..."
          className="text-base opacity-60 leading-relaxed max-w-2xl"
        />
      </div>

      {/* Button */}
      <div className="relative z-10 flex flex-wrap gap-4 items-center">
        {isEditingLabel ? (
          <input
            className="rounded-full px-5 py-2.5 text-sm font-medium min-w-[140px] focus:outline-none transition-all bg-transparent"
            value={content?.buttonLabel ?? ""}
            onChange={(e) => handleFieldChange("buttonLabel", e.target.value)}
            onBlur={() => setIsEditingLabel(false)}
            autoFocus
            placeholder="Button label"
            style={{
              border: `2px solid ${theme.primary}`,
              color: theme.primary,
            }}
          />
        ) : (
          <button
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-2 hover:opacity-90"
            style={{
              backgroundColor: theme.primary,
              color: "#ffffff",
            }}
            onClick={() => setIsEditingLabel(true)}
            title="Click to edit label"
          >
            {content?.buttonLabel || "Get started"}
            <IconArrowRight size={16} />
          </button>
        )}
      </div>

      {/* Decorative gradient orb */}
      <div
        className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: theme.primary }}
      />
    </div>
  );
};
