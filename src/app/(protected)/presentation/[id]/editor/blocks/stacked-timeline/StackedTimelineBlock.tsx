import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, StackedTimelineContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createStackedTimelineItem } from "../definitions/stacked-timeline-block";
import { IconPlus } from "@tabler/icons-react";
import { getFontFamily } from "@/lib/fonts";

interface StackedTimelineBlockProps {
    block: Block;
    onUpdate: (content: any) => void;
    theme?: Theme;
    readOnly?: boolean;
}

export const StackedTimelineBlock = memo(function StackedTimelineBlock({
    block,
    onUpdate,
    theme: themeProp,
    readOnly = false,
}: StackedTimelineBlockProps) {
    const reduxTheme = useAppSelector(selectTheme);
    const theme = themeProp || reduxTheme || DEFAULT_THEME;
    const isDark = theme.themeType === "dark";

    const content = block.content as StackedTimelineContent;
    const items = content.items || [];

    const handleItemUpdate = (index: number, field: "title" | "description", value: string) => {
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
        const newItem = createStackedTimelineItem();
        onUpdate({
            ...content,
            items: [...items, newItem],
        });
    };


    return (
        <div 
            className="group relative w-full h-full min-h-[300px] px-10 py-0"
            style={{
                fontFamily: getFontFamily(theme.fontFamily || "Inter"),
            }}
        >
            <div 
                className="w-full h-full flex flex-col items-center gap-0 shadow-sm border"
                style={{
                    background: theme.cardBackground,
                    borderColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    borderRadius: "12px",
                }}
            >
                {/* Decorative Side Accents */}
                <div className="absolute left-10 top-0 bottom-0 w-1 opacity-10" style={{ background: theme.primary }} />
                <div className="absolute right-10 top-0 bottom-0 w-1 opacity-10" style={{ background: theme.primary }} />
                
                {items.map((item, index) => (
                    <React.Fragment key={item.id}>
                        {/* Item Card */}
                        <div 
                            className="relative w-full pl-10 pr-8 py-5 transition-all duration-500 group/item hover:bg-white/[0.02] dark:hover:bg-white/[0.02]"
                            style={{
                                borderBottom: index < items.length - 1 ? `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}` : "none",
                            }}
                        >
                            {/* Number Indicator - Unique design element */}
                            <div 
                                className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold z-20 shadow-lg border transition-transform group-hover/item:scale-110"
                                style={{
                                    background: theme.cardBackground,
                                    borderColor: theme.primary,
                                    color: theme.primary,
                                }}
                            >
                                {index + 1}
                            </div>

                        {/* Selector Handle */}
                        <div className="absolute top-2 right-4 opacity-0 group-hover/item:opacity-100 transition-opacity z-20">
                            <div className="bg-white/90 dark:bg-black/90 backdrop-blur shadow-sm border border-gray-200 dark:border-gray-800 rounded-md px-2 py-0.5 flex items-center justify-center">
                                <span className="text-gray-400 text-xs font-bold tracking-widest text-[8px]">OPTIONS</span>
                            </div>
                        </div>

                        {/* Title Editor */}
                        <div className="mb-1">
                            <ProseMirrorEditor
                                key={`${item.id}-title`}
                                blockId={`${item.id}-title`}
                                value={item.title}
                                onChange={(value) => handleItemUpdate(index, "title", value)}
                                placeholder="Item"
                                readOnly={readOnly}
                                theme={theme}
                                className="text-xl font-serif font-medium"
                            />
                        </div>

                        {/* Description Editor */}
                        <div className="">
                            <ProseMirrorEditor
                                key={`${item.id}-description`}
                                blockId={`${item.id}-description`}
                                value={item.description}
                                onChange={(value) => handleItemUpdate(index, "description", value)}
                                placeholder="Description"
                                readOnly={readOnly}
                                theme={theme}
                                className="text-sm"
                            />
                        </div>
                    </div>

                    {/* Unique Connector - Linked Path */}
                    {index < items.length - 1 && (
                        <div className="relative w-full flex justify-center h-6 -my-3">
                            <div 
                                className="w-0.5 h-full opacity-30" 
                                style={{ background: `linear-gradient(to bottom, ${theme.primary}, transparent, ${theme.primary})` }}
                            />
                            <div 
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10"
                                style={{ background: theme.primary }}
                            />
                        </div>
                    )}
                </React.Fragment>
                ))}
            </div>

            {/* Float Add Button - Bottom Right */}
            {!readOnly && (
                <button
                    onClick={handleAddItem}
                    className="absolute bottom-6 right-6 h-10 w-10 flex items-center justify-center rounded-full shadow-lg border transition-all hover:scale-110 active:scale-95 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: theme.cardBackground,
                        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                        color: theme.primary,
                    }}
                >
                    <IconPlus size={20} stroke={2.5} />
                </button>
            )}

            {/* Left selector dots like in image */}
            {!readOnly && (
                <div className="absolute left-3 top-3 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
                     <div className="flex flex-col gap-1.5 p-1 rounded hover:bg-black/5">
                        <div className="w-1 h-1 rounded-full bg-black/60" />
                        <div className="w-1 h-1 rounded-full bg-black/60" />
                        <div className="w-1 h-1 rounded-full bg-black/60" />
                     </div>
                </div>
            )}
        </div>
    );
});
