import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, LeafBlockContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createLeafItem } from "../definitions/leaf-block";
import { IconPlus, IconX } from "@tabler/icons-react";

interface LeafBlockProps {
    block: Block;
    onUpdate: (content: any) => void;
    theme?: Theme;
    readOnly?: boolean;
}

export const LeafBlock = memo(function LeafBlock({
    block,
    onUpdate,
    theme: themeProp,
    readOnly = false,
}: LeafBlockProps) {
    const reduxTheme = useAppSelector(selectTheme);
    const theme = themeProp || reduxTheme || DEFAULT_THEME;
    const isDark = theme.themeType === "dark";

    const content = block.content as LeafBlockContent;
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
            items: [...items, createLeafItem()],
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
                className="grid gap-3"
                style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))"
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="relative group/leaf p-2 transition-all duration-700 overflow-hidden"
                        style={{
                            borderRadius: "0px 48px 0px 48px",
                            backgroundColor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(255, 255, 255, 0.5)",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        {/* Premium Glow Effect */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 opacity-0 transition-opacity duration-700 pointer-events-none"
                            style={{
                                background: `radial-gradient(circle at 70% 30%, ${theme.primary}, transparent 70%)`,
                                filter: "blur(20px)",
                            }}
                        />

                        {/* Remove Button */}
                        {!readOnly && (
                            <button
                                onClick={() => handleRemoveItem(index)}
                                className="absolute top-4 right-4 z-30 opacity-0 group-hover/leaf:opacity-100 transition-all p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 text-gray-400"
                            >
                                <IconX size={14} stroke={2.5} />
                            </button>
                        )}

                        {/* Animated Accent Line */}
                        <div
                            className="absolute bottom-0 left-0 w-full h-1.5 opacity-30 transition-all duration-500 transform"
                            style={{
                                background: `linear-gradient(to right, ${theme.primary}, transparent)`,
                            }}
                        />

                        {/* Title Section */}
                        <div className=" relative z-10">
                            <ProseMirrorEditor
                                key={`${item.id}-title`}
                                blockId={`${item.id}-title`}
                                value={item.title}
                                onChange={(value) => handleItemUpdate(index, "title", value)}
                                placeholder="Leaf Title"
                                className="text-base font-bold tracking-tight"
                                theme={{
                                    ...theme,
                                    headingColor: theme.primary,
                                }}
                                readOnly={readOnly}
                            />
                        </div>

                        {/* Description Section */}
                        <div className="relative z-10">
                            <ProseMirrorEditor
                                key={`${item.id}-description`}
                                blockId={`${item.id}-description`}
                                value={item.description}
                                onChange={(value) => handleItemUpdate(index, "description", value)}
                                placeholder="Describe this leaf..."
                                className="text-sm leading-relaxed opacity-80"
                                theme={theme}
                                readOnly={readOnly}
                            />
                        </div>

                        {/* Corner Decoration */}
                        <div className="absolute top-4 left-4 w-2 h-2 rounded-full opacity-20" style={{ background: theme.primary }} />
                    </div>
                ))}
            </div>

            {/* Float Add Button - Bottom Right */}
            {!readOnly && (
                <button
                    onClick={handleAddItem}
                    className="absolute bottom-10 right-10 h-10 w-10 flex items-center justify-center rounded-full shadow-2xl border transition-all hover:scale-125 active:scale-95 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: theme.cardBackground,
                        borderColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)",
                        color: theme.primary,
                        boxShadow: `0 0 20px ${theme.primary}40`,
                    }}
                >
                    <IconPlus size={20} stroke={3} />
                </button>
            )}
        </div>
    );
});
