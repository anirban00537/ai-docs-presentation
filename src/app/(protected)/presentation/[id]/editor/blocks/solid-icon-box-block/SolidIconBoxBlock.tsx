import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, SolidIconBoxContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createSolidIconBoxItem } from "../definitions/solid-icon-box-block";
import { IconPlus, IconX } from "@tabler/icons-react";
import { UniversalIconPicker } from "../../ui/UniversalIconPicker";

interface SolidIconBoxBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const SolidIconBoxBlock = memo(function SolidIconBoxBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: SolidIconBoxBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as SolidIconBoxContent;
  const items = content.items || [];

  const handleItemUpdate = (index: number, field: "icon" | "title" | "description", value: any) => {
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
      items: [...items, createSolidIconBoxItem()],
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
    <div className="group relative w-full h-full min-h-[220px] p-4">
      <div 
        className="grid gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group/icon-card p-5 transition-all duration-500 overflow-hidden"
            style={{
              borderRadius: "20px",
              backgroundColor: theme.cardBackground,
            }}
          >
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03] transition-opacity duration-1000"
                 style={{ background: `radial-gradient(circle at top right, ${theme.primary}, transparent)` }} />

            {/* Remove Button */}
            {!readOnly && (
                <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-4 right-4 z-30 opacity-0 group-hover/icon-card:opacity-100 transition-all p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 text-gray-400"
                >
                    <IconX size={16} stroke={2.5} />
                </button>
            )}

            <div className="relative z-10">
              {/* Icon Container */}
              <div className="mb-6 inline-flex p-3 rounded-2xl" 
                   style={{ backgroundColor: `${theme.primary}10` }}>
                <UniversalIconPicker
                  value={item.icon || "star"}
                  onChange={(newIcon) => handleItemUpdate(index, "icon", newIcon)}
                  theme={theme}
                  disabled={readOnly}
                  size="lg"
                />
              </div>

              {/* Title Section */}
              <div className="mb-3">
                <ProseMirrorEditor
                  key={`${item.id}-title`}
                  blockId={`${item.id}-title`}
                  value={item.title}
                  onChange={(value) => handleItemUpdate(index, "title", value)}
                  placeholder="Feature Title"
                  className="text-base font-bold tracking-tight opacity-90 group-hover/icon-card:opacity-100 transition-opacity"
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
                  className="text-sm leading-relaxed opacity-60 group-hover/icon-card:opacity-80 transition-opacity"
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
