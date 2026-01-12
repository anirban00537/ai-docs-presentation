import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ConnectedStepsContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createConnectedStepItem } from "../definitions/connected-steps-block";
import { IconPlus, IconX } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";

interface ConnectedStepsBlockProps {
  block: Block;
  onUpdate: (content: any) => void;
  theme?: Theme;
  readOnly?: boolean;
}

export const ConnectedStepsBlock = memo(function ConnectedStepsBlock({
  block,
  onUpdate,
  theme: themeProp,
  readOnly = false,
}: ConnectedStepsBlockProps) {
  const reduxTheme = useAppSelector(selectTheme);
  const theme = themeProp || reduxTheme || DEFAULT_THEME;
  const isDark = theme.themeType === "dark";

  // Cast content to our new type
  // Note: We need to ensure the type definition exists in types/presentation.ts or locally extended
  // For now, we assume the content matches the structure we defined.
  const content = block.content as ConnectedStepsContent;
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
    const lastIndex = items.length > 0 ? items.length : 0;
    const newItem = createConnectedStepItem(lastIndex);
    onUpdate({
      ...content,
      items: [...items, newItem],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (readOnly) return;
    const newItems = items.filter((_: any, i: number) => i !== index);
    onUpdate({
      ...content,
      items: newItems,
    });
  };

  return (
    <div 
      className="group relative w-full h-full min-h-[220px] p-3"
      style={{
        fontFamily: getFontFamily(theme.fontFamily || "Inter"),
      }}
    >
      {/* Container for the timeline */}
      <div className="relative w-full mx-auto">
        
        {/* Continuous Vertical Line Background */}
        <div 
            className="absolute left-[20px] top-6 bottom-6 width-px w-0.5 opacity-30"
            style={{ 
                background: theme.primary,
                // Don't show line below the last item?
                // Actually, a continuous line is fine, but maybe we want it to stop at the last item's center.
                // We'll handle line per item or a global one. A global one is easier for "continuous".
            }} 
        />

        {items.map((item: any, index: number) => (
          <div key={item.id} className="relative flex gap-3 mb-3 last:mb-0 group/item">
             {/* Left Column: Number Node */}
             <div className="relative z-10 flex-shrink-0">
                <div 
                    className="w-[40px] h-[40px] rounded-xl flex items-center justify-center text-lg font-bold border shadow-lg transition-transform duration-300 group-hover/item:scale-105"
                    style={{
                        backgroundColor: theme.primary,
                        borderColor: `${theme.primary}40`, // A bit lighter border
                        color: theme.cardBackground, // High contrast text
                        boxShadow: `0 4px 12px ${theme.primary}40`,
                    }}
                >
                    {index + 1}
                </div>
                
                {/* Connector line per item to cover the main line if needed, or effects */}
                {/* For this design, the main absolute line behind is enough. */}
             </div>

             {/* Right Column: Content */}
             <div 
                className="flex-1 pt-1 min-w-0 pb-3 border-b border-dashed border-opacity-20 last:border-none last:pb-0"
                style={{ borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
             >
                <div className="relative">
                    {/* Remove Button */}
                    {!readOnly && (
                        <button
                            onClick={() => handleRemoveItem(index)}
                            className="absolute right-0 top-0 opacity-0 group-hover/item:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-red-500"
                        >
                            <IconX size={16} />
                        </button>
                    )}

                    {/* Title */}
                    <div className="mb-1 pr-8">
                        <ProseMirrorEditor
                            key={`${item.id}-title`}
                            blockId={`${item.id}-title`}
                            value={item.title}
                            onChange={(value) => handleItemUpdate(index, "title", value)}
                            placeholder="Step Title"
                            readOnly={readOnly}
                            theme={{
                                ...theme,
                                headingColor: isDark ? "#fff" : theme.headingColor,
                            }}
                            className="text-2xl font-bold tracking-tight"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <ProseMirrorEditor
                            key={`${item.id}-description`}
                            blockId={`${item.id}-description`}
                            value={item.description}
                            onChange={(value) => handleItemUpdate(index, "description", value)}
                            placeholder="Add details about this step..."
                            readOnly={readOnly}
                            theme={theme}
                            className="text-lg opacity-70 leading-relaxed"
                        />
                    </div>
                </div>
             </div>
          </div>
        ))}
        
        {/* Add Button at the bottom of the line */}
        {!readOnly && (
            <div className="relative flex justify-center mt-8 pl-[18px]"> {/* Align slightly with the timeline center if we want centered line, but here we want it maybe just at the bottom */}
                 {/* Actually, let's put it inline with the vertical line logic */}
                 <div className="absolute left-[20px] -translate-x-1/2 bottom-[-20px] z-20">
                     <button
                        onClick={handleAddItem}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg opacity-0 group-hover:opacity-100 duration-300"
                        style={{
                            backgroundColor: theme.cardBackground,
                            border: `2px solid ${theme.primary}`,
                            color: theme.primary,
                        }}
                    >
                        <IconPlus size={18} stroke={3} />
                    </button>
                 </div>
            </div>
        )}

      </div>
    </div>
  );
});
