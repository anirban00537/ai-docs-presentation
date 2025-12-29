
import { SplitHeaderIconContent, getDefaultHeadingContent } from "@/types/presentation";

export const createSplitHeaderIconContent = (): SplitHeaderIconContent => ({
    type: "split-header-icon-block",
    icon: "Folder",
    editorContent: "### Group Header\nOrganize your related content items or features here.",
});

export const normalizeSplitHeaderIconContent = (
    content: unknown
): SplitHeaderIconContent => {
    const c = content as Partial<SplitHeaderIconContent>;
    return {
        type: "split-header-icon-block",
        icon: c?.icon ?? "Folder",
        editorContent: c?.editorContent ?? "### Group Header\nOrganize your related content items or features here.",
    };
};
