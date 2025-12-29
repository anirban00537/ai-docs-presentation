
import React, { useCallback, useMemo, memo, useState } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme, ProseMirrorDocument } from "@/types/presentation";
import {
    type OutlineOffsetIconContent,
    createOutlineOffsetIconContent,
} from "../definitions";
import { DynamicIcon } from "../../ui/DynamicIcon";
import { IconPickerModal } from "../../ui/IconPickerModal";

interface OutlineOffsetIconBlockProps {
    block: Block;
    onUpdate: (content: OutlineOffsetIconContent) => void;
    theme: Theme;
    placeholder?: string;
    readOnly?: boolean;
}

export const OutlineOffsetIconBlock = memo(function OutlineOffsetIconBlock({
    block,
    onUpdate,
    theme,
    placeholder,
    readOnly = false,
}: OutlineOffsetIconBlockProps) {
    const content = block.content as OutlineOffsetIconContent;
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const iconName = content?.icon ?? "Zap";

    const editorContent = useMemo(() => {
        return content?.editorContent ?? createOutlineOffsetIconContent().editorContent;
    }, [content?.editorContent]);

    const handleEditorChange = useCallback(
        (newEditorContent: ProseMirrorDocument) => {
            if (readOnly) return;
            onUpdate({
                ...content,
                type: "outline-offset-icon-block",
                editorContent: newEditorContent,
            });
        },
        [content, onUpdate, readOnly]
    );

    const handleIconSelect = useCallback(
        (newIcon: string) => {
            onUpdate({
                ...content,
                type: "outline-offset-icon-block",
                icon: newIcon,
            });
        },
        [content, onUpdate]
    );


    return (
        <>
            <div
                className="w-full h-full relative p-2 transition-all duration-300 hover:p-1" // Subtle shrink on hover to emphasize the outer border
            >
                {/* Outer Border Frame */}
                <div
                    className="absolute inset-0 rounded-xl border-2 opacity-30 pointer-events-none"
                    style={{ borderColor: theme.primary }}
                />

                {/* Main Card */}
                <div
                    className="w-full h-full relative rounded-lg border flex flex-col items-center text-center p-8 transition-all duration-300 hover:shadow-md"
                    style={{
                        backgroundColor: theme.cardBackground,
                        borderColor: `${theme.primary}50`, // Stronger inner border
                    }}
                >
                    {/* Floating Icon Badge - overlapping top border */}
                    <div
                        className="absolute -top-6 left-1/2 -translate-x-1/2 p-2 z-10"
                        style={{ backgroundColor: theme.cardBackground ?? '#ffffff' }} // Mask the border behind it
                    >
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center border shadow-sm relative group cursor-pointer"
                            style={{
                                backgroundColor: theme.cardBackground,
                                borderColor: theme.primary,
                                color: theme.primary
                            }}
                            onClick={() => !readOnly && setIsPickerOpen(true)}
                        >
                            <DynamicIcon name={iconName} size={20} />
                            {/* Icon Editor Overlay */}
                            {!readOnly && (
                                <div
                                    className="absolute inset-[-4px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-2 border-dashed border-primary/50"
                                    title="Change icon"
                                />
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="pt-4 w-full">
                        <ProseMirrorEditor
                            key={block.id}
                            blockId={block.id}
                            value={editorContent}
                            onChange={handleEditorChange}
                            placeholder={placeholder ?? "Specification details..."}
                            className="prose-sm leading-relaxed text-center"
                            readOnly={readOnly}
                            theme={theme}
                        />
                    </div>
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
