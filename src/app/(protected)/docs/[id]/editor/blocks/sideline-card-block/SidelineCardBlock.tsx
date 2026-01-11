import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, SidelineCardContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createSidelineCardItem } from "../definitions/sideline-card-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface SidelineCardBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const SidelineCardBlock = memo(function SidelineCardBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: SidelineCardBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as SidelineCardContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "title" | "description", value: string) => {
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
      items: [...items, createSidelineCardItem()],
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
    <div className="group relative w-full h-full min-h-[200px] p-4">
      <div 
        className="grid gap-2"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))"
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group/sideline overflow-hidden transition-all duration-700"
            style={{
              borderRadius: "12px",
              backgroundColor: theme.cardBackground,
              boxShadow: "sm",
            }}
          >

            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-700"
              style={{
                backgroundColor: theme.primary,
                opacity: 0.9,
              }}
            />

            {/* Remove Button */}
            {!readOnly && (
                <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-3 right-3 z-30 opacity-0 group-hover/sideline:opacity-100 transition-all p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 text-gray-400"
                >
                    <IconX size={14} stroke={2.5} />
                </button>
            )}

            <div className="p-2 pl-4">
              {/* Title Section */}
              <div className="mb-0.5">
                <ProseMirrorEditor
                  key={`${item.id}-title`}
                  blockId={`${item.id}-title`}
                  value={item.title}
                  onChange={(value) => handleItemUpdate(index, "title", value)}
                  placeholder="Key Point"
                  className="text-base font-bold tracking-tight"
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
                  placeholder="Add details..."
                  className="text-sm leading-relaxed opacity-70 group-hover/sideline:opacity-90 transition-opacity"
                  theme={theme}
                  readOnly={readOnly}
                />
              </div>
            </div>


          </div>
        ))}
      </div>

      {/* Float Add Button */}
      {!readOnly && (
        <button
          onClick={handleAddItem}
          className="absolute bottom-6 right-6 h-10 w-10 flex items-center justify-center rounded-full shadow-lg border transition-all hover:scale-110 active:scale-95 z-30 opacity-0 group-hover:opacity-100 duration-300"
          style={{
            background: theme.cardBackground,
            borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
            color: theme.primary,
            boxShadow: `0 0 20px ${theme.primary}20`,
          }}
        >
          <IconPlus size={20} stroke={2.5} />
        </button>
      )}
    </div>
  );
});
