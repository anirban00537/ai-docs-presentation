import { LeafBlockContentSchema, type LeafBlockContent } from "@/types/presentation";

import {
    normalizeToMarkdown,
    isLegacyProseMirrorFormat,
} from "@/lib/markdown/prosemirror-converter";

export const createLeafBlockContent = (
    title: string = "Title",
    description: string = "This is a leaf card. It has a unique shape and style."
): LeafBlockContent => ({
    type: "leaf-block",
    editorContent: `**${title}**: ${description}`,
});

export const normalizeLeafBlockContent = (
    content: any
): LeafBlockContent => {
    if (!content || typeof content !== "object") return createLeafBlockContent();

    const editorContent = isLegacyProseMirrorFormat(content.editorContent)
        ? normalizeToMarkdown(content.editorContent)
        : typeof content.editorContent === "string"
            ? content.editorContent
            : createLeafBlockContent().editorContent;

    const result = LeafBlockContentSchema.safeParse({
        ...content,
        editorContent,
    });

    if (result.success) {
        return result.data;
    }

    return createLeafBlockContent();
};
