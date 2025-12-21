import React, { useEffect, useState, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
  createProgressBarContent,
  type ProgressBarContent,
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
import { Switch } from "@/components/ui/switch";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { createParagraphContent } from "@/types/presentation";

interface ProgressBarBlockProps {
  block: Block;
  onUpdate: (content: ProgressBarContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const ProgressBarBlock: React.FC<ProgressBarBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content =
    (block.content as ProgressBarContent) ?? createProgressBarContent();
  const { items, showPercentage, animated } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempShowPercentage, setTempShowPercentage] = useState(showPercentage);
  const [tempAnimated, setTempAnimated] = useState(animated);
  const isDark = theme.themeType === "dark";

  const [animatedValues, setAnimatedValues] = useState<number[]>(
    items.map(() => 0)
  );

  useEffect(() => {
    if (!animated) {
      setAnimatedValues(items.map((item) => item.value));
      return;
    }

    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    const intervals: NodeJS.Timeout[] = [];

    items.forEach((item, index) => {
      let currentStep = 0;
      const increment = item.value / steps;

      const interval = setInterval(() => {
        currentStep++;
        setAnimatedValues((prev) => {
          const newValues = [...prev];
          newValues[index] = Math.min(
            Math.round(increment * currentStep),
            item.value
          );
          return newValues;
        });

        if (currentStep >= steps) {
          clearInterval(interval);
        }
      }, stepDuration);

      intervals.push(interval);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [items, animated]);

  const handleLabelChange = useCallback(
    (index: number, newContent: any) => {
      const newItems = [...items];
      newItems[index] = { ...newItems[index], label: newContent };
      onUpdate({ ...content, items: newItems });
    },
    [items, content, onUpdate]
  );

  const handleOpenEdit = () => {
    setTempShowPercentage(showPercentage);
    setTempAnimated(animated);
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      showPercentage: tempShowPercentage,
      animated: tempAnimated,
    });
    setIsEditOpen(false);
  };

  const addItem = () => {
    onUpdate({
      ...content,
      items: [
        ...items,
        {
          label: createParagraphContent("New Skill"),
          value: 50,
          color: theme.primary,
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onUpdate({ ...content, items: newItems });
  };

  const updateItemValue = (index: number, value: string) => {
    const val = Math.min(100, Math.max(0, parseInt(value) || 0));
    const newItems = [...items];
    newItems[index] = { ...newItems[index], value: val };
    onUpdate({ ...content, items: newItems });
  };

  const updateItemColor = (index: number, color: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], color };
    onUpdate({ ...content, items: newItems });
  };

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addItem} theme={theme}>
      <div className="w-full flex flex-col gap-4">
        {items.map((item, index) => (
          <CommonCard
            key={index}
            theme={theme}
            className="group p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1 min-w-0 mr-4">
                <ProseMirrorEditor
                  key={`${block.id}-label-${index}`}
                  blockId={`${block.id}-label-${index}`}
                  value={item.label}
                  onChange={(newContent) => handleLabelChange(index, newContent)}
                  placeholder="Label"
                  className="font-medium text-sm"
                  theme={theme}
                />
              </div>
              {showPercentage && (
                <div
                  className="text-sm font-semibold shrink-0"
                  style={{ color: item.color || theme.primary }}
                >
                  {animatedValues[index]}%
                </div>
              )}
            </div>
            <div
              className="w-full h-1.5 rounded-full overflow-hidden"
              style={{
                backgroundColor: `${theme.primary}15`,
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${animatedValues[index]}%`,
                  backgroundColor: item.color || theme.primary,
                }}
              />
            </div>
          </CommonCard>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[450px] max-h-[80vh] overflow-y-auto"
          style={{
            backgroundColor: isDark ? "rgba(20,20,24,0.98)" : "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            border: "none",
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ color: isDark ? "#fff" : "#000" }}>
              Progress Bar Settings
            </DialogTitle>
            <DialogDescription style={{ color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)" }}>
              Customize items and animations.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="percentage-mode"
                  checked={tempShowPercentage}
                  onCheckedChange={setTempShowPercentage}
                />
                <Label htmlFor="percentage-mode" style={{ color: isDark ? "#fff" : "#000" }}>
                  Show %
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="animate-mode"
                  checked={tempAnimated}
                  onCheckedChange={setTempAnimated}
                />
                <Label htmlFor="animate-mode" style={{ color: isDark ? "#fff" : "#000" }}>
                  Animated
                </Label>
              </div>
            </div>

            <div className="space-y-3">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>Items</Label>
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                >
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>
                        Value
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={item.value}
                        onChange={(e) => updateItemValue(index, e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" style={{ color: isDark ? "#aaa" : "#666" }}>
                        Color
                      </Label>
                      <div className="flex gap-2">
                        <div
                          className="w-8 h-8 rounded-lg"
                          style={{ backgroundColor: item.color || theme.primary }}
                        />
                        <Input
                          value={item.color || ""}
                          onChange={(e) => updateItemColor(index, e.target.value)}
                          className="h-8 text-sm flex-1"
                          placeholder="#hex"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                  >
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={addItem}
                className="w-full p-2 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm transition-all"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                  color: isDark ? "#aaa" : "#666",
                }}
              >
                <IconPlus size={14} />
                Add Item
              </button>
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
