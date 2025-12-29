
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
                className="w-full h-full flex flex-col transition-all duration-300 hover:shadow-lg overflow-hidden"
                style={{
                    backgroundColor: theme.cardBackground,
                    borderRadius: "16px",
                    border: `1px solid ${theme.primary}20`,
                }}
            >
                {/* Top Header Section */}
                <div
                    className="w-full py-6 px-8 flex items-center gap-4 border-b relative group"
                    style={{
                        backgroundColor: `${theme.primary}08`,
                        borderColor: `${theme.primary}15`
                    }}
                >
                    <div
                        className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3 relative cursor-pointer"
                        style={{ color: theme.primary }}
                        onClick={() => !readOnly && setIsPickerOpen(true)}
                    >
                        <DynamicIcon name={iconName} size={28} stroke={1.5} />
                        {/* Icon Editor Overlay */}
                        {!readOnly && (
                            <div
                                className="absolute inset-[-8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border-2 border-dashed border-primary/30"
                                title="Click to change icon"
                            />
                        )}
                    </div>

                    {/* Visual Flair in Header */}
                    <div className="flex-1" />
                    <div className="flex gap-1.5 opacity-40">
                        <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: theme.primary }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: theme.primary }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-current" style={{ color: theme.primary }} />
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 flex-1">
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
