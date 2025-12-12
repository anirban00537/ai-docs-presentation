import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createProgressBarContent,
  type ProgressBarContent,
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
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Palette } from "lucide-react";
import { createParagraphContent } from "../definitions/common";

interface ProgressBarBlockProps {
  block: Block;
  onUpdate: (content: ProgressBarContent) => void;
  theme: Theme;
  placeholder?: string;
}

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
      newItems[index] = {
        ...newItems[index],
        label: newContent,
      };
      onUpdate({
        ...content,
        items: newItems,
      });
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
      <div className="w-full flex flex-col gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="group"
            style={{
              backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
              backdropFilter: "blur(12px)",
              padding: "1.5rem",
              borderRadius: "1rem",
              border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
              boxShadow: `0 2px 8px -2px ${withAlpha(theme.primary, 0.05)}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1 min-w-0 mr-4">
                <ProseMirrorEditor
                  key={`${block.id}-label-${index}`}
                  blockId={`${block.id}-label-${index}`}
                  value={item.label}
                  onChange={(newContent) => handleLabelChange(index, newContent)}
                  placeholder="Label"
                  className="font-semibold text-sm"
                />
              </div>
              {showPercentage && (
                <div
                  className="text-lg font-bold shrink-0"
                  style={{ color: item.color || theme.primary }}
                >
                  {animatedValues[index]}%
                </div>
              )}
            </div>
            <div
              className="w-full h-3 rounded-full overflow-hidden relative"
              style={{
                backgroundColor: withAlpha(theme.primary, 0.1),
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                style={{
                  width: `${animatedValues[index]}%`,
                  backgroundColor: item.color || theme.primary,
                  boxShadow: `0 0 10px ${withAlpha(
                    item.color || theme.primary,
                    0.5
                  )}`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: "shimmer 2s infinite",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        <style jsx>{`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}</style>
      </div>

       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Progress Bars</DialogTitle>
             <DialogDescription>
                Customize items and animations.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <Switch
                        id="percentage-mode"
                        checked={tempShowPercentage}
                        onCheckedChange={setTempShowPercentage}
                    />
                    <Label htmlFor="percentage-mode">Show %</Label>
                </div>
                 <div className="flex items-center gap-2">
                    <Switch
                        id="animate-mode"
                        checked={tempAnimated}
                        onCheckedChange={setTempAnimated}
                    />
                    <Label htmlFor="animate-mode">Animated</Label>
                </div>
            </div>

            <div className="space-y-4">
                <Label>Items Configuration</Label>
                {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                         <div className="flex-1 grid grid-cols-2 gap-2">
                             <div className="space-y-1">
                                <Label className="text-xs">Value (0-100)</Label>
                                <Input 
                                    type="number" min="0" max="100"
                                    value={item.value}
                                    onChange={(e) => updateItemValue(index, e.target.value)}
                                    className="h-8 text-sm"
                                />
                             </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Color</Label>
                                <div className="flex gap-2">
                                     <div 
                                        className="w-8 h-8 rounded border shadow-sm"
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
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                             className="h-8 w-8 mt-4 text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addItem} className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
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
