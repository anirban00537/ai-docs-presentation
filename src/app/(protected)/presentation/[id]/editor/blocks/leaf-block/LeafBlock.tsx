import React, { useCallback, useMemo, memo } from "react";
import { ProseMirrorEditor } from "@/components/prosemirror";
import type { Block, Theme } from "@/types/presentation";
import {
    type LeafBlockContent,
    createLeafBlockContent,
} from "../definitions";
import { CommonCard } from "../CommonCard";

interface LeafBlockProps {
    block: Block;
    onUpdate: (content: LeafBlockContent) => void;
    theme: Theme;
    placeholder?: string;
    readOnly?: boolean;
}

export const LeafBlock = memo(function LeafBlock({
    block,
    onUpdate,
    theme,
    placeholder,
    readOnly = false,
}: LeafBlockProps) {
    const content = block.content as LeafBlockContent;

    const editorContent = useMemo(() => {
        return (
            content?.editorContent ?? createLeafBlockContent().editorContent
        );
    }, [content?.editorContent]);

    const handleEditorChange = useCallback(
        (newEditorContent: any) => {
            if (readOnly) return;
            const newContent: LeafBlockContent = {
                type: "leaf-block",
                editorContent: newEditorContent,
            };
            onUpdate(newContent);
        },
        [onUpdate, readOnly]
    );

    return (
        <CommonCard
            theme={theme}
            className="w-full h-full"
        >
            <div
                className="relative w-full h-full group overflow-hidden flex flex-col p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                style={{
                    borderRadius: "0px 24px 0px 24px",
                    backgroundColor: theme.cardBackground,
                    border: theme.borderColor
                        ? `${theme.cardBorderWidth || "1px"} solid ${theme.borderColor}`
                        : theme.themeType === "dark"
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "1px solid rgba(0,0,0,0.1)",
                    boxShadow: theme.cardBoxShadow || "0 2px 8px rgba(0,0,0,0.05)",
                }}
            >


                <div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(circle at top right, ${theme.primary}0D, transparent 60%)`,
                    }}
                />

                {/* Content */}
                <div className="relative z-10 flex-1 min-w-0">
                    <ProseMirrorEditor
                        key={block.id}
                        blockId={block.id}
                        value={editorContent}
                        onChange={handleEditorChange}
                        placeholder={placeholder ?? "Type content..."}
                        className="text-base leading-relaxed tracking-tight"
                        theme={theme}
                        readOnly={readOnly}
                    />
                </div>

                {/* Accent Line */}
                <div
                    className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `linear-gradient(to right, ${theme.primary}40, transparent)`,
                        borderRadius: "0 0 0 24px"
                    }}
                />
            </div>
        </CommonCard>
    );
});
