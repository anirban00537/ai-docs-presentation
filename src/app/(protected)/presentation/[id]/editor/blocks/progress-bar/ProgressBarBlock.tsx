import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/lib/editor/types";
import {
  createProgressBarContent,
  type ProgressBarContent,
} from "../definitions";
import { withAlpha } from "../utils";

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

  return (
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
  );
};
