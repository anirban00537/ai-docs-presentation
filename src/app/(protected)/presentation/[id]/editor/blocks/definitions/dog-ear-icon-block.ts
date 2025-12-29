
import { DogEarIconContent, getDefaultHeadingContent } from "@/types/presentation";

export const createDogEarIconContent = (): DogEarIconContent => ({
    type: "dog-ear-icon-block",
    icon: "FileText",
    editorContent: "### Memo Title\nThis is a generic block for important notes or documentation links.",
});

export const normalizeDogEarIconContent = (
    content: unknown
): DogEarIconContent => {
    const c = content as Partial<DogEarIconContent>;
    return {
        type: "dog-ear-icon-block",
        icon: c?.icon ?? "FileText",
        editorContent: c?.editorContent ?? "### Memo Title\nThis is a generic block for important notes or documentation links.",
    };
};
