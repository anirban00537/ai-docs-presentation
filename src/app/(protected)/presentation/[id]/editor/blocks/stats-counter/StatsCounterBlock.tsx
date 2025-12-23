import React, { useEffect, useState, useCallback, useRef, memo, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
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
import { EmojiPickerTrigger } from "../../ui/LazyEmojiPicker";
import { CommonCard } from "../CommonCard";

interface StatsCounterBlockProps {
  block: Block;
  onUpdate: (content: StatsCounterContent) => void;
  theme: Theme;
  placeholder?: string;
  readOnly?: boolean;
}

/**
 * Custom hook for animating numbers using requestAnimationFrame
 * Uses a single animation loop for all values instead of multiple setIntervals
 */
function useAnimatedValues(targetValues: number[], duration: number = 2000): number[] {
  const [animatedValues, setAnimatedValues] = useState<number[]>(() => 
    targetValues.map(() => 0)
  );
  const startTimeRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const prevTargetValuesRef = useRef<number[]>(targetValues);

  useEffect(() => {
    // Reset animation if target values changed
    const targetsChanged = targetValues.length !== prevTargetValuesRef.current.length ||
      targetValues.some((v, i) => v !== prevTargetValuesRef.current[i]);
    
    if (targetsChanged) {
      prevTargetValuesRef.current = targetValues;
      startTimeRef.current = null;
    }

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation (ease-out cubic)
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const newValues = targetValues.map((target) => 
        Math.round(target * easedProgress)
      );

      setAnimatedValues(newValues);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [targetValues, duration]);

  return animatedValues;
}

/**
 * Memoized stat item component to prevent unnecessary re-renders
 */
const StatItem = memo(function StatItem({
  stat,
  index,
  blockId,
  theme,
  animatedValue,
  onLabelChange,
  onIconChange,
  readOnly,
}: {
  stat: { value: number; label: ProseMirrorDocument; icon?: string; prefix?: string; suffix?: string; color?: string };
  index: number;
  blockId: string;
  theme: Theme;
  animatedValue: number;
  onLabelChange: (index: number, newContent: ProseMirrorDocument) => void;
  onIconChange: (index: number, emoji: string) => void;
  readOnly?: boolean;
}) {
  return (
    <CommonCard 
      theme={theme} 
      className="flex-1 min-w-[200px] transition-all duration-300 hover:shadow-xl group/stat overflow-hidden"
    >
      <div 
        className="p-10 relative flex flex-col items-center gap-4 transition-all"
        style={{ borderRadius: theme.cardBorderRadius ?? "12px" }}
      >
        {/* Minimal Gradient Background Blob */}
        <div
          className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-[0.04] blur-2xl pointer-events-none transition-transform duration-700 ease-out group-hover/stat:scale-150"
          style={{ backgroundColor: theme.primary }}
        />

        {/* Icon */}
        <div className="mb-2 relative z-20">
          <EmojiPickerTrigger
            icon={stat.icon || "📊"}
            onEmojiSelect={(emoji) => onIconChange(index, emoji)}
            disabled={readOnly}
            size="lg"
            className="w-16 h-16 rounded-2xl text-4xl shadow-sm border flex items-center justify-center transition-all group-hover/stat:scale-110 group-hover/stat:rotate-3"
            style={{ 
              backgroundColor: `${theme.primary}10`,
              borderColor: `${theme.primary}20`,
              backdropFilter: "blur(8px)"
            }}
            title="Change icon"
          />
        </div>

        {/* Value */}
        <div
          className="text-4xl font-black transition-colors tracking-tighter"
          style={{ color: stat.color || theme.primary }}
        >
          {stat.prefix}
          {animatedValue.toLocaleString()}
          {stat.suffix}
        </div>

        {/* Label */}
        <div className="min-h-[1.5rem] w-full">
          <ProseMirrorEditor
            key={`${blockId}-label-${index}`}
            blockId={`${blockId}-label-${index}`}
            value={stat.label}
            onChange={(newContent) => onLabelChange(index, newContent)}
            placeholder="Label"
            className="text-center text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 group-hover/stat:opacity-100 transition-opacity"
            theme={theme}
            readOnly={readOnly}
          />
        </div>
      </div>
    </CommonCard>
  );
});

export const StatsCounterBlock = memo(function StatsCounterBlock({
  block,
  onUpdate,
  theme,
  readOnly = false,
}: StatsCounterBlockProps) {
  const content =
    (block.content as StatsCounterContent) ?? createStatsCounterContent();
  const { stats, layout, columns = 2 } = content;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [tempLayout, setTempLayout] = useState<"horizontal" | "vertical" | "grid">(layout);
  const [tempColumns, setTempColumns] = useState(columns.toString());
  const isDark = theme.themeType === "dark";

  // Extract target values for animation
  const targetValues = useMemo(() => stats.map(s => s.value), [stats]);
  const animatedValues = useAnimatedValues(targetValues);

  const handleLabelChange = useCallback(
    (index: number, newContent: ProseMirrorDocument) => {
      const newStats = [...stats];
      newStats[index] = { ...newStats[index], label: newContent };
      onUpdate({ ...content, stats: newStats });
    },
    [stats, content, onUpdate]
  );

  const handleIconChange = useCallback(
    (index: number, emoji: string) => {
      const newStats = [...stats];
      newStats[index] = { ...newStats[index], icon: emoji };
      onUpdate({ ...content, stats: newStats });
    },
    [stats, content, onUpdate]
  );

  const handleOpenEdit = useCallback(() => {
    setTempLayout(layout);
    setTempColumns(columns.toString());
    setIsEditOpen(true);
  }, [layout, columns]);

  const handleSave = useCallback(() => {
    onUpdate({
      ...content,
      layout: tempLayout,
      columns: parseInt(tempColumns) as 2 | 3 | 4,
    });
    setIsEditOpen(false);
  }, [content, onUpdate, tempLayout, tempColumns]);

  const addStat = useCallback(() => {
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
  }, [content, stats, onUpdate]);

  const removeStat = useCallback((index: number) => {
    const newStats = stats.filter((_, i) => i !== index);
    onUpdate({ ...content, stats: newStats });
  }, [content, stats, onUpdate]);

  const updateStatField = useCallback((index: number, field: string, value: string | number) => {
    const newStats = [...stats];
    newStats[index] = { ...newStats[index], [field]: value };
    onUpdate({ ...content, stats: newStats });
  }, [content, stats, onUpdate]);

  const gridClass = useMemo(() => {
    if (layout === "grid") {
      const colClass = columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-3" : "grid-cols-4";
      return `grid gap-4 ${colClass}`;
    }
    return layout === "vertical" ? "flex flex-col gap-4" : "flex flex-row gap-4 flex-wrap";
  }, [layout, columns]);

  return (
    <BlockWrapper onEdit={readOnly ? undefined : handleOpenEdit} onAdd={readOnly ? undefined : addStat} theme={theme}>
      <div className={`${gridClass} w-full`}>
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            stat={stat}
            index={index}
            blockId={block.id}
            theme={theme}
            animatedValue={animatedValues[index] ?? 0}
            onLabelChange={handleLabelChange}
            onIconChange={handleIconChange}
            readOnly={readOnly}
          />
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
                  onValueChange={(v: "horizontal" | "vertical" | "grid") => setTempLayout(v)}
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
});
