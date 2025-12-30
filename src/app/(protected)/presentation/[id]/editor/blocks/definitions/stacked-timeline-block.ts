import { nanoid } from "nanoid";
import {
    StackedTimelineContentSchema,
    type StackedTimelineContent,
    type StackedTimelineItem,
} from "@/types/presentation";

export const createStackedTimelineItem = (): StackedTimelineItem => ({
    id: nanoid(),
    title: "## Item",
    description: "Description",
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
