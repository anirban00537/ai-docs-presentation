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
        <div className="group relative w-full h-full min-h-[600px] py-8">
            {/* Centered Vertical Timeline Line */}
            <div
                className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2"
                style={{
                    width: "3px",
                    background: isDark
                        ? `linear-gradient(180deg, transparent 0%, ${theme.primary || "#3b82f6"} 10%, ${theme.primary || "#3b82f6"} 90%, transparent 100%)`
                        : `linear-gradient(180deg, transparent 0%, ${theme.primary || "#3b82f6"} 10%, ${theme.primary || "#3b82f6"} 90%, transparent 100%)`,
                    opacity: 0.6,
                }}
            />

            {/* Timeline Items */}
            <div className="relative space-y-12">
                {items.map((item, index) => {
                    const isLeft = index % 2 === 0;

                    return (
                        <div key={item.id} className="relative flex w-full items-center">
                            {/* Left Side (50%) */}
                            <div className={`w-1/2 flex ${isLeft ? 'justify-end pr-8' : ''}`}>
                                {isLeft && (
                                    <div className="w-full max-w-[90%]">
                                        <div
                                            className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                            style={{
                                                background: isDark
                                                    ? "linear-gradient(135deg, rgba(156, 136, 255, 0.15) 0%, rgba(217, 160, 255, 0.1) 100%)"
                                                    : "linear-gradient(135deg, rgba(232, 221, 255, 0.6) 0%, rgba(245, 234, 255, 0.4) 100%)",
                                                border: `1px solid ${isDark ? "rgba(156, 136, 255, 0.2)" : "rgba(156, 136, 255, 0.15)"}`,
                                                boxShadow: isDark
                                                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                                                    : "0 4px 20px rgba(156, 136, 255, 0.1)",
                                            }}
                                        >
                                            {/* Title Editor */}
                                            <div className="mb-3">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-title`}
                                                    blockId={`${item.id}-title`}
                                                    value={item.title}
                                                    onChange={(value) => handleItemUpdate(index, "title", value)}
                                                    placeholder="## Item"
                                                    readOnly={readOnly}
                                                    theme={theme}
                                                />
                                            </div>

                                            {/* Description Editor */}
                                            <div className="opacity-70">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-description`}
                                                    blockId={`${item.id}-description`}
                                                    value={item.description}
                                                    onChange={(value) => handleItemUpdate(index, "description", value)}
                                                    placeholder="Description"
                                                    readOnly={readOnly}
                                                    theme={theme}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timeline Dot (Centered) */}
                            <div
                                className="absolute left-1/2 -translate-x-1/2 z-10"
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

                            {/* Right Side (50%) */}
                            <div className={`w-1/2 flex ${!isLeft ? 'justify-start pl-8' : ''}`}>
                                {!isLeft && (
                                    <div className="w-full max-w-[90%]">
                                        <div
                                            className="rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                            style={{
                                                background: isDark
                                                    ? "linear-gradient(135deg, rgba(156, 136, 255, 0.15) 0%, rgba(217, 160, 255, 0.1) 100%)"
                                                    : "linear-gradient(135deg, rgba(232, 221, 255, 0.6) 0%, rgba(245, 234, 255, 0.4) 100%)",
                                                border: `1px solid ${isDark ? "rgba(156, 136, 255, 0.2)" : "rgba(156, 136, 255, 0.15)"}`,
                                                boxShadow: isDark
                                                    ? "0 4px 20px rgba(0, 0, 0, 0.3)"
                                                    : "0 4px 20px rgba(156, 136, 255, 0.1)",
                                            }}
                                        >
                                            {/* Title Editor */}
                                            <div className="mb-3">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-title`}
                                                    blockId={`${item.id}-title`}
                                                    value={item.title}
                                                    onChange={(value) => handleItemUpdate(index, "title", value)}
                                                    placeholder="## Item"
                                                    readOnly={readOnly}
                                                    theme={theme}
                                                />
                                            </div>

                                            {/* Description Editor */}
                                            <div className="opacity-70">
                                                <ProseMirrorEditor
                                                    key={`${item.id}-description`}
                                                    blockId={`${item.id}-description`}
                                                    value={item.description}
                                                    onChange={(value) => handleItemUpdate(index, "description", value)}
                                                    placeholder="Description"
                                                    readOnly={readOnly}
                                                    theme={theme}
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
                <div className="relative flex justify-center mt-12 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                        onClick={handleAddItem}
                        className="group relative flex items-center gap-2 rounded-full px-5 py-2.5 transition-all duration-300 hover:scale-105 active:scale-95"
                        style={{
                            background: isDark ? "rgba(30, 30, 35, 0.8)" : "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(12px)",
                            border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"}`,
                            boxShadow: isDark
                                ? "0 4px 20px rgba(0,0,0,0.4)"
                                : "0 4px 20px rgba(0,0,0,0.1)",
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
