import React, { useCallback, useMemo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createTestimonialContent,
  type TestimonialContent,
} from "../definitions";
import { withAlpha } from "../utils";
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
}

export const TestimonialBlock: React.FC<TestimonialBlockProps> = ({
  block,
  onUpdate,
  theme,
  placeholder,
}) => {
  const content = (block.content as TestimonialContent) ?? createTestimonialContent();
  const { avatar } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempAvatar, setTempAvatar] = useState(avatar || "");

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
      <div
        className="group w-full h-full rounded-2xl p-8 flex flex-col gap-6 relative overflow-hidden transition-all"
        style={{
          color: theme.bodyColor || theme.headingColor,
          backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
          backdropFilter: "blur(12px)",
          border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
          boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
        }}
      >
        {/* Large Quote Watermark */}
        <div 
          className="absolute top-4 right-6 text-9xl leading-none opacity-5 font-serif select-none pointer-events-none transition-transform group-hover:scale-110 duration-500 origin-top-right"
          style={{ color: theme.primary }}
        >
          "
        </div>

        <div className="relative z-10 flex-1 min-w-0">
          <ProseMirrorEditor
            key={block.id}
            blockId={block.id}
            value={quoteDoc}
            onChange={handleQuoteChange}
            placeholder={placeholder ?? "Add a testimonial or quote..."}
            className="text-xl italic font-medium leading-relaxed"
          />
        </div>

        <div className="relative z-10 flex items-center gap-4 pt-4 border-t" style={{ borderColor: withAlpha(theme.primary, 0.1) }}>
          <div className="shrink-0 cursor-pointer" onClick={handleOpenEdit}>
            {avatar ? (
                <img 
                    src={avatar} 
                    alt="Avatar" 
                    className="w-12 h-12 rounded-full object-cover shadow-sm transition-transform hover:scale-110"
                    style={{
                         boxShadow: `0 2px 8px ${withAlpha(theme.primary, 0.25)}`
                    }}
                />
            ) : (
                <div
                className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold shadow-sm transition-transform hover:scale-110"
                style={{
                    backgroundColor: theme.primary,
                    color: theme.cardBackground,
                    boxShadow: `0 2px 8px ${withAlpha(theme.primary, 0.25)}`
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
              className="text-base font-semibold"
            />
            <ProseMirrorEditor
              key={`${block.id}-role`}
              blockId={`${block.id}-role`}
              value={roleDoc}
              onChange={handleRoleChange}
              placeholder="Role"
              className="text-xs font-medium uppercase tracking-wide opacity-70"
            />
          </div>
        </div>
      </div>

       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
             <DialogDescription>
                Customize testimonial appearance.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="space-y-2">
                <Label>Avatar URL</Label>
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
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
};
