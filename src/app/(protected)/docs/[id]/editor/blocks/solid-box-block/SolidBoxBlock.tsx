import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, SolidBoxContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createSolidBoxItem } from "../definitions/solid-box-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface SolidBoxBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const SolidBoxBlock = memo(function SolidBoxBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: SolidBoxBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as SolidBoxContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "title" | "description", value: any) => {
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
    onUpdate({
      ...content,
      items: [...items, createSolidBoxItem()],
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
    <div className="group relative w-full h-full min-h-[220px] p-3">
      <div 
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group/box-card p-3 transition-all duration-500 overflow-hidden"
            style={{
              borderRadius: "20px",
              backgroundColor: theme.cardBackground,
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] transition-opacity duration-1000"
                 style={{ background: `radial-gradient(circle at top right, ${theme.primary}, transparent)` }} />

            {/* Remove Button */}
            {!readOnly && (
                <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-4 right-4 z-30 opacity-0 group-hover/box-card:opacity-100 transition-all p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 text-gray-400"
                >
                    <IconX size={16} stroke={2.5} />
                </button>
            )}

            <div className="relative z-10">
              {/* Title Section */}
              <div className="mb-0.5">
                <ProseMirrorEditor
                  key={`${item.id}-title`}
                  blockId={`${item.id}-title`}
                  value={item.title}
                  onChange={(value) => handleItemUpdate(index, "title", value)}
                  placeholder="Focus Title"
                  className="text-base font-bold tracking-tight opacity-90 group-hover/box-card:opacity-100 transition-opacity"
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
                  className="text-sm leading-relaxed opacity-60 group-hover/box-card:opacity-80 transition-opacity"
                  theme={theme}
                  readOnly={readOnly}
                />
              </div>
            </div>

            <div
                className="absolute bottom-0 left-0 w-full h-1 opacity-0 transition-all duration-700"
                style={{ background: `linear-gradient(to right, ${theme.primary}00, ${theme.primary}, ${theme.primary}00)` }}
            />
          </div>
        ))}
      </div>

      {/* Float Add Button */}
      {!readOnly && (
        <button
          onClick={handleAddItem}
          className="absolute bottom-10 right-10 h-12 w-12 flex items-center justify-center rounded-full transition-all hover:scale-110 active:scale-95 z-30 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-500"
          style={{
            background: theme.cardBackground,
            color: theme.primary,
          }}
        >
          <IconPlus size={24} stroke={3} />
        </button>
      )}
    </div>
  );
});
