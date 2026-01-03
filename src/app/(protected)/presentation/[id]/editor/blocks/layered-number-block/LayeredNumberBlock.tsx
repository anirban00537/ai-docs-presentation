import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, LayeredNumberContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createLayeredNumberItem } from "../definitions/layered-number-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface LayeredNumberBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const LayeredNumberBlock = memo(function LayeredNumberBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: LayeredNumberBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  const content = block.content as LayeredNumberContent;
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
      items: [...items, createLayeredNumberItem(lastNumber + 1)],
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

      <div 
        className="grid gap-3"
        style={{
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))"
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="relative group/layered p-4 transition-all duration-700 overflow-hidden"
            style={{
              borderRadius: "0px",
              backgroundColor: "transparent",
            }}
          >
            {/* Massive Background Number Indicator */}
            <div 
                className="absolute -right-4 -bottom-10 text-[200px] font-black leading-none pointer-events-none select-none z-0 opacity-[0.03] transition-all duration-1000"
                style={{
                    color: theme.primary,
                    fontFamily: "var(--font-heading)",
                }}
            >
                {String(item.number).padStart(2, '0')}
            </div>

            {/* Remove Button */}
            {!readOnly && (
                <button
                    onClick={() => handleRemoveItem(index)}
                    className="absolute top-6 right-6 z-30 opacity-0 group-hover/layered:opacity-100 transition-all p-2 rounded-full hover:bg-red-500/10 hover:text-red-500 text-gray-400"
                >
                    <IconX size={18} stroke={2.5} />
                </button>
            )}

            <div className="relative z-10 flex flex-col h-full">
              {/* Floating Small Number Input */}
              <div className="mb-2">
                <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm border shadow-lg transition-transform"
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
                        className="bg-transparent text-center w-full h-full outline-none no-spinner font-black"
                        style={{ color: theme.primary }}
                    />
                </div>
              </div>

              {/* Title Section */}
              <div className="mb-1">
                <ProseMirrorEditor
                  key={`${item.id}-title`}
                  blockId={`${item.id}-title`}
                  value={item.title}
                  onChange={(value) => handleItemUpdate(index, "title", value)}
                  placeholder="Core Step"
                  className="text-lg font-black tracking-tight"
                  theme={{
                      ...theme,
                      headingColor: theme.primary,
                  }}
                  readOnly={readOnly}
                />
              </div>

              {/* Description Section */}
              <div className="flex-1">
                <ProseMirrorEditor
                  key={`${item.id}-description`}
                  blockId={`${item.id}-description`}
                  value={item.description}
                  onChange={(value) => handleItemUpdate(index, "description", value)}
                  placeholder="Explain the step..."
                  className="text-base leading-relaxed opacity-70 group-hover/layered:opacity-90 transition-opacity"
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
          className="absolute bottom-10 right-10 h-14 w-14 flex items-center justify-center rounded-2xl shadow-2xl border-2 transition-all hover:scale-110 active:scale-95 z-30 opacity-0 group-hover:opacity-100 duration-500 hover:rotate-6"
          style={{
            background: theme.cardBackground,
            borderColor: theme.primary,
            color: theme.primary,
            boxShadow: `0 10px 30px ${theme.primary}40`,
          }}
        >
          <IconPlus size={28} stroke={3} />
        </button>
      )}
    </div>
  );
});
