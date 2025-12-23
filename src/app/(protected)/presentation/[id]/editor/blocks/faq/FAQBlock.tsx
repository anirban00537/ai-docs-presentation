import React, { useState, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import { createFAQContent, type FAQContent } from "../definitions";
import { IconChevronDown, IconTrash, IconPlus } from "@tabler/icons-react";
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
import { Label } from "@/components/ui/label";

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
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const FAQBlock: React.FC<FAQBlockProps> = ({
  block,
  onUpdate,
  theme,
  readOnly = false,
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
          question: "New Question",
          answer: "New Answer",
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
    <BlockWrapper
      onEdit={!readOnly ? handleOpenEdit : undefined}
      onAdd={!readOnly ? addItem : undefined}
      theme={theme}
      readOnly={readOnly}
    >
      <div className="w-full flex flex-col gap-4">
        {items.map((item, index) => {
          const isExpanded = expandedItems[index];
          return (
            <CommonCard
              key={index}
              theme={theme}
              className="overflow-hidden relative group/item transition-all duration-300 hover:shadow-md"
            >
              <div 
                className="relative overflow-hidden" 
                style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
              >
                {/* Minimal Gradient Background Blob */}
                <div
                  className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.03] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover:scale-150"
                  style={{ backgroundColor: theme.primary }}
                />

                {/* Question header */}
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-8 py-6 flex items-center justify-between gap-6 text-left transition-all relative z-10"
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
                      className="font-bold text-lg tracking-tight leading-tight"
                      theme={theme}
                      readOnly={readOnly}
                    />
                  </div>
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-sm transition-colors"
                    style={{ 
                      color: theme.primary,
                      backgroundColor: isExpanded ? `${theme.primary}15` : `${theme.primary}05`,
                      borderColor: isExpanded ? `${theme.primary}25` : `${theme.primary}10`,
                      backdropFilter: "blur(4px)"
                    }}
                  >
                    <IconChevronDown size={20} strokeWidth={2.5} />
                  </motion.div>
                </button>

                {/* Answer content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "circOut" }}
                      className="overflow-hidden relative z-10"
                    >
                      <div
                        className="px-8 pb-8 pt-2"
                        style={{ color: theme.bodyColor }}
                      >
                        <div className="w-12 h-0.5 rounded-full mb-6" style={{ backgroundColor: theme.primary, opacity: 0.2 }} />
                        <ProseMirrorEditor
                          key={`${block.id}-answer-${index}`}
                          blockId={`${block.id}-answer-${index}`}
                          value={item.answer}
                          onChange={(newContent) =>
                            handleAnswerChange(index, newContent)
                          }
                          placeholder="Answer..."
                          className="text-base opacity-70 leading-relaxed tracking-normal"
                          theme={theme}
                          readOnly={readOnly}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Delete button */}
                {!readOnly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeItem(index);
                    }}
                    className="absolute top-4 right-20 z-20 opacity-0 group-hover/item:opacity-100 p-2 rounded-xl transition-all hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                  >
                    <IconTrash size={16} />
                  </button>
                )}
              </div>
            </CommonCard>
          );
        })}
      </div>

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
              FAQ Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Customize layout and style.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>Style</Label>
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
