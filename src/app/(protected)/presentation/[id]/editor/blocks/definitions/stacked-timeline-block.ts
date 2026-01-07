import { nanoid } from "nanoid";
import {
    StackedTimelineContentSchema,
    type StackedTimelineContent,
    type StackedTimelineItem,
    createProseMirrorDoc,
} from "@/types/presentation";

export const createStackedTimelineItem = (): StackedTimelineItem => ({
    id: nanoid(),
    title: createProseMirrorDoc("Item", "heading", 4) as any,
    description: createProseMirrorDoc("Description") as any,
});

export const createStackedTimelineContent = (): StackedTimelineContent => ({
    type: "stacked-timeline-block",
    items: [
        createStackedTimelineItem(),
        createStackedTimelineItem(),
        createStackedTimelineItem(),
    ],
});

export const normalizeStackedTimelineContent = (
    content: any
): StackedTimelineContent => {
    if (!content || typeof content !== "object") {
        return createStackedTimelineContent();
    }

    const result = StackedTimelineContentSchema.safeParse(content);

    if (result.success) {
        return result.data;
    }

    return createStackedTimelineContent();
};
