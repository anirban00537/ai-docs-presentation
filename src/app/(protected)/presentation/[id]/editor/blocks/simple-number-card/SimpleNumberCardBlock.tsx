import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, SimpleNumberCardContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createSimpleNumberCardItem } from "../definitions/simple-number-card";
import { IconPlus, IconX } from "@tabler/icons-react";

interface SimpleNumberCardBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const SimpleNumberCardBlock = memo(function SimpleNumberCardBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: SimpleNumberCardBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as SimpleNumberCardContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "number" | "title" | "description", value: any) => {
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
    const lastNumber = items.length > 0 ? items[items.length - 1].number : 0;
    onUpdate({
      ...content,
      items: [...items, createSimpleNumberCardItem(lastNumber + 1)],
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

  return (
    <div className="group relative w-full h-full min-h-[250px] p-4">
        <style dangerouslySetInnerHTML={{ __html: `
          .no-spinner::-webkit-outer-spin-button,
          .no-spinner::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          .no-spinner {
            -moz-appearance: textfield;
          }
        `}} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group/num-card p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
            style={{
              borderRadius: "20px",
              backgroundColor: theme.cardBackground,
            }}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] group-hover/num-card:opacity-[0.08] transition-opacity duration-1000"
                 style={{ background: `radial-gradient(circle at top right, ${theme.primary}, transparent)` }} />

            {/* Remove Button */}
            {!readOnly && (
                <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-4 right-4 z-30 opacity-0 group-hover/num-card:opacity-100 transition-all p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 text-gray-400"
                >
                    <IconX size={16} stroke={2.5} />
                </button>
            )}

            <div className="relative z-10">
              {/* Number Badge with Outer Ring */}
              <div className="mb-6 inline-flex p-1 rounded-2xl border" 
                   style={{ borderColor: `${theme.primary}20`, background: `${theme.primary}05` }}>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-inner border transition-transform group-hover/num-card:scale-105"
                  style={{
                    backgroundColor: theme.cardBackground,
                    borderColor: `${theme.primary}40`,
                    color: theme.primary,
                  }}
                >
                  <input
                    type="number"
                    value={item.number}
                    onChange={(e) => handleItemUpdate(index, "number", parseInt(e.target.value, 10) || 0)}
                    disabled={readOnly}
                    className="no-spinner bg-transparent border-none outline-none text-center w-full font-black selection:bg-primary/20"
                    style={{ color: theme.primary }}
                  />
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-3">
                <ProseMirrorEditor
                  key={`${item.id}-title`}
                  blockId={`${item.id}-title`}
                  value={item.title}
                  onChange={(value) => handleItemUpdate(index, "title", value)}
                  placeholder="Point Title"
                  className="text-xl font-bold tracking-tight opacity-90 group-hover/num-card:opacity-100 transition-opacity"
                  theme={{
                      ...theme,
                      headingColor: theme.primary,
                  }}
                  readOnly={readOnly}
                />
              </div>

              {/* Description Section */}
              <div className="">
                <ProseMirrorEditor
                  key={`${item.id}-description`}
                  blockId={`${item.id}-description`}
                  value={item.description}
                  onChange={(value) => handleItemUpdate(index, "description", value)}
                  placeholder="Details..."
                  className="text-sm leading-relaxed opacity-60 group-hover/num-card:opacity-80 transition-opacity"
                  theme={theme}
                  readOnly={readOnly}
                />
              </div>
            </div>

            {/* Bottom Glow Accent */}
            <div
                className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover/num-card:opacity-100 transition-all duration-700"
                style={{ background: `linear-gradient(to right, ${theme.primary}00, ${theme.primary}, ${theme.primary}00)` }}
            />
          </div>
        ))}
      </div>

      {/* Float Add Button */}
      {!readOnly && (
        <button
          onClick={handleAddItem}
          className="absolute bottom-10 right-10 h-12 w-12 flex items-center justify-center rounded-full shadow-2xl border-2 transition-all hover:scale-110 active:scale-95 z-30 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 duration-500"
          style={{
            background: theme.cardBackground,
            borderColor: theme.primary,
            color: theme.primary,
            boxShadow: `0 0 30px ${theme.primary}30`,
          }}
        >
          <IconPlus size={24} stroke={3} />
        </button>
      )}
    </div>
  );
});
