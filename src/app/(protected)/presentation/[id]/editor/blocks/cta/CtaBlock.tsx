import React, { useCallback, useMemo, useState } from "react";
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

export const CtaBlock: React.FC<CtaBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}) => {
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
    <CommonCard theme={theme} className="w-full h-full p-8">
      <div
        className="group relative flex flex-col gap-5 transition-all"
        style={{
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
            theme={theme}
            readOnly={readOnly}
          />

          <ProseMirrorEditor
            key={`${block.id}-body`}
            blockId={`${block.id}-body`}
            value={bodyDoc}
            onChange={handleBodyChange}
            placeholder="Add a compelling description here..."
            className="text-base opacity-60 leading-relaxed max-w-2xl"
            theme={theme}
            readOnly={readOnly}
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
    </CommonCard>
  );
};
