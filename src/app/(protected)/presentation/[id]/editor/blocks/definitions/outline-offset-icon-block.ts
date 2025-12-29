
import { OutlineOffsetIconContent, getDefaultHeadingContent } from "@/types/presentation";

export const createOutlineOffsetIconContent = (): OutlineOffsetIconContent => ({
    type: "outline-offset-icon-block",
    icon: "Zap",
    editorContent: "### Specification\nDefine technical requirements or core values clearly.",
});

export const normalizeOutlineOffsetIconContent = (
    content: unknown
): OutlineOffsetIconContent => {
    const c = content as Partial<OutlineOffsetIconContent>;
    return {
        type: "outline-offset-icon-block",
        icon: c?.icon ?? "Zap",
        editorContent: c?.editorContent ?? "### Specification\nDefine technical requirements or core values clearly.",
    };
};
