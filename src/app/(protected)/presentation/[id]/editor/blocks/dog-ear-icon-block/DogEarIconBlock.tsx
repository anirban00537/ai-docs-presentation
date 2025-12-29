
import React, { useCallback, useMemo, memo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
    type DogEarIconContent,
    createDogEarIconContent,
} from "../definitions";
import { DynamicIcon } from "../../ui/DynamicIcon";
import { IconPickerModal } from "../../ui/IconPickerModal";
import { IconEdit } from "@tabler/icons-react";

interface DogEarIconBlockProps {
    block: Block;
    onUpdate: (content: DogEarIconContent) => void;
    theme: Theme;
    placeholder?: string;
    readOnly?: boolean;
}

export const DogEarIconBlock = memo(function DogEarIconBlock({
    block,
    onUpdate,
    theme,
    placeholder,
    readOnly = false,
}: DogEarIconBlockProps) {
    const content = block.content as DogEarIconContent;
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const iconName = content?.icon ?? "FileText";

    const editorContent = useMemo(() => {
        return content?.editorContent ?? createDogEarIconContent().editorContent;
    }, [content?.editorContent]);

    const handleEditorChange = useCallback(
        (newEditorContent: ProseMirrorDocument) => {
            if (readOnly) return;
            onUpdate({
                ...content,
                type: "dog-ear-icon-block",
                editorContent: newEditorContent,
            });
        },
        [content, onUpdate, readOnly]
    );

    const handleIconSelect = useCallback(
        (newIcon: string) => {
            onUpdate({
                ...content,
                type: "dog-ear-icon-block",
                icon: newIcon,
            });
        },
        [content, onUpdate]
    );

    const foldSize = "3rem";

    return (
        <>
            <div
                className="w-full h-full relative transition-all duration-300 hover:shadow-lg group"
                style={{
                    backgroundColor: theme.cardBackground,
                    borderRadius: "0.5rem",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
                }}
            >
                {/* Background Gradients/Texture */}
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `linear-gradient(135deg, ${theme.primary} 0%, transparent 100%)`
                    }}
                />

                {/* The Dog Ear Fold (CSS + SVG or ClipPath) */}
                <div
                    className="absolute top-0 right-0 z-20 transition-all duration-300 pointer-events-none"
                    style={{
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: `0 ${foldSize} ${foldSize} 0`,
                        borderColor: `transparent ${theme.pageBackground} transparent transparent`,
                        filter: "drop-shadow(-2px 2px 2px rgba(0,0,0,0.1))",
                    }}
                />
                <div
                    className="absolute top-0 right-0 z-20"
                    style={{
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: `${foldSize} 0 0 ${foldSize}`,
                        borderColor: `${theme.primary}30 transparent transparent transparent`, // The actual folded flap color
                        transformOrigin: "top right",
                    }}
                />

                {/* Icon Section (Top Left) */}
                <div className="pt-8 px-8 pb-4 flex items-center justify-between">
                    <div className="relative group/icon">
                        <div
                            className="w-12 h-12 flex items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                            style={{
                                backgroundColor: `${theme.primary}10`,
                                color: theme.primary
                            }}
                        >
                            <DynamicIcon name={iconName} size={26} />
                        </div>

                        {/* Icon Editor Trigger */}
                        {!readOnly && (
                            <button
                                onClick={() => setIsPickerOpen(true)}
                                className="absolute inset-0 w-full h-full opacity-0 group-hover/icon:opacity-100 transition-opacity flex items-center justify-center bg-black/40 rounded-xl cursor-pointer text-white"
                                title="Click to change icon"
                            >
                                <IconEdit size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-8 pb-8 pt-2 h-full flex-1">
                    <ProseMirrorEditor
                        key={block.id}
                        blockId={block.id}
                        value={editorContent}
                        onChange={handleEditorChange}
                        placeholder={placeholder ?? "Structure your content here..."}
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
