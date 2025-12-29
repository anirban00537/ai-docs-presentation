
import React, { useCallback, useMemo, memo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
    type SplitHeaderIconContent,
    createSplitHeaderIconContent,
} from "../definitions";
import { DynamicIcon } from "../../ui/DynamicIcon";
import { IconPickerModal } from "../../ui/IconPickerModal";

interface SplitHeaderIconBlockProps {
    block: Block;
    onUpdate: (content: SplitHeaderIconContent) => void;
    theme: Theme;
    placeholder?: string;
    readOnly?: boolean;
}

export const SplitHeaderIconBlock = memo(function SplitHeaderIconBlock({
    block,
    onUpdate,
    theme,
    placeholder,
    readOnly = false,
}: SplitHeaderIconBlockProps) {
    const content = block.content as SplitHeaderIconContent;
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const iconName = content?.icon ?? "Folder";

    const editorContent = useMemo(() => {
        return content?.editorContent ?? createSplitHeaderIconContent().editorContent;
    }, [content?.editorContent]);

    const handleEditorChange = useCallback(
        (newEditorContent: ProseMirrorDocument) => {
            if (readOnly) return;
            onUpdate({
                ...content,
                type: "split-header-icon-block",
                editorContent: newEditorContent,
            });
        },
        [content, onUpdate, readOnly]
    );

    const handleIconSelect = useCallback(
        (newIcon: string) => {
            onUpdate({
                ...content,
                type: "split-header-icon-block",
                icon: newIcon,
            });
        },
        [content, onUpdate]
    );

    // Derive styling
    const isDark = theme.themeType === 'dark';

    return (
        <>
            <div
                className="w-full h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden group"
                style={{
                    backgroundColor: theme.cardBackground,
                    borderRadius: "20px",
                    border: `1px solid ${theme.primary}15`,
                    // No box shadow
                }}
            >
                {/* Decorative Accent Background */}
                <div 
                    className="absolute top-0 left-0 w-full h-32 opacity-10 pointer-events-none transition-opacity duration-500 group-hover:opacity-20"
                    style={{
                        background: `radial-gradient(circle at 10% 20%, ${theme.primary}40 0%, transparent 60%)`,
                        filter: "blur(20px)"
                    }}
                />

                {/* Top Header Section */}
                <div
                    className="w-full py-2 px-4 flex items-center gap-3 relative z-10"
                    style={{
                        borderBottom: `1px solid ${theme.primary}10`,
                        background: `linear-gradient(to right, ${theme.primary}05, transparent)`
                    }}
                >
                    {/* Icon Container - Compact & Flat */}
                    <div
                        className="relative cursor-pointer transition-all duration-300 group-hover:scale-110 group-hover:rotate-[360deg] rounded-lg p-1.5"
                        style={{ 
                            backgroundColor: theme.cardBackground,
                            color: theme.primary,
                            // No box shadow
                        }}
                        onClick={() => !readOnly && setIsPickerOpen(true)}
                    >
                        <DynamicIcon name={iconName} size={20} stroke={1.5} />
                        
                        {/* Subtle ring accent */}
                        <div className="absolute inset-0 rounded-lg border border-primary/10" />

                        {/* Icon Editor Overlay */}
                        {!readOnly && (
                            <div
                                className="absolute inset-[-4px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border-2 border-dashed border-primary/30 z-20"
                                title="Click to change icon"
                            />
                        )}
                    </div>

                    {/* Decorative Line Accent */}
                    <div className="flex-1 h-px w-full" style={{ background: `linear-gradient(to right, ${theme.primary}40, transparent)` }} />
                    
                    {/* Modern Dot Indicators - Smaller */}
                    <div className="flex gap-1 opacity-30">
                        <div className="w-1 h-1 rounded-full bg-current transition-all duration-300 group-hover:bg-primary" style={{ color: theme.primary }} />
                        <div className="w-1 h-1 rounded-full bg-current transition-all duration-300 group-hover:bg-primary delay-75" style={{ color: theme.primary }} />
                        <div className="w-1 h-1 rounded-full bg-current transition-all duration-300 group-hover:bg-primary delay-150" style={{ color: theme.primary }} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6 md:p-8 flex-1 relative z-10">
                    <ProseMirrorEditor
                        key={block.id}
                        blockId={block.id}
                        value={editorContent}
                        onChange={handleEditorChange}
                        placeholder={placeholder ?? "Group description..."}
                        className="prose-base leading-relaxed"
                        readOnly={readOnly}
                        theme={theme}
                    />
                </div>
            </div>

            <IconPickerModal
                open={isPickerOpen}
                onOpenChange={setIsPickerOpen}
                onSelect={handleIconSelect}
                currentIcon={iconName}
            />
        </>
    );
});
