import React, { useEffect, useState, useCallback } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
  createStatsCounterContent,
  type StatsCounterContent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconTrash, IconPlus } from "@tabler/icons-react";

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
  readOnly?: boolean;
}

import { CommonCard } from "../CommonCard";

export const StatsCounterBlock: React.FC<StatsCounterBlockProps> = ({
  block,
  onUpdate,
  theme,
}) => {
  const content =
    (block.content as StatsCounterContent) ?? createStatsCounterContent();
  const { stats, layout, columns = 2 } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempLayout, setTempLayout] = useState<
    "horizontal" | "vertical" | "grid"
  >(layout);
  const [tempColumns, setTempColumns] = useState(columns.toString());
  const isDark = theme.themeType === "dark";

  const [animatedValues, setAnimatedValues] = useState<number[]>(
    stats.map(() => 0)
  );

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
      newStats[index] = { ...newStats[index], label: newContent };
      onUpdate({ ...content, stats: newStats });
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
          label: "New Stat",
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
      ? `grid gap-4 ${
          columns === 2
            ? "grid-cols-2"
            : columns === 3
            ? "grid-cols-3"
            : "grid-cols-4"
        }`
      : layout === "vertical"
      ? "flex flex-col gap-4"
      : "flex flex-row gap-4 flex-wrap";

  return (
    <BlockWrapper onEdit={handleOpenEdit} onAdd={addStat} theme={theme}>
      <div className={`${gridClass} w-full`}>
        {stats.map((stat, index) => (
          <CommonCard
            key={index}
            theme={theme}
            className="flex-1 min-w-[160px] p-5"
          >
            <div className="group flex flex-col items-center gap-2 relative transition-all">
              {/* Icon */}
              <div className="mb-1 relative z-20">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="text-3xl transition-all hover:scale-110 cursor-pointer outline-none"
                      title="Change icon"
                    >
                      {stat.icon || "📊"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 border-none shadow-xl">
                    <EmojiPicker
                      onEmojiClick={(emoji) =>
                        updateStatField(index, "icon", emoji.emoji)
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Value */}
              <div
                className="text-3xl font-bold transition-colors"
                style={{ color: stat.color || theme.primary }}
              >
                {stat.prefix}
                {animatedValues[index]?.toLocaleString()}
                {stat.suffix}
              </div>

              {/* Label */}
              <div className="min-h-[1.5rem] w-full">
                <ProseMirrorEditor
                  key={`${block.id}-label-${index}`}
                  blockId={`${block.id}-label-${index}`}
                  value={stat.label}
                  onChange={(newContent) =>
                    handleLabelChange(index, newContent)
                  }
                  placeholder="Label"
                  className="text-center text-xs font-medium opacity-60"
                  theme={theme}
                />
              </div>
            </div>
          </CommonCard>
        ))}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent
          className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
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
              Stats Counter Settings
            </DialogTitle>
            <DialogDescription
              style={{
                color: isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
              }}
            >
              Customize layout and statistics.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label style={{ color: isDark ? "#fff" : "#000" }}>
                  Layout
                </Label>
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
              {tempLayout === "grid" && (
                <div className="flex-1 space-y-2">
                  <Label style={{ color: isDark ? "#fff" : "#000" }}>
                    Columns
                  </Label>
                  <Select value={tempColumns} onValueChange={setTempColumns}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label style={{ color: isDark ? "#fff" : "#000" }}>
                Statistics
              </Label>
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-2 p-3 rounded-lg relative"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.03)",
                  }}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="space-y-1">
                      <Label
                        className="text-xs"
                        style={{ color: isDark ? "#aaa" : "#666" }}
                      >
                        Value
                      </Label>
                      <Input
                        type="number"
                        value={stat.value}
                        onChange={(e) =>
                          updateStatField(
                            index,
                            "value",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        className="text-xs"
                        style={{ color: isDark ? "#aaa" : "#666" }}
                      >
                        Prefix
                      </Label>
                      <Input
                        value={stat.prefix || ""}
                        onChange={(e) =>
                          updateStatField(index, "prefix", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="$"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        className="text-xs"
                        style={{ color: isDark ? "#aaa" : "#666" }}
                      >
                        Suffix
                      </Label>
                      <Input
                        value={stat.suffix || ""}
                        onChange={(e) =>
                          updateStatField(index, "suffix", e.target.value)
                        }
                        className="h-8 text-sm"
                        placeholder="%"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        className="text-xs"
                        style={{ color: isDark ? "#aaa" : "#666" }}
                      >
                        Color
                      </Label>
                      <div className="flex gap-1">
                        <div
                          className="w-8 h-8 rounded-lg shrink-0"
                          style={{
                            backgroundColor: stat.color || theme.primary,
                          }}
                        />
                        <Input
                          value={stat.color || ""}
                          onChange={(e) =>
                            updateStatField(index, "color", e.target.value)
                          }
                          className="h-8 text-sm"
                          placeholder="#hex"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeStat(index)}
                    className="absolute top-2 right-2 p-1 rounded-lg transition-all hover:bg-red-500/10"
                    style={{ color: "#ef4444" }}
                  >
                    <IconTrash size={12} />
                  </button>
                </div>
              ))}
              <button
                onClick={addStat}
                className="w-full p-2 rounded-lg border border-dashed flex items-center justify-center gap-2 text-sm transition-all"
                style={{
                  borderColor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.1)",
                  color: isDark ? "#aaa" : "#666",
                }}
              >
                <IconPlus size={14} />
                Add Stat
              </button>
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
