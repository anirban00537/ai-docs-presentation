import React, { useCallback, useMemo, useState, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
  createTestimonialContent,
  type TestimonialContent,
} from "../definitions";
import { BlockWrapper } from "../../block/BlockWrapper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TestimonialBlockProps {
  block: Block;
  onUpdate: (content: TestimonialContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const TestimonialBlock = memo(function TestimonialBlock({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}: TestimonialBlockProps) {
  const content =
    (block.content as TestimonialContent) ?? createTestimonialContent();
  const { avatar } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(avatar || "");
  const isDark = theme.themeType === "dark";

  const quoteDoc = useMemo(() => {
    return content?.quote ?? createTestimonialContent().quote;
  }, [content]);

  const nameDoc = useMemo(() => {
    return content?.name ?? createTestimonialContent().name;
  }, [content]);

  const roleDoc = useMemo(() => {
    return content?.role ?? createTestimonialContent().role;
  }, [content]);

  const extractText = (doc: ProseMirrorDocument | unknown): string => {
    // Handle Markdown string
    if (typeof doc === "string") {
      // Extract first letters from first two words
      const words = doc.trim().split(/\s+/);
      if (words.length >= 2) {
        return (words[0][0] || "") + (words[1][0] || "");
      }
      return words[0]?.[0] || "JD";
    }
    // Handle legacy JSON format
    const docObj = doc as { content?: Array<{ content?: Array<{ text?: string }> }> } | null;
    return (
      docObj?.content
        ?.flatMap((node) => node?.content || [])
        ?.map((n) => n?.text || "")
        ?.join("")
        ?.trim() || "JD"
    );
  };

  const handleQuoteChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({
        ...(content ?? createTestimonialContent()),
        quote: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleNameChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({
        ...(content ?? createTestimonialContent()),
        name: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleRoleChange = useCallback(
    (newDoc: ProseMirrorDocument) => {
      onUpdate({
        ...(content ?? createTestimonialContent()),
        role: newDoc,
      });
    },
    [content, onUpdate]
  );

  const handleOpenEdit = () => {
    setTempAvatar(avatar || "");
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      avatar: tempAvatar,
    });
    setIsEditOpen(false);
  };

  return (
    <BlockWrapper onEdit={handleOpenEdit} theme={theme}>
      <CommonCard theme={theme} className="w-full h-full transition-all duration-300 hover:shadow-md">
        <div
          className="group flex flex-col gap-8 p-8 relative h-full w-full overflow-hidden"
          style={{
            color: theme.bodyColor || theme.headingColor,
            borderRadius: theme.cardBorderRadius ?? "12px"
          }}
        >
          {/* Minimal Gradient Background Blob */}
          <div
            className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
            style={{ backgroundColor: theme.primary }}
          />

          {/* Quote mark (Badge style) */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-4xl leading-none transition-all duration-300 border shadow-sm"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}20`,
              color: theme.primary,
              backdropFilter: "blur(8px)"
            }}
          >
             <span className="opacity-40">&quot;</span>
          </div>

          {/* Quote */}
          <div className="relative z-10 flex-1 min-w-0">
            <ProseMirrorEditor
              key={block.id}
              blockId={block.id}
              value={quoteDoc}
              onChange={handleQuoteChange}
              placeholder={placeholder ?? "Add a testimonial..."}
              className="text-xl italic font-medium leading-relaxed tracking-tight opacity-90"
              theme={theme}
              readOnly={readOnly}
            />
          </div>

          {/* Author */}
          <div
            className="relative z-10 flex items-center gap-4 pt-6"
            style={{ borderTop: `1px solid ${theme.primary}15` }}
          >
            <div
              className={`shrink-0 ${!readOnly ? "cursor-pointer" : ""}`}
              onClick={!readOnly ? handleOpenEdit : undefined}
            >
              {avatar ? (
                <div className="p-0.5 rounded-full border border-black/5 dark:border-white/10 shadow-sm">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover transition-opacity hover:opacity-80"
                  />
                </div>
              ) : (
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold transition-all border shadow-sm"
                  style={{
                    backgroundColor: `${theme.primary}15`,
                    borderColor: `${theme.primary}25`,
                    color: theme.primary,
                    backdropFilter: "blur(4px)"
                  }}
                >
                  {extractText(nameDoc)
                    .split(" ")
                    .map((part: string) => part[0])
                    .join("")
                    .slice(0, 2) || "JD"}
                </div>
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div style={{ color: theme.headingColor }}>
                <ProseMirrorEditor
                  key={`${block.id}-name`}
                  blockId={`${block.id}-name`}
                  value={nameDoc}
                  onChange={handleNameChange}
                  placeholder="Name"
                  className="text-base font-bold tracking-tight"
                  theme={theme}
                  readOnly={readOnly}
                />
              </div>
              <ProseMirrorEditor
                key={`${block.id}-role`}
                blockId={`${block.id}-role`}
                value={roleDoc}
                onChange={handleRoleChange}
                placeholder="Role"
                className="text-[11px] font-semibold uppercase tracking-widest opacity-50"
                theme={theme}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      </CommonCard>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          style={{
            backgroundColor: isDark
              ? "rgba(20,20,24,0.98)"
              : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
              Testimonial Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Customize testimonial appearance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>
                Avatar URL
              </Label>
              <Input
                value={tempAvatar}
                onChange={(e) => setTempAvatar(e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              style={{ backgroundColor: theme.primary }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
});
