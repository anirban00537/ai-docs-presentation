import React, { useCallback, useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createCtaContent, type CtaContent } from "../definitions";

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
      className="w-full rounded-xl p-6 shadow-sm flex flex-col gap-4"
      style={{
        backgroundColor: theme.cardBackground,
        color: theme.bodyColor,
        border: `1px solid ${theme.primary}20`,
      }}
    >
      <ProseMirrorEditor
        key={`${block.id}-heading`}
        blockId={`${block.id}-heading`}
        value={headingDoc}
        onChange={handleHeadingChange}
        placeholder={placeholder ?? "Add a headline"}
        className="text-2xl font-semibold"
      />

      <ProseMirrorEditor
        key={`${block.id}-body`}
        blockId={`${block.id}-body`}
        value={bodyDoc}
        onChange={handleBodyChange}
        placeholder="Add supporting copy"
        className="text-base"
      />

      <div className="flex flex-wrap gap-3 items-center">
        {isEditingLabel ? (
          <input
            className="rounded-md px-3 py-2 text-sm min-w-[180px] flex-1 focus:outline-none"
            value={content?.buttonLabel ?? ""}
            onChange={(e) => handleFieldChange("buttonLabel", e.target.value)}
            onBlur={() => setIsEditingLabel(false)}
            autoFocus
            placeholder="Button label"
            style={{
              backgroundColor: theme.cardBackground,
              border: `1px solid ${theme.primary}25`,
              color: theme.bodyColor,
            }}
          />
        ) : (
          <button
            className="px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors"
            style={{
              backgroundColor: theme.primary,
              color: "white",
            }}
            onClick={() => setIsEditingLabel(true)}
            title="Click to edit label"
          >
            {content?.buttonLabel || "Get started"}
          </button>
        )}
      </div>
    </div>
  );
};

