import React, { useState, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import { createFAQContent, type FAQContent } from "../definitions";
import { IconChevronDown, IconTrash, IconPlus } from "@tabler/icons-react";
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
import { createParagraphContent } from "../definitions/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

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
  const isDark = theme.themeType === "dark";

  const [expandedItems, setExpandedItems] = useState<boolean[]>(
    items.map((item) => item.expanded ?? false)
  );

  const toggleItem = useCallback(
    (index: number) => {
      const newExpanded = [...expandedItems];
      newExpanded[index] = !newExpanded[index];
      setExpandedItems(newExpanded);

      const newItems = [...items];
      newItems[index] = { ...newItems[index], expanded: newExpanded[index] };
      onUpdate({ ...content, items: newItems });
    },
    [expandedItems, items, content, onUpdate]
  );

  const handleQuestionChange = useCallback(
    (index: number, newContent: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], question: newContent };
      onUpdate({ ...content, items: newItems });
    },
    [items, content, onUpdate]
  );

  const handleAnswerChange = useCallback(
    (index: number, newContent: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], answer: newContent };
      onUpdate({ ...content, items: newItems });
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
    onUpdate({ ...content, style: tempStyle });
    setIsEditOpen(false);
  };

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addItem} theme={theme}>
      <div className="w-full flex flex-col gap-2">
        {items.map((item, index) => {
          const isExpanded = expandedItems[index];
          return (
            <div
              key={index}
              className="rounded-xl overflow-hidden transition-all relative group/item"
              style={{
                backgroundColor: `${theme.primary}08`,
              }}
            >
              {/* Question header */}
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-all hover:opacity-80"
                style={{ color: theme.headingColor }}
              >
                <div className="flex-1 min-w-0">
                  <ProseMirrorEditor
                    key={`${block.id}-question-${index}`}
                    blockId={`${block.id}-question-${index}`}
                    value={item.question}
                    onChange={(newContent) => handleQuestionChange(index, newContent)}
                    placeholder="Question?"
                    className="font-medium text-base"
                  />
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: theme.primary }}
                >
                  <IconChevronDown size={18} />
                </motion.div>
              </button>

              {/* Answer content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="px-5 pb-4"
                      style={{ color: theme.bodyColor }}
                    >
                      <ProseMirrorEditor
                        key={`${block.id}-answer-${index}`}
                        blockId={`${block.id}-answer-${index}`}
                        value={item.answer}
                        onChange={(newContent) => handleAnswerChange(index, newContent)}
                        placeholder="Answer..."
                        className="text-sm opacity-70 leading-relaxed"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeItem(index);
                }}
                className="absolute top-4 right-12 z-10 opacity-0 group-hover/item:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                style={{ color: "#ef4444" }}
              >
                <IconTrash size={14} />
              </button>
            </div>
          );
        })}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[400px]"
          style={{
            backgroundColor: isDark ? "rgba(20,20,24,0.98)" : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
              FAQ Settings
            </DialogTitle>
            <DialogDescription style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
              Customize layout and style.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>Style</Label>
              <Select value={tempStyle} onValueChange={(v: any) => setTempStyle(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accordion">Accordion</SelectItem>
                  <SelectItem value="tabs">Tabs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} style={{ backgroundColor: theme.primary }}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BlockWrapper>
  );
};
