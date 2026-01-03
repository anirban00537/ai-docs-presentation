import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, CircleStatsContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createCircleStatsItem } from "../definitions/circle-stats-block";
import { IconPlus, IconX } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";

interface CircleStatsBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const CircleStatsBlock = memo(function CircleStatsBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: CircleStatsBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as CircleStatsContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "title" | "description" | "value" | "suffix", value: any) => {
    if (readOnly) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  const handleAddItem = () => {
    if (readOnly) return;
    const newItem = createCircleStatsItem(50);
    onUpdate({
      ...content,
      items: [...items, newItem],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const newItems = items.filter((_, i) => i !== index);
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  // SVG Progress Circle Helper
  const ProgressCircle = ({ value, size = 160, strokeWidth = 12 }: { value: number, size?: number, strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.primary}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
      </div>
    );
  };

  return (
    <div 
      className="group relative w-full h-full min-h-[300px] py-8"
      style={{
        fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      }}
    >
      <style jsx global>{`
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="flex flex-wrap justify-center items-start gap-12 md:gap-16">
        {items.map((item, index) => (
          <div key={item.id} className="relative group/item flex flex-col items-center min-w-[200px] flex-1 text-center">
             
             {/* Progress Circle Container */}
             <div className="relative mb-6">
                <ProgressCircle value={item.value} />
                
                {/* Center Value Input */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto flex items-baseline">
                         <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.value}
                            onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val)) val = 0;
                                if (val > 100) val = 100;
                                if (val < 0) val = 0;
                                handleItemUpdate(index, "value", val);
                            }}
                            className="w-20 text-center bg-transparent border-none outline-none font-bold text-4xl p-0 no-spinner"
                            style={{ color: theme.headingColor || (isDark ? "#fff" : "#000") }}
                         />
                    </div>
                </div>

                {/* Remove Button */}
                {!readOnly && (
                    <button
                        onClick={() => handleRemoveItem(index)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 rounded-full bg-red-100 text-red-500 hover:bg-red-500 hover:text-white shadow-sm"
                    >
                        <IconX size={14} />
                    </button>
                )}
             </div>

             {/* Title */}
             <div className="mb-2 w-full">
                <ProseMirrorEditor
                    key={`${item.id}-title`}
                    blockId={`${item.id}-title`}
                    value={item.title}
                    onChange={(value) => handleItemUpdate(index, "title", value)}
                    placeholder="Stat Title"
                    readOnly={readOnly}
                    theme={{
                        ...theme,
                        headingColor: isDark ? "#fff" : theme.headingColor,
                    }}
                    className="text-xl font-bold tracking-tight text-center"
                />
             </div>

             {/* Description */}
             <div className="w-full">
                <ProseMirrorEditor
                    key={`${item.id}-description`}
                    blockId={`${item.id}-description`}
                    value={item.description}
                    onChange={(value) => handleItemUpdate(index, "description", value)}
                    placeholder="Description"
                    readOnly={readOnly}
                    theme={theme}
                    className="text-sm opacity-70 leading-relaxed text-center"
                />
             </div>
          </div>
        ))}

        {/* Add Button - Top Right Hover */}
        {!readOnly && (
             <div className="absolute top-0 right-0 z-20">
                 <button
                    onClick={handleAddItem}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg bg-neutral-100 dark:bg-neutral-800 opacity-0 group-hover:opacity-100 duration-300"
                    style={{
                        color: theme.primary,
                        boxShadow: isDark ? "0 4px 12px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                    title="Add Statistic"
                >
                    <IconPlus size={20} stroke={2.5} />
                </button>
             </div>
        )}
      </div>
    </div>
  );
});
