import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createStatsCounterContent,
  type StatsCounterContent,
} from "../definitions";
import { withAlpha } from "../utils";

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

  const [animatedValues, setAnimatedValues] = useState<number[]>(
    stats.map(() => 0)
  );

  // Animate numbers on mount
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
    <div className={`${gridClass} w-full`}>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="group flex flex-col items-center gap-3 p-6 rounded-2xl transition-all hover:scale-105 hover:shadow-lg duration-300"
          style={{
            backgroundColor: withAlpha(theme.cardBackground || "#ffffff", 0.75),
            backdropFilter: "blur(12px)",
            border: `1px solid ${withAlpha(theme.primary, 0.15)}`,
            boxShadow: `0 4px 12px -2px ${withAlpha(theme.primary, 0.05)}`,
          }}
        >
          {stat.icon && (
            <div className="text-5xl mb-2 transition-transform group-hover:scale-110 duration-300">
              {stat.icon}
            </div>
          )}
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
        </div>
      ))}
    </div>
  );
};
