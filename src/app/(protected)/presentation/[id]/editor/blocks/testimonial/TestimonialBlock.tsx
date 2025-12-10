import React, { useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createTestimonialContent,
  type TestimonialContent,
} from "../definitions";

interface TestimonialBlockProps {
  block: Block;
  onUpdate: (content: TestimonialContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const TestimonialBlock: React.FC<TestimonialBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = block.content as TestimonialContent;

  const quoteDoc = useMemo(() => {
    if (content?.quote?.type === "doc") return content.quote;
    return createTestimonialContent().quote;
  }, [content]);

  const nameDoc = useMemo(() => {
    if (content?.name?.type === "doc") return content.name;
    return createTestimonialContent().name;
  }, [content]);

  const roleDoc = useMemo(() => {
    if (content?.role?.type === "doc") return content.role;
    return createTestimonialContent().role;
  }, [content]);

  const extractText = (doc: any) =>
    doc?.content
      ?.flatMap((node: any) => node?.content || [])
      ?.map((n: any) => n?.text || "")
      ?.join("")
      ?.trim() || "JD";

  const handleQuoteChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createTestimonialContent()),
        quote: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleNameChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createTestimonialContent()),
        name: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleRoleChange = useCallback(
    (newDoc: any) => {
      onUpdate({
        ...(content ?? createTestimonialContent()),
        role: newDoc,
      });
    },
    [content, onUpdate]
  );

  return (
    <div
      className="w-full rounded-xl p-6 shadow-sm flex gap-4"
      style={{
        color: theme.bodyColor,
        backgroundColor: theme.cardBackground,
        border: `1px solid ${theme.primary}20`,
      }}
    >
      <div className="shrink-0">
        <div
          className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-sm font-medium"
          style={{
            backgroundColor: theme.primary + "15",
            border: `1px solid ${theme.primary}30`,
            color: theme.headingColor,
          }}
        >
          {extractText(nameDoc)
            .split(" ")
            .map((part: string) => part[0])
            .join("")
            .slice(0, 2) || "JD"}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <ProseMirrorEditor
          key={block.id}
          blockId={block.id}
          value={quoteDoc}
          onChange={handleQuoteChange}
          placeholder={placeholder ?? "Add a testimonial or quote..."}
          className="text-lg"
        />

        <div className="flex flex-col gap-2">
          <ProseMirrorEditor
            key={`${block.id}-name`}
            blockId={`${block.id}-name`}
            value={nameDoc}
            onChange={handleNameChange}
            placeholder="Name"
            className="text-base"
          />
          <ProseMirrorEditor
            key={`${block.id}-role`}
            blockId={`${block.id}-role`}
            value={roleDoc}
            onChange={handleRoleChange}
            placeholder="Role"
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
};
