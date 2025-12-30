import React, { memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, TimelineBentoContent } from "@/types/presentation";
import { useAppSelector } from "@/store/hooks";
import { selectTheme, DEFAULT_THEME } from "@/store/slices/slidesSlice";
import { createTimelineBentoItem } from "../definitions/timeline-bento-block";
import { IconPlus } from "@tabler/icons-react";

interface TimelineBentoBlockProps {
    block: Block;
    onUpdate: (content: any) => void;
    theme?: Theme;
    readOnly?: boolean;
}

export const TimelineBentoBlock = memo(function TimelineBentoBlock({
    block,
    onUpdate,
    theme: themeProp,
    readOnly = false,
}: TimelineBentoBlockProps) {
    const reduxTheme = useAppSelector(selectTheme);
    const theme = themeProp || reduxTheme || DEFAULT_THEME;
    const isDark = theme.themeType === "dark";

    const content = block.content as TimelineBentoContent;
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
        const newItem = createTimelineBentoItem();
        onUpdate({
            ...content,
            items: [...items, newItem],
        });
    };

    return (
        <div className="group relative w-full h-full min-h-[400px] py-4">
            {/* Responsive Vertical Timeline Line */}
            <div
                className="absolute left-8 md:left-1/2 top-0 bottom-0 md:-translate-x-1/2"
                style={{
                    width: "3px",
                    background: isDark
                        ? `linear-gradient(180deg, transparent 0%, ${theme.primary || "#3b82f6"} 10%, ${theme.primary || "#3b82f6"} 90%, transparent 100%)`
                        : `linear-gradient(180deg, transparent 0%, ${theme.primary || "#3b82f6"} 10%, ${theme.primary || "#3b82f6"} 90%, transparent 100%)`,
                    opacity: 0.6,
                }}
            />

            {/* Timeline Items */}
            <div className="relative space-y-8">
                {items.map((item, index) => {
                    const isLeft = index % 2 === 0;

                    return (
                        <div key={item.id} className="relative flex flex-col md:flex-row w-full items-start md:items-center">
                            {/* Left Side Container */}
                            <div className={`${isLeft ? 'w-full pl-20 pr-4 md:w-1/2 md:pl-0 md:pr-8 md:justify-end' : 'hidden md:flex md:w-1/2'} flex`}>
                                {isLeft && (
                                    <div className="w-full md:max-w-[90%]">
                                        <div
                                            className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                                            style={{
                                                background: theme.cardBackground,
                                                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                                                boxShadow: isDark
                                                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                                                    : `0 4px 20px ${theme.primary}15`,
                                            }}
                                        >
                                            {/* Title Editor */}
                                            <div className="mb-3">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-title`}
                                                    blockId={`${item.id}-title`}
                                                    value={item.title}
                                                    onChange={(value) => handleItemUpdate(index, "title", value)}
                                                    placeholder="Item"
                                                    readOnly={readOnly}
                                                    theme={theme}
                                                    className="text-xl font-semibold"
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
                                    </div>
                                )}
                            </div>

                            {/* Timeline Dot (Responsive Position) */}
                            <div
                                className="absolute left-8 md:left-1/2 md:-translate-x-1/2 z-10 top-6 md:top-1/2 md:-translate-y-1/2"
                                style={{
                                    width: "16px",
                                    height: "16px",
                                }}
                            >
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{
                                        backgroundColor: theme.primary || "#3b82f6",
                                        boxShadow: `0 0 0 4px ${isDark ? "#1a1a1a" : "#ffffff"}, 0 0 0 6px ${theme.primary || "#3b82f6"}40, 0 0 20px ${theme.primary || "#3b82f6"}60`,
                                    }}
                                />
                            </div>

                            {/* Right Side Container */}
                            <div className={`${!isLeft ? 'w-full pl-20 pr-4 md:w-1/2 md:pl-8 md:justify-start' : 'hidden md:flex md:w-1/2'} flex`}>
                                {!isLeft && (
                                    <div className="w-full md:max-w-[90%]">
                                        <div
                                            className="rounded-xl p-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                                            style={{
                                                background: theme.cardBackground,
                                                border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
                                                boxShadow: isDark
                                                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                                                    : `0 4px 20px ${theme.primary}15`,
                                            }}
                                        >
                                            {/* Title Editor */}
                                            <div className="mb-3">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-title`}
                                                    blockId={`${item.id}-title`}
                                                    value={item.title}
                                                    onChange={(value) => handleItemUpdate(index, "title", value)}
                                                    placeholder="Item"
                                                    readOnly={readOnly}
                                                    theme={theme}
                                                    className="text-xl font-semibold"
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
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Item Button */}
            {!readOnly && (
                <div className="relative flex justify-center mt-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={handleAddItem}
                        className="group relative flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{
                            background: theme.cardBackground,
                            backdropFilter: "blur(12px)",
                            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                            boxShadow: isDark
                                ? "0 4px 20px rgba(0,0,0,0.4)"
                                : `0 4px 20px ${theme.primary}15`,
                        }}
                    >
                        <div
                            className="flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-90"
                            style={{
                                background: theme.primary || "#3b82f6",
                                color: "#fff",
                            }}
                        >
                            <IconPlus size={14} stroke={3} />
                        </div>
                        <span
                            className="text-sm font-semibold"
                            style={{ color: isDark ? "#fff" : "#1a1a1a" }}
                        >
                            Add Event
                        </span>
                    </button>
                </div>
            )}
        </div>
    );
});
