import React, { useState, useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createFAQContent, type FAQContent } from "../definitions";
import { withAlpha } from "../utils";
import { IconChevronDown } from "@tabler/icons-react";
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
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { createParagraphContent } from "../definitions/common";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FAQBlockProps {
  block: Block;
  onUpdate: (content: FAQContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const FAQBlock: React.FC<FAQBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content = (block.content as FAQContent) ?? createFAQContent();
  const { items, style } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempStyle, setTempStyle] = useState(style);

  const [expandedItems, setExpandedItems] = useState<boolean[]>(
    items.map((item) => item.expanded ?? false)
  );

  const toggleItem = useCallback(
    (index: number) => {
      const newExpanded = [...expandedItems];
      newExpanded[index] = !newExpanded[index];
      setExpandedItems(newExpanded);

      // Update content
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        expanded: newExpanded[index],
      };
      onUpdate({
        ...content,
        items: newItems,
      });
    },
    [expandedItems, items, content, onUpdate]
  );

  const handleQuestionChange = useCallback(
    (index: number, newContent: any) => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        question: newContent,
      };
      onUpdate({
        ...content,
        items: newItems,
      });
    },
    [items, content, onUpdate]
  );

  const handleAnswerChange = useCallback(
    (index: number, newContent: any) => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        answer: newContent,
      };
      onUpdate({
        ...content,
        items: newItems,
      });
    },
    [items, content, onUpdate]
  );

   const addItem = () => {
    onUpdate({
      ...content,
      items: [
        ...items,
        {
          question: createParagraphContent("New Question"),
          answer: createParagraphContent("New Answer"),
          expanded: true,
        },
      ],
    });
    setExpandedItems([...expandedItems, true]);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    const newExpanded = expandedItems.filter((_, i) => i !== index);
    onUpdate({ ...content, items: newItems });
    setExpandedItems(newExpanded);
  };

  const handleOpenEdit = () => {
    setTempStyle(style);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      style: tempStyle,
    });
    setIsEditOpen(false);
  };


  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addItem} theme={theme}>
      <div className="w-full flex flex-col gap-3">
        {items.map((item, index) => {
          const isExpanded = expandedItems[index];
          return (
            <div
              key={index}
              className="rounded-xl overflow-hidden transition-all duration-300 relative group/item"
              style={{
                backgroundColor: withAlpha(
                  theme.cardBackground || "#ffffff",
                  0.5
                ),
                border: `1px solid ${withAlpha(theme.primary, 0.1)}`,
              }}
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-5 flex items-center justify-between gap-4 text-left transition-colors hover:opacity-80"
                style={{ color: theme.headingColor }}
              >
                <div className="flex-1 min-w-0">
                  <ProseMirrorEditor
                    key={`${block.id}-question-${index}`}
                    blockId={`${block.id}-question-${index}`}
                    value={item.question}
                    onChange={(newContent) =>
                      handleQuestionChange(index, newContent)
                    }
                    placeholder="Question?"
                    className="font-semibold text-base"
                  />
                </div>
                <div
                  className="shrink-0 transition-transform duration-300"
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    color: theme.primary,
                  }}
                >
                  <IconChevronDown className="size-5" />
                </div>
              </button>
              {isExpanded && (
                <div
                  className="px-5 pb-5 border-t"
                  style={{
                    borderColor: withAlpha(theme.primary, 0.1),
                  }}
                >
                  <div className="pt-4">
                    <ProseMirrorEditor
                      key={`${block.id}-answer-${index}`}
                      blockId={`${block.id}-answer-${index}`}
                      value={item.answer}
                      onChange={(newContent) =>
                        handleAnswerChange(index, newContent)
                      }
                      placeholder="Answer..."
                      className="text-sm opacity-90"
                    />
                  </div>
                </div>
              )}
               <button 
                  onClick={(e) => { e.stopPropagation(); removeItem(index); }}
                  className="absolute top-5 right-12 z-10 opacity-0 group-hover/item:opacity-100 p-1 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded"
              >
                  <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
             <DialogDescription>
                Customize layout and style.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="space-y-2">
                <Label>Style</Label>
                <Select
                    value={tempStyle}
                    onValueChange={(v: any) => setTempStyle(v)}
                >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="accordion">Accordion</SelectItem>
                    <SelectItem value="tabs">Tabs</SelectItem>
                </SelectContent>
                </Select>
            </div>
             <p className="text-sm text-muted-foreground">
                You can add and remove questions directly in the editor.
            </p>
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
