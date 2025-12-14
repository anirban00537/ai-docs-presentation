import React, { useEffect, useState, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createStatsCounterContent,
  type StatsCounterContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { createParagraphContent } from "../definitions/common";
import EmojiPicker from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface StatsCounterBlockProps {
  block: Block;
  onUpdate: (content: StatsCounterContent) => void;
  theme: Theme;
  placeholder?: string;
}

export const StatsCounterBlock: React.FC<StatsCounterBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content =
    (block.content as StatsCounterContent) ?? createStatsCounterContent();
  const { stats, layout, columns = 2 } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Local state
  const [tempLayout, setTempLayout] = useState<"horizontal" | "vertical" | "grid">(layout);
  const [tempColumns, setTempColumns] = useState(columns.toString());

  const [animatedValues, setAnimatedValues] = useState<number[]>(
    stats.map(() => 0)
  );

  // Animate numbers on mount or when stats change
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    const intervals: NodeJS.Timeout[] = [];

    stats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const interval = setInterval(() => {
        currentStep++;
        setAnimatedValues((prev) => {
          const newValues = [...prev];
          newValues[index] = Math.min(
            Math.round(increment * currentStep),
            stat.value
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
  }, [stats]);

  const handleLabelChange = useCallback(
    (index: number, newContent: any) => {
      const newStats = [...stats];
      newStats[index] = {
        ...newStats[index],
        label: newContent,
      };
      onUpdate({
        ...content,
        stats: newStats,
      });
    },
    [stats, content, onUpdate]
  );

  const handleOpenEdit = () => {
    setTempLayout(layout);
    setTempColumns(columns.toString());
    setIsEditOpen(true);
  };

  const handleSave = () => {
    onUpdate({
      ...content,
      layout: tempLayout,
      columns: parseInt(tempColumns) as 2 | 3 | 4,
    });
    setIsEditOpen(false);
  };

  const addStat = () => {
    onUpdate({
      ...content,
      stats: [
        ...stats,
        {
          value: 100,
          label: createParagraphContent("New Stat"),
          icon: "🚀",
          prefix: "",
          suffix: "+",
        },
      ],
    });
  };

  const removeStat = (index: number) => {
    const newStats = stats.filter((_, i) => i !== index);
    onUpdate({ ...content, stats: newStats });
  };

  const updateStatField = (index: number, field: string, value: any) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onUpdate({ ...content, stats: newStats });
  };

  const gridClass =
    layout === "grid"
      ? `grid gap-6 ${
          columns === 2
            ? "grid-cols-2"
            : columns === 3
            ? "grid-cols-3"
            : "grid-cols-4"
        }`
      : layout === "vertical"
      ? "flex flex-col gap-6"
      : "flex flex-row gap-6 flex-wrap";

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addStat} theme={theme}>
      <div className={`${gridClass} w-full`}>
        {stats.map((stat, index) => (
          <div
            key={index}
            className="group flex-1 min-w-[200px] flex flex-col items-center gap-3 p-6 rounded-2xl transition-all relative"
            style={{
              backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
              border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
            }}
          >
            <div className="mb-2 relative z-20">
              <Popover>
                <PopoverTrigger asChild>
                  <button 
                    className="text-5xl transition-transform hover:scale-110 duration-300 cursor-pointer outline-none"
                    title="Change icon"
                  >
                    {stat.icon || "📊"}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-none bg-transparent">
                  <EmojiPicker onEmojiClick={(emoji) => updateStatField(index, "icon", emoji.emoji)} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="text-center w-full">
              <div
                className="text-5xl font-bold mb-3 transition-colors"
                style={{ color: stat.color || theme.primary }}
              >
                {stat.prefix}
                {animatedValues[index]?.toLocaleString()}
                {stat.suffix}
              </div>
              <div className="min-h-[2rem]">
                <ProseMirrorEditor
                  key={`${block.id}-label-${index}`}
                  blockId={`${block.id}-label-${index}`}
                  value={stat.label}
                  onChange={(newContent) => handleLabelChange(index, newContent)}
                  placeholder="Label"
                  className="text-center text-sm font-medium"
                />
              </div>
            </div>
             {/* Delete overlay? Could be annoying. Keep explicit in modal. */}
          </div>
        ))}
      </div>

       <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Stats Counter</DialogTitle>
             <DialogDescription>
                Customize layout and statistics.
              </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
             <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                    <Label>Layout Mode</Label>
                    <Select
                        value={tempLayout}
                        onValueChange={(v: any) => setTempLayout(v)}
                    >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="horizontal">Horizontal</SelectItem>
                        <SelectItem value="vertical">Vertical</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                {tempLayout === 'grid' && (
                    <div className="flex-1 space-y-2">
                         <Label>Columns</Label>
                        <Select value={tempColumns} onValueChange={setTempColumns}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2">2 Columns</SelectItem>
                            <SelectItem value="3">3 Columns</SelectItem>
                            <SelectItem value="4">4 Columns</SelectItem>
                        </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <Label>Statistics</Label>
                {stats.map((stat, index) => (
                    <div key={index} className="flex flex-col gap-3 p-4 border rounded-lg bg-muted/20 relative">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                             <div className="space-y-1">
                                <Label className="text-xs">Value</Label>
                                <Input 
                                    type="number"
                                    value={stat.value}
                                    onChange={(e) => updateStatField(index, "value", parseFloat(e.target.value) || 0)}
                                    className="h-8 text-sm"
                                />
                             </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Prefix</Label>
                                <Input 
                                    value={stat.prefix || ""}
                                    onChange={(e) => updateStatField(index, "prefix", e.target.value)}
                                    className="h-8 text-sm"
                                    placeholder="$"
                                />
                             </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Suffix</Label>
                                <Input 
                                    value={stat.suffix || ""}
                                    onChange={(e) => updateStatField(index, "suffix", e.target.value)}
                                    className="h-8 text-sm"
                                    placeholder="%"
                                />
                             </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Icon (Emoji)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="h-8 w-full text-lg justify-start">
                                            {stat.icon || "🚀"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 border-none shadow-none bg-transparent">
                                        <EmojiPicker onEmojiClick={(emoji) => updateStatField(index, "icon", emoji.emoji)} />
                                    </PopoverContent>
                                </Popover>
                             </div>
                         </div>
                         <div className="flex items-center gap-2">
                             <Label className="text-xs w-16">Color</Label>
                              <div 
                                className="w-6 h-6 rounded border shadow-sm"
                                style={{ backgroundColor: stat.color || theme.primary }}
                                />
                                <Input 
                                value={stat.color || ""}
                                onChange={(e) => updateStatField(index, "color", e.target.value)}
                                className="h-8 text-sm flex-1"
                                placeholder="#hex"
                            />
                         </div>
                         <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeStat(index)}
                             className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-500"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                ))}
                 <Button variant="outline" size="sm" onClick={addStat} className="w-full border-dashed">
                    <Plus className="w-4 h-4 mr-2" /> Add Stat
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
