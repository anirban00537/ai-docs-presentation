import { nanoid } from "nanoid";
import {
    TimelineBentoContentSchema,
    type TimelineBentoContent,
    type TimelineBentoItem,
} from "@/types/presentation";

export const createTimelineBentoItem = (): TimelineBentoItem => ({
    id: nanoid(),
    title: "## Item",
    description: "Description",
});

export const createTimelineBentoContent = (): TimelineBentoContent => ({
    type: "timeline-bento-block",
    items: [
        createTimelineBentoItem(),
        createTimelineBentoItem(),
        createTimelineBentoItem(),
        createTimelineBentoItem(),
    ],
});

export const normalizeTimelineBentoContent = (
    content: any
): TimelineBentoContent => {
    if (!content || typeof content !== "object") {
        return createTimelineBentoContent();
    }

    const result = TimelineBentoContentSchema.safeParse(content);

    if (result.success) {
        return result.data;
    }

    return createTimelineBentoContent();
};
