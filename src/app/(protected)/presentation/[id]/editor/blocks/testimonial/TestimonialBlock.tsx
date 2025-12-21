import React, { useCallback, useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
  createTestimonialContent,
  type TestimonialContent,
} from "../definitions";
import { BlockWrapper } from "../BlockWrapper";
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

export const TestimonialBlock: React.FC<TestimonialBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
  readOnly = false,
}) => {
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

  const extractText = (doc: any) => {
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
    return (
      doc?.content
        ?.flatMap((node: any) => node?.content || [])
        ?.map((n: any) => n?.text || "")
        ?.join("")
        ?.trim() || "JD"
    );
  };

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
      <CommonCard theme={theme} className="w-full h-full p-6">
        <div
          className="group flex flex-col gap-5 relative overflow-hidden transition-all"
          style={{
            color: theme.bodyColor || theme.headingColor,
          }}
        >
          {/* Quote mark */}
          <div
            className="absolute top-4 right-5 text-7xl leading-none opacity-10 font-serif select-none pointer-events-none"
            style={{ color: theme.primary }}
          >
            &quot;
          </div>

          {/* Quote */}
          <div className="relative z-10 flex-1 min-w-0">
            <ProseMirrorEditor
              key={block.id}
              blockId={block.id}
              value={quoteDoc}
              onChange={handleQuoteChange}
              placeholder={placeholder ?? "Add a testimonial..."}
              className="text-lg italic font-medium leading-relaxed opacity-80"
              theme={theme}
              readOnly={readOnly}
            />
          </div>

          {/* Author */}
          <div
            className="relative z-10 flex items-center gap-3 pt-4"
            style={{ borderTop: `1px solid ${theme.primary}10` }}
          >
            <div className={`shrink-0 ${!readOnly ? 'cursor-pointer' : ''}`} onClick={!readOnly ? handleOpenEdit : undefined}>
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover transition-opacity hover:opacity-80"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
                  style={{
                    backgroundColor: theme.primary,
                    color: "#fff",
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

            <div className="flex flex-col">
              <ProseMirrorEditor
                key={`${block.id}-name`}
                blockId={`${block.id}-name`}
                value={nameDoc}
                onChange={handleNameChange}
                placeholder="Name"
                className="text-sm font-semibold"
                theme={theme}
                readOnly={readOnly}
              />
              <ProseMirrorEditor
                key={`${block.id}-role`}
                blockId={`${block.id}-role`}
                value={roleDoc}
                onChange={handleRoleChange}
                placeholder="Role"
                className="text-[11px] font-medium uppercase tracking-wide opacity-50"
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
};
